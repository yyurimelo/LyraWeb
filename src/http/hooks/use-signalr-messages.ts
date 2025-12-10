import { HubConnectionBuilder, LogLevel, HubConnection, HttpTransportType } from '@microsoft/signalr'
import { useEffect, useState, useRef, useCallback } from 'react'
import type { MessageResponseDto } from '@/@types/message/message-types'
import type { UserGetAllFriendsDataModel } from '@/@types/user/user-get-all-friends'
import { queryClient } from '@lyra/react-query-config'
import type { ConnectionState } from '@/@types/signalr/hub-types'
import { toast } from 'sonner'
import { sendMessage as sendMessageService } from '../services/message.service'

// Helper function to update last message in friends cache
const updateFriendLastMessage = (message: MessageResponseDto, currentUserId: string) => {
  queryClient.setQueryData<UserGetAllFriendsDataModel[]>(
    ["chat"],
    (oldFriends = []) => {
      return oldFriends.map((friend) => {
        // Check if this friend is either the sender or receiver of the message
        const isFriendSender = friend.id === message.senderId
        const isFriendReceiver = friend.id === message.receiverId

        if (isFriendSender || isFriendReceiver) {
          console.log(`📝 Updating last message for friend ${friend.name}:`, message.content)
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
  onMessage?: (message: MessageResponseDto) => void
  onFriendUpdate?: (data: {
    friendId: string
    lastMessage: string
    sentAt: string
    senderId: string
    receiverId: string
  }) => void
}

export function useSignalR({ userId, onMessage, onFriendUpdate }: UseSignalRProps) {
  const connectionRef = useRef<HubConnection | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const isMountedRef = useRef(true)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const hasInitializedRef = useRef(false)

  const startConnection = useCallback(async () => {
    if (!userId || !isMountedRef.current) return

    // Get token from localStorage
    const token = localStorage.getItem('auth-token')
    if (!token) {
      console.error('No auth token found in localStorage')
      if (isMountedRef.current) setConnectionState('error')
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
      if (isMountedRef.current) setConnectionState('connecting')

      const backendUrl = import.meta.env.VITE_API_URL
      console.log(`Attempting to connect to SignalR at: ${backendUrl}/hubs/message`)
      console.log('User ID:', userId)
      console.log('Token exists:', !!token)

      const connection = new HubConnectionBuilder()
        .withUrl(`${backendUrl}/hubs/message`, {
          accessTokenFactory: () => {
            const currentToken = localStorage.getItem('auth-token')
            console.log('Providing token for SignalR connection')
            return currentToken || ''
          },
          transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            console.log(`SignalR retry attempt ${retryContext.previousRetryCount + 1}`)
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
          }
        })
        .configureLogging(LogLevel.Information)
        .build();

      // Event handlers
      connection.onreconnecting(error => {
        console.log('SignalR reconnecting... Error:', error)
        if (isMountedRef.current) setConnectionState('reconnecting')
      })

      connection.onreconnected(connectionId => {
        console.log('SignalR reconnected with connectionId:', connectionId)
        if (isMountedRef.current) {
          setConnectionState('connected')
          reconnectAttemptsRef.current = 0
        }
      })

      connection.onclose(error => {
        console.log('SignalR connection closed. Error:', error)
        if (isMountedRef.current) setConnectionState('disconnected')
      })

      // Listen for new messages
      connection.on('ReceiveMessage', (message: MessageResponseDto) => {
        console.log('📨 Received message via SignalR:', message)

        // Update React Query cache
        const isMyMessage = message.senderId === userId
        const chatPartnerId = isMyMessage ? message.receiverId : message.senderId

        // Update messages cache for the chat
        queryClient.setQueryData<MessageResponseDto[]>(
          ["messages", chatPartnerId],
          (oldMessages = []) => {
            // Check if message already exists
            const messageExists = oldMessages.some(msg => msg.id === message.id)
            if (messageExists) {
              console.log('Message already exists, skipping...')
              return oldMessages
            }

            console.log('Adding new message to cache:', message)
            // Adiciona nova mensagem no final (backend já ordena por data)
            return [...oldMessages, message]
          }
        )

        // Update last message in friends list for real-time update
        updateFriendLastMessage(message, userId)

        // Call custom handler if provided
        onMessage?.(message)
      })

      // Listen for friend list updates
      connection.on('UpdateFriendLastMessage', (message: MessageResponseDto) => {
        console.log('Friend last message updated:', message)

        // Determine which friend to update based on the current user
        const isMyMessage = message.senderId === userId
        const friendId = isMyMessage ? message.receiverId : message.senderId

        // Update last message in friends list for real-time update
        updateFriendLastMessage(message, userId)

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
      console.log('Starting SignalR connection...')
      await connection.start()

      if (isMountedRef.current) {
        console.log('✅ SignalR connected successfully!')
        setConnectionState('connected')
        connectionRef.current = connection
        reconnectAttemptsRef.current = 0
      }

    } catch (error) {
      console.error('❌ Error starting SignalR connection:', error)
      console.error('Connection error details:', {
        name: error?.name,
        message: error?.message,
        statusCode: error?.statusCode
      })

      reconnectAttemptsRef.current++

      if (isMountedRef.current) {
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('Max reconnection attempts reached')
          setConnectionState('error')
          toast.error('Falha ao conectar ao chat. Verifique sua conexão.')
          // Reset counter after some time to allow retries
          setTimeout(() => {
            if (isMountedRef.current && connectionState === 'error') {
              reconnectAttemptsRef.current = 0
              console.log('Resetting reconnection attempts - retrying...')
              startConnection()
            }
          }, 30000)
        } else {
          setConnectionState('disconnected')
          console.log(`Retrying connection in ${5 * reconnectAttemptsRef.current} seconds...`)
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
        console.log('SignalR connection stopped')
      } catch (error) {
        console.error('Error stopping SignalR connection:', error)
      }
      connectionRef.current = null
    }
    if (isMountedRef.current) setConnectionState('disconnected')
  }, [])

  // Initialize connection
  useEffect(() => {
    if (hasInitializedRef.current && connectionRef.current) {
      console.log('📡 SignalR already initialized, skipping...')
      return
    }

    isMountedRef.current = true

    if (userId) {
      console.log('📡 Initializing SignalR connection for userId:', userId)
      hasInitializedRef.current = true
      startConnection()
    } else {
      console.log('⚠️ No userId provided, skipping SignalR connection')
    }

    return () => {
      console.log('🧹 Cleaning up SignalR connection...')
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
    isConnected: connectionState === 'connected'
  }
}