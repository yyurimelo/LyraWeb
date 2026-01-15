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
                lastMessageAt: message.sentAt,
                lastMessageDeletedAt: null
              }
              : friend
          )
      )

      onMessage?.(message)
    }

    const handleMessageUpdated = (message: MessageResponseDto) => {
      const chatPartnerId =
        message.senderId === userId
          ? message.receiverId
          : message.senderId

      queryClient.setQueryData<MessageResponseDto[]>(
        ['messages', chatPartnerId],
        (old = []) =>
          old.map(m =>
            m.id === message.id ? message : m
          )
      )

      // Check if this is a deleted message
      const isDeletedMessage = !message.content || message.deletedAt

      let lastMessageContent = message.content
      let lastMessageAt = message.sentAt
      let lastMessageDeletedAt: string | null | undefined = undefined

      if (isDeletedMessage) {
        // Fetch all messages from cache to check if this was the last message
        const messages = queryClient.getQueryData<MessageResponseDto[]>(['messages', chatPartnerId])

        if (messages && messages.length > 0) {
          // Find the most recent message (including deleted ones)
          const lastMessageInConversation = messages[messages.length - 1]

          // Check if the deleted message was the last message in the conversation
          const wasLastMessage = lastMessageInConversation.id === message.id

          if (wasLastMessage) {
            // The deleted message was the last one, mark as deleted
            lastMessageContent = ''
            lastMessageAt = message.sentAt
            lastMessageDeletedAt = message.deletedAt || message.sentAt
          } else {
            // The deleted message was NOT the last one, find and show the actual last message
            const activeMessages = messages.filter(m => m.content && !m.deletedAt)
            const lastActiveMessage = activeMessages[activeMessages.length - 1]

            if (lastActiveMessage) {
              lastMessageContent = lastActiveMessage.content
              lastMessageAt = lastActiveMessage.sentAt
              lastMessageDeletedAt = undefined
            }
          }
        }
      }

      queryClient.setQueryData<UserGetAllFriendsDataModel[]>(
        ['chat'],
        (old = []) =>
          old.map(friend =>
            friend.id === message.senderId ||
              friend.id === message.receiverId
              ? {
                ...friend,
                lastMessage: lastMessageContent,
                lastMessageAt: lastMessageAt,
                ...(lastMessageDeletedAt !== undefined && { lastMessageDeletedAt })
              }
              : friend
          )
      )
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
    connection.on('messageupdated', handleMessageUpdated)
    connection.on('updatelistfriend', handleUpdateListFriend)
    connection.on('updatefriendrequest', handleUpdateFriendRequest)

    return () => {
      connection.off('receivemessage', handleReceiveMessage)
      connection.off('messageupdated', handleMessageUpdated)
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