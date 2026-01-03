import { useEffect } from 'react'
import type { MessageResponseDto } from '@/@types/message/message-types'
import type { UserGetAllFriendsDataModel } from '@/@types/user/user-get-all-friends'
import { queryClient } from '@lyra/react-query-config'
import { API_ENDPOINTS } from '@/http/constants'
import { sendMessage as sendMessageService } from '@/http/services/message.service'
import { useSignalRBase } from '.'

interface FriendRealtimeDto {
  id: string
  name: string
  avatarUrl?: string
}

export function useSignalRMessages({
  userId,
  enabled,
  onMessage
}: {
  userId: string
  enabled?: boolean
  onMessage?: (message: MessageResponseDto) => void
}) {
  const { connection, connectionState } = useSignalRBase({
    hubUrl: import.meta.env.VITE_API_URL + API_ENDPOINTS.MESSAGE.HUB,
    userId,
    enabled
  })

  useEffect(() => {
    if (!connection) return

    /* =========================
       MENSAGENS
    ========================== */
    const handleReceiveMessage = (message: MessageResponseDto) => {
      const chatPartnerId =
        message.senderId === userId
          ? message.receiverId
          : message.senderId

      queryClient.setQueryData<MessageResponseDto[]>(
        ['messages', chatPartnerId],
        (old = []) =>
          old.some(m => m.id === message.id) ? old : [...old, message]
      )

      queryClient.setQueryData<UserGetAllFriendsDataModel[]>(
        ['chat'],
        (old = []) =>
          old.map(friend =>
            friend.id === message.senderId ||
            friend.id === message.receiverId
              ? {
                  ...friend,
                  lastMessage: message.content,
                  lastMessageAt: message.sentAt
                }
              : friend
          )
      )

      onMessage?.(message)
    }

    /* =========================
       AMIZADE ACEITA (🔥 AQUI)
    ========================== */
    const handleFriendAccepted = (friend: FriendRealtimeDto) => {
      queryClient.setQueryData<UserGetAllFriendsDataModel[]>(
        ['chat'],
        (old = []) => {
          // evita duplicar
          if (old.some(f => f.id === friend.id)) return old

          return [
            {
              id: friend.id,
              name: friend.name,
              avatarUrl: friend.avatarUrl,
              lastMessage: null,
              lastMessageAt: null,
              description: null
            },
            ...old
          ]
        }
      )
    }

    connection.on('ReceiveMessage', handleReceiveMessage)
    connection.on('FriendAccepted', handleFriendAccepted)

    return () => {
      connection.off('ReceiveMessage', handleReceiveMessage)
      connection.off('FriendAccepted', handleFriendAccepted)
    }
  }, [connection, userId, onMessage])

  return {
    connectionState,
    sendMessage: (receiverId: string, content: string) =>
      sendMessageService({ receiverId, content })
  }
}
