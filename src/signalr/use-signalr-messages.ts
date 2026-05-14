import { useEffect } from "react";
import type { MessageResponseDto } from "@/@types/message/message-types";
import type { UserGetAllFriendsDataModel } from "@/@types/user/user-get-all-friends";
import { queryClient } from "@lyra/react-query-config";
import { API_ENDPOINTS } from "@/shared/http/constants";
import { useSignalRBase } from ".";

function updateFriendPreview(
  message: Pick<
    MessageResponseDto,
    | "senderId"
    | "receiverId"
    | "content"
    | "sentAt"
    | "deletedAt"
    | "isLastMessageSentByMe"
  >,
  options: {
    moveToTop: boolean;
  },
) {
  queryClient.setQueryData<UserGetAllFriendsDataModel[]>(
    ["chat"],
    (old = []) => {
      const updatedList = old.map((friend) =>
        friend.id === message.senderId || friend.id === message.receiverId
          ? {
              ...friend,
              lastMessage: message.content ?? undefined,
              lastMessageAt: message.sentAt,
              lastMessageDeletedAt: message.deletedAt ?? null,
              ...(typeof message.isLastMessageSentByMe !== "undefined"
                ? { isLastMessageSentByMe: message.isLastMessageSentByMe }
                : {}),
            }
          : friend,
      );
      if (!options.moveToTop) {
        return updatedList;
      }
      const updatedFriend = updatedList.find(
        (friend) =>
          friend.id === message.senderId || friend.id === message.receiverId,
      );
      if (!updatedFriend) return updatedList;
      const otherFriends = updatedList.filter(
        (friend) =>
          friend.id !== message.senderId && friend.id !== message.receiverId,
      );
      return [updatedFriend, ...otherFriends];
    },
  );
}

export function useSignalRMessages({
  userId,
  enabled,
  onMessage,
}: {
  userId: string;
  enabled?: boolean;
  onMessage?: (message: MessageResponseDto) => void;
}) {
  const { connection, connectionState } = useSignalRBase({
    hubUrl: import.meta.env.VITE_API_URL + API_ENDPOINTS.MESSAGE.HUB,
    userId,
    enabled,
  });

  useEffect(() => {
    if (!connection) return;

    const handleReceiveMessage = (message: MessageResponseDto) => {
      const chatPartnerId =
        message.senderId === userId ? message.receiverId : message.senderId;
      queryClient.setQueryData<MessageResponseDto[]>(
        ["messages", chatPartnerId],
        (old = []) =>
          old.some((m) => m.id === message.id) ? old : [...old, message],
      );
      onMessage?.(message);
    };

    const handleMessageUpdated = (message: MessageResponseDto) => {
      const chatPartnerId =
        message.senderId === userId ? message.receiverId : message.senderId;
      queryClient.setQueryData<MessageResponseDto[]>(
        ["messages", chatPartnerId],
        (old = []) => old.map((m) => (m.id === message.id ? message : m)),
      );
      const isDeletedMessage = !message.content || message.deletedAt;
      let lastMessageContent = message.content;
      let lastMessageAt = message.sentAt;
      let lastMessageDeletedAt: string | null | undefined = undefined;
      let isLastMessageSentByMe = message.isLastMessageSentByMe;
      if (isDeletedMessage) {
        const messages = queryClient.getQueryData<MessageResponseDto[]>([
          "messages",
          chatPartnerId,
        ]);
        if (messages && messages.length > 0) {
          const lastMessageInConversation = messages[messages.length - 1];
          const wasLastMessage = lastMessageInConversation.id === message.id;
          if (wasLastMessage) {
            lastMessageContent = "";
            lastMessageAt = message.sentAt;
            lastMessageDeletedAt = message.deletedAt || message.sentAt;
          } else {
            const activeMessages = messages.filter(
              (m) => m.content && !m.deletedAt,
            );
            const lastActiveMessage = activeMessages[activeMessages.length - 1];
            if (lastActiveMessage) {
              lastMessageContent = lastActiveMessage.content;
              lastMessageAt = lastActiveMessage.sentAt;
              lastMessageDeletedAt = undefined;
              isLastMessageSentByMe = lastActiveMessage.isLastMessageSentByMe;
            }
          }
        }
      }
      updateFriendPreview(
        {
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: lastMessageContent,
          sentAt: lastMessageAt,
          deletedAt: lastMessageDeletedAt,
          isLastMessageSentByMe,
        },
        { moveToTop: false },
      );
    };

    const handleUpdateFriendLastMessage = (message: MessageResponseDto) => {
      updateFriendPreview(message, { moveToTop: true });
    };

    const handleUpdateListFriend = () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    };

    const handleUpdateFriendRequest = () => {
      queryClient.invalidateQueries({ queryKey: ["friend-request"] });
    };

    connection.on("ReceiveMessage", handleReceiveMessage);
    connection.on("MessageUpdated", handleMessageUpdated);
    connection.on("UpdateListFriend", handleUpdateListFriend);
    connection.on("UpdateFriendRequest", handleUpdateFriendRequest);
    connection.on("UpdateFriendLastMessage", handleUpdateFriendLastMessage);
    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("MessageUpdated", handleMessageUpdated);
      connection.off("UpdateListFriend", handleUpdateListFriend);
      connection.off("UpdateFriendRequest", handleUpdateFriendRequest);
      connection.off("UpdateFriendLastMessage", handleUpdateFriendLastMessage);
    };
  }, [connection, userId, onMessage]);

  return {
    connectionState,
    isConnected: connectionState === "connected",
  };
}
