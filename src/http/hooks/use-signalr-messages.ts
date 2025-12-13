import { HubConnectionBuilder, LogLevel, HubConnection, HttpTransportType } from '@microsoft/signalr'
import { useEffect, useState, useRef, useCallback } from 'react'
import type { MessageResponseDto } from '@/@types/message/message-types'
import type { UserGetAllFriendsDataModel } from '@/@types/user/user-get-all-friends'
import { queryClient } from '@lyra/react-query-config'
import { ConnectionState } from '@/@types/signalr/hub-types'
import { sendMessage as sendMessageService } from '../services/message.service'

// Helper function to update last message in friends cache
const updateFriendLastMessage = (message: MessageResponseDto) => {
  queryClient.setQueryData<UserGetAllFriendsDataModel[]>(
    ["chat"],
    (oldFriends = []) => {
      return oldFriends.map((friend) => {
        // Check if this friend is either the sender or receiver of the message
        const isFriendSender = friend.id === message.senderId
        const isFriendReceiver = friend.id === message.receiverId

        if (isFriendSender || isFriendReceiver) {
          return {
            ...friend,
            lastMessage: message.content,
            lastMessageAt: message.sentAt
          }
        }

        return friend
      })
    }
  )
}

interface UseSignalRProps {
  userId: string
  enabled?: boolean
  onMessage?: (message: MessageResponseDto) => void
  onFriendUpdate?: (data: {
    friendId: string
    lastMessage: string
    sentAt: string
    senderId: string
    receiverId: string
  }) => void
}

export function useSignalR({ userId, onMessage, onFriendUpdate, enabled }: UseSignalRProps) {
  const connectionRef = useRef<HubConnection | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const isMountedRef = useRef(true)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return
    if (!userId) return

    startConnection()

    return () => {
      stopConnection()
    }
  }, [userId, enabled])

  const startConnection = useCallback(async () => {
    if (!userId || !isMountedRef.current) return

    // Get token from localStorage
    const token = localStorage.getItem('auth-token')
    if (!token) {
      console.error('No auth token found in localStorage')
      if (isMountedRef.current) setConnectionState(ConnectionState.Error)
      return
    }

    // Stop existing connection if any
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop()
        connectionRef.current = null
      } catch (e) {
        console.log('Error stopping existing connection:', e)
      }
    }

    try {
      if (isMountedRef.current) setConnectionState(ConnectionState.Connecting)

      const backendUrl = import.meta.env.VITE_API_URL

      const connection = new HubConnectionBuilder()
        .withUrl(`${backendUrl}/hubs/message`, {
          accessTokenFactory: () => {
            const currentToken = localStorage.getItem('auth-token')
            return currentToken || ''
          },
          transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
          }
        })
        .configureLogging(LogLevel.Information)
        .build();

      // Event handlers
      connection.onreconnecting(error => {
        console.log('SignalR reconnecting... Error:', error)
        if (isMountedRef.current) setConnectionState(ConnectionState.Reconnecting)
      })

      connection.onreconnected(connectionId => {
        console.log('SignalR reconnected with connectionId:', connectionId)
        if (isMountedRef.current) {
          setConnectionState(ConnectionState.Connected)
          reconnectAttemptsRef.current = 0
        }
      })

      connection.onclose(error => {
        console.log('SignalR connection closed. Error:', error)
        if (isMountedRef.current) setConnectionState(ConnectionState.Disconnected)
      })

      // Listen for new messages
      connection.on('ReceiveMessage', (message: MessageResponseDto) => {

        // Update React Query cache
        const isMyMessage = message.senderId === userId
        const chatPartnerId = isMyMessage ? message.receiverId : message.senderId

        // Update messages cache for the chat
        queryClient.setQueryData<MessageResponseDto[]>(
          ["messages", chatPartnerId],
          (oldMessages = []) => {
            // Se ainda não veio a lista completa, não mexe
            if (oldMessages.length === 0) return oldMessages

            const exists = oldMessages.some(m => m.id === message.id)
            if (exists) return oldMessages

            return [...oldMessages, message]
          }
        )

        // Update last message in friends list for real-time update
        updateFriendLastMessage(message)

        // Call custom handler if provided
        onMessage?.(message)
      })

      // Listen for friend list updates
      connection.on('UpdateFriendLastMessage', (message: MessageResponseDto) => {

        // Determine which friend to update based on the current user
        const isMyMessage = message.senderId === userId
        const friendId = isMyMessage ? message.receiverId : message.senderId

        // Update last message in friends list for real-time update
        updateFriendLastMessage(message)

        // Call custom handler if provided
        onFriendUpdate?.({
          friendId,
          lastMessage: message.content,
          sentAt: message.sentAt,
          senderId: message.senderId,
          receiverId: message.receiverId
        })
      })

      // Start connection
      await connection.start()

      if (isMountedRef.current) {
        setConnectionState(ConnectionState.Connected)
        connectionRef.current = connection
        reconnectAttemptsRef.current = 0
      }

    } catch (error) {
      console.error('❌ SignalR connection error:', error)
      reconnectAttemptsRef.current++

      if (isMountedRef.current) {
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionState(ConnectionState.Error)
          // Reset counter after some time to allow retries
          setTimeout(() => {
            if (isMountedRef.current && connectionState === ConnectionState.Error) {
              reconnectAttemptsRef.current = 0
              console.log('Resetting reconnection attempts - retrying...')
              startConnection()
            }
          }, 30000)
        } else {
          setConnectionState(ConnectionState.Disconnected)
          // Retry after delay
          setTimeout(() => {
            if (isMountedRef.current) startConnection()
          }, 5000 * reconnectAttemptsRef.current)
        }
      }
    }
  }, [userId, onMessage, onFriendUpdate])

  const stopConnection = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop()
      } catch (error) {
        console.error('Error stopping SignalR connection:', error)
      }
      connectionRef.current = null
    }
    if (isMountedRef.current) setConnectionState(ConnectionState.Disconnected)
  }, [])

  // Initialize connection
  useEffect(() => {
    if (hasInitializedRef.current && connectionRef.current) {
      return
    }

    isMountedRef.current = true

    if (userId) {
      hasInitializedRef.current = true
      startConnection()
    } else {
      return
    }

    return () => {
      isMountedRef.current = false
      hasInitializedRef.current = false
      stopConnection()
    }
  }, [userId])

  const sendMessage = async (receiverId: string, content: string) => {
    // Send via HTTP API using the properly configured message service
    return await sendMessageService({ receiverId, content })
  }

  return {
    sendMessage,
    connectionState,
    isConnected: connectionState === ConnectionState.Connected
  }
}