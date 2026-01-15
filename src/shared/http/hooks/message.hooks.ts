import { queryClient, useMutation, useQuery } from "@lyra/react-query-config"
import { sendMessage, getMessagesWithUser, removeMessages } from "../services/message.service"
import type { MessageResponseDto } from "@/@types/message/message-types"
import type { UserGetAllFriendsDataModel } from "@/@types/user/user-get-all-friends"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

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
          console.log(`📝 Updating last message for friend:`, message.content)
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

export const useGetMessagesQuery = (friendId: string | null) =>
  useQuery({
    queryKey: ["messages", friendId],
    queryFn: async () => {
      if (!friendId) return []
      return getMessagesWithUser(friendId)
    },
    enabled: !!friendId,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

export const useSendMessageMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMessage) => {
      // Update React Query cache with the new message
      const receiverId = newMessage.receiverId

      queryClient.setQueryData<MessageResponseDto[]>(
        ["messages", receiverId],
        (oldMessages = []) => {
          // Check if message already exists to avoid duplicates
          const messageExists = oldMessages.some(msg => msg.id === newMessage.id)
          if (messageExists) return oldMessages

          // Adiciona nova mensagem no final (backend já ordena por data)
          return [...oldMessages, newMessage]
        }
      )

      // Update last message in friends list for real-time update
      updateFriendLastMessage(newMessage)
    },
    onError: (error) => {
      toast.error(t('toasts.message.sendError'))
      console.error("Error sending message:", error)
    }
  })
};

export const useRemoveMessagesMutation = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ friendId, messageIds }: { friendId: string; messageIds: string[] }) =>
      removeMessages(friendId, messageIds),

    onMutate: async ({ friendId, messageIds }) => {
      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["messages", friendId] })

      // Snapshot previous messages for rollback
      const previousMessages = queryClient.getQueryData<MessageResponseDto[]>(["messages", friendId])

      // Optimistically remove messages from cache
      queryClient.setQueryData<MessageResponseDto[]>(
        ["messages", friendId],
        (oldMessages = []) => oldMessages.filter(msg => !messageIds.includes(msg.id))
      )

      return { previousMessages, friendId }
    },

    onError: (error, _variables, context) => {
      // Rollback to previous messages on error
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", context.friendId], context.previousMessages)
      }
      toast.error(t('toasts.message.deleteError'))
      console.error("Error deleting messages:", error)
    },

    onSuccess: () => {
      toast.success(t('toasts.message.deleteSuccess'))
    }
  })
}