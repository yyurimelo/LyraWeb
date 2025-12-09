import { useMutation, useQuery, useQueryClient } from '@lyra/react-query-config'
import { getMessagesWithUser, sendMessage } from '../services/message.service'

import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-provider'
import type { MessageResponseDto, SendMessageRequest } from '@/@types/signalr/hub-types'

// Helper function to get user ID from token
const getCurrentUserId = () => {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('auth-token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.nameid || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
  } catch {
    return null
  }
}

export const useGetMessagesQuery = (friendId: string | null) => {
  return useQuery({
    queryKey: ['messages', friendId],
    queryFn: () => friendId ? getMessagesWithUser(friendId) : [],
    enabled: friendId !== null,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export const useSendMessageMutation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ receiverId, content }: SendMessageRequest) =>
      sendMessage({ receiverId, content }),
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({
        queryKey: ['messages', newMessage.receiverId]
      })

      const previousMessages = queryClient.getQueryData<MessageResponseDto[]>(
        ['messages', newMessage.receiverId]
      )

      const optimisticMessage: MessageResponseDto = {
        id: `temp-${Date.now()}-${Math.random()}`,
        senderId: getCurrentUserId() || '',
        senderName: user?.name || 'You',
        receiverId: newMessage.receiverId,
        receiverName: '',
        content: newMessage.content,
        sentAt: new Date().toISOString()
      }

      queryClient.setQueryData<MessageResponseDto[]>(
        ['messages', newMessage.receiverId],
        (old = []) => [...old, optimisticMessage]
      )

      // Atualiza a lista de amigos de forma otimista
      queryClient.setQueryData(['chat'], (oldFriends: any[] | undefined) => {
        if (!oldFriends) return oldFriends

        return oldFriends.map(friend => {
          // Verifica se este amigo é o destinatário da mensagem
          if (friend.id === newMessage.receiverId) {
            return {
              ...friend,
              lastMessage: newMessage.content,
              lastMessageAt: optimisticMessage.sentAt
            }
          }
          return friend
        })
      })

      return {
        previousMessages,
        optimisticMessageId: optimisticMessage.id,
        receiverId: newMessage.receiverId
      }
    },
    onError: (_err, _newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['messages', context.receiverId],
          context.previousMessages
        )
      }
      toast.error('Falha ao enviar mensagem')
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<MessageResponseDto[]>(
        ['messages', variables.receiverId],
        (old = []) => {
          // remove apenas a mensagem otimista referente a esta mutation
          const filtered = old.filter(m => m.id !== context?.optimisticMessageId)

          // adiciona a mensagem real
          return [...filtered, data]
        }
      )

      // Atualiza a lista de amigos com a mensagem enviada
      queryClient.setQueryData(['chat'], (oldFriends: any[] | undefined) => {
        if (!oldFriends) return oldFriends

        return oldFriends.map(friend => {
          // Verifica se este amigo é o destinatário da mensagem
          if (friend.id === variables.receiverId) {
            return {
              ...friend,
              lastMessage: data.content,
              lastMessageAt: data.sentAt
            }
          }
          return friend
        })
      })
    },
    onSettled: (_data, error, variables) => {
      if (error) {
        queryClient.invalidateQueries({
          queryKey: ['messages', variables.receiverId]
        })
      }
    },
  })
}

export const useInfiniteMessagesQuery = (friendId: string | null) => {
  return useQuery({
    queryKey: ['messages', 'infinite', friendId],
    queryFn: () => {
      return friendId ? getMessagesWithUser(friendId) : []
    },
    enabled: !!friendId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  })
}