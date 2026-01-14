import { useEffect } from 'react'
import type { MessageResponseDto } from '@/@types/message/message-types'
import type { UserGetAllFriendsDataModel } from '@/@types/user/user-get-all-friends'
import { queryClient } from '@lyra/react-query-config'
import { API_ENDPOINTS } from '@/shared/http/constants'
import { sendMessage as sendMessageService } from '@/shared/http/services/message.service'
import { useSignalRBase } from '.'

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
    const handleUpdateListFriend = () => {
      queryClient.invalidateQueries({ queryKey: ['chat'] })
    }

    const handleUpdateFriendRequest = () => {
      queryClient.invalidateQueries({ queryKey: ['friend-request'] })
      // Notificações já são atualizadas em tempo real via SignalR handlers
      // Não precisamos mais invalidar as queries aqui
    }

    connection.on('receivemessage', handleReceiveMessage)
    connection.on('updatelistfriend', handleUpdateListFriend)
    connection.on('updatefriendrequest', handleUpdateFriendRequest)

    return () => {
      connection.off('receivemessage', handleReceiveMessage)
      connection.off('updatelistfriend', handleUpdateListFriend)
      connection.off('updatefriendrequest', handleUpdateFriendRequest)
    }
  }, [connection, userId, onMessage])

  return {
    connectionState,
    sendMessage: (receiverId: string, content: string) =>
      sendMessageService({ receiverId, content })
  }
}