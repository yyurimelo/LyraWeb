import { queryClient, useMutation, useQuery } from "@lyra/react-query-config";
import {
  sendMessage,
  getMessagesWithUser,
  removeMessages,
} from "../services/message.service";
import type { MessageResponseDto } from "@/@types/message/message-types";
import type { UserGetAllFriendsDataModel } from "@/@types/user/user-get-all-friends";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const updateFriendLastMessage = (message: MessageResponseDto) => {
  queryClient.setQueryData<UserGetAllFriendsDataModel[]>(
    ["chat"],
    (oldFriends = []) => {
      return oldFriends.map((friend) => {
        const isFriendSender = friend.id === message.senderId;
        const isFriendReceiver = friend.id === message.receiverId;
        if (isFriendSender || isFriendReceiver) {
          return {
            ...friend,
            lastMessage: message.content ?? undefined,
            lastMessageAt: message.sentAt,
            lastMessageDeletedAt: null,
            isLastMessageSentByMe: message.isLastMessageSentByMe,
          };
        }
        return friend;
      });
    },
  );
};

export const useGetMessagesQuery = (friendId: string | null) =>
  useQuery({
    queryKey: ["messages", friendId],
    queryFn: async () => {
      if (!friendId) return [];
      return getMessagesWithUser(friendId);
    },
    enabled: !!friendId,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

export const useSendMessageMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMessage) => {
      const receiverId = newMessage.receiverId;
      queryClient.setQueryData<MessageResponseDto[]>(
        ["messages", receiverId],
        (oldMessages = []) => {
          const messageExists = oldMessages.some(
            (msg) => msg.id === newMessage.id,
          );
          if (messageExists) return oldMessages;
          return [...oldMessages, newMessage];
        },
      );
      updateFriendLastMessage(newMessage);
    },
    onError: (error) => {
      toast.error(t("toasts.message.sendError"));
      console.error("Error sending message:", error);
    },
  });
};

export const useRemoveMessagesMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      friendId,
      messageIds,
    }: {
      friendId: string;
      messageIds: string[];
    }) => removeMessages(friendId, messageIds),
    onMutate: async ({ friendId, messageIds }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", friendId] });
      const previousMessages = queryClient.getQueryData<MessageResponseDto[]>([
        "messages",
        friendId,
      ]);
      const optimisticDeletedAt = new Date().toISOString();
      queryClient.setQueryData<MessageResponseDto[]>(
        ["messages", friendId],
        (oldMessages = []) =>
          oldMessages.map((msg) =>
            messageIds.includes(msg.id)
              ? {
                  ...msg,
                  content: null,
                  deletedAt: optimisticDeletedAt,
                }
              : msg,
          ),
      );
      return { previousMessages, friendId };
    },
    onError: (error, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", context.friendId],
          context.previousMessages,
        );
      }
      toast.error(t("toasts.message.deleteError"));
      console.error("Error deleting messages:", error);
    },
    onSuccess: (deletedMessages, { friendId }) => {
      queryClient.setQueryData<MessageResponseDto[]>(
        ["messages", friendId],
        (oldMessages = []) =>
          oldMessages.map((message) => {
            const updatedMessage = deletedMessages.find(
              (deletedMessage) => deletedMessage.id === message.id,
            );
            return updatedMessage ?? message;
          }),
      );
      toast.success(t("toasts.message.deleteSuccess"));
    },
  });
};
