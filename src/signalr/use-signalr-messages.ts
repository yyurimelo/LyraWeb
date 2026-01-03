import { useEffect } from 'react'
import type { MessageResponseDto } from '@/@types/message/message-types'
import type { UserGetAllFriendsDataModel } from '@/@types/user/user-get-all-friends'
import { queryClient } from '@lyra/react-query-config'
import { API_ENDPOINTS } from '@/http/constants'
import { sendMessage as sendMessageService } from '@/http/services/message.service'
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

    /* =========================
       MENSAGENS
    ========================== */
    const handleReceiveMessage = (message: MessageResponseDto) => {
      const chatPartnerId =
        message.senderId === userId
          ? message.receiverId
          : message.senderId

      // Atualiza as mensagens do chat específico
      queryClient.setQueryData<MessageResponseDto[]>(
        ['messages', chatPartnerId],
        (old = []) =>
          old.some(m => m.id === message.id) ? old : [...old, message]
      )

      // Atualiza a lista de amigos com a última mensagem
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
      console.log('🔔 Lista de amigos atualizada via SignalR')

      queryClient.invalidateQueries({ queryKey: ['chat'] })

      queryClient.invalidateQueries({ queryKey: ['friend-request'] })
    }

    connection.on('ReceiveMessage', handleReceiveMessage)
    connection.on('UpdateListFriend', handleUpdateListFriend)

    return () => {
      connection.off('ReceiveMessage', handleReceiveMessage)
      connection.off('UpdateListFriend', handleUpdateListFriend)
      console.log('🔌 SignalR listeners removidos')
    }
  }, [connection, userId, onMessage])

  return {
    connectionState,
    sendMessage: (receiverId: string, content: string) =>
      sendMessageService({ receiverId, content })
  }
}