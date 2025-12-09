import { useEffect, useState, useCallback } from "react"
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/auth-provider"
import type { MessageResponseDto } from "@/@types/signalr/hub-types"

interface UseSignalRMessagesProps {
  onMessage?: (msg: MessageResponseDto) => void
}

// Global references to ensure only one connection
const globalConnectionRef = { current: null as HubConnection | null }
const globalConnectionStateRef = { current: null as 'Disconnected' | 'Connecting' | 'Connected' | null }
const subscribers = new Set<(msg: MessageResponseDto) => void>()

export function useSignalRMessages({ onMessage }: UseSignalRMessagesProps = {}) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [, forceUpdate] = useState({})
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null

  const getConnectionState = useCallback(() => {
    return globalConnectionStateRef.current || 'Disconnected'
  }, [])

  const setConnectionState = useCallback((state: 'Disconnected' | 'Connecting' | 'Connected') => {
    globalConnectionStateRef.current = state
    forceUpdate({})
  }, [])

  // Subscribe to messages
  useEffect(() => {
    if (onMessage) {
      subscribers.add(onMessage)
      return () => {
        subscribers.delete(onMessage)
      }
    }
  }, [onMessage])

  useEffect(() => {
    if (!token || globalConnectionRef.current) return // já conectado ou sem token

    setConnectionState('Connecting')

    const signalRUrl = import.meta.env.VITE_API_URL.replace('/api', '')

    const connection = new HubConnectionBuilder()
      .withUrl(`${signalRUrl}/hubs/message`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build()

    globalConnectionRef.current = connection

    connection.onreconnecting(() => setConnectionState('Connecting'))
    connection.onreconnected(() => setConnectionState('Connected'))
    connection.onclose(() => {
      setConnectionState('Disconnected')
      globalConnectionRef.current = null
    })

    connection.on("ReceiveMessage", (msg: MessageResponseDto) => {
      // Determina o friendId correto
      const friendId = msg.senderId === user?.id ? msg.receiverId : msg.senderId

      // Atualiza mensagens no React Query sem duplicar
      queryClient.setQueryData(["messages", friendId], (old: MessageResponseDto[] | undefined) => {
        if (!old) return [msg]
        if (old.some(m => m.id === msg.id)) return old
        return [...old, msg]
      })

      // Atualiza a lista de amigos com otimização local em vez de invalidar
      queryClient.setQueryData(["chat"], (oldFriends: any[] | undefined) => {
        if (!oldFriends) return oldFriends

        return oldFriends.map(friend => {
          // Verifica se este amigo é o remetente ou destinatário da mensagem
          if (friend.id === msg.senderId || friend.id === msg.receiverId) {
            return {
              ...friend,
              lastMessage: msg.content,
              lastMessageAt: msg.sentAt
            }
          }
          return friend
        })
      })

      // Notifica todos os subscribers
      subscribers.forEach(callback => callback(msg))
    })

    connection.start()
      .then(() => setConnectionState('Connected'))
      .catch(err => {
        console.error("Erro ao conectar SignalR:", err)
        setConnectionState('Disconnected')
      })

    return () => {
      // Só limpa se não houver mais subscribers
      if (subscribers.size === 0) {
        connection.stop().catch(() => null)
        globalConnectionRef.current = null
      }
    }
  }, [token, user?.id, queryClient, setConnectionState])

  return { connectionState: getConnectionState() }
}