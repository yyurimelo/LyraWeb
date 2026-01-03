import { queryClient, useMutation, useQuery } from "@lyra/react-query-config";
import { sendFriendRequest, acceptFriendRequest, cancelFriendRequest, checkFriendRequestStatus, getFriendRequest } from "../services/friend-request.service";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { FriendRequestFormModel } from "@/@types/friend-request/friend-request-form";
import type { FriendRequestDataModel } from "@/@types/friend-request/friend-request-data";

// Helper function to update friends list cache
const updateFriendsListCache = () => {
  queryClient.invalidateQueries({
    queryKey: ["chat"],
  });
};

// Helper function to update notifications cache (but NOT count, which is handled by SignalR)
const updateNotificationsCache = () => {
  queryClient.invalidateQueries({
    queryKey: ["notifications", "header"],
  });
};

export const useSendFriendRequestMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ userIdentifier }: FriendRequestFormModel) =>
      sendFriendRequest({ userIdentifier }),
    onSuccess: async () => {
      // Invalidate friend request status cache
      queryClient.invalidateQueries({
        queryKey: ["friend-request"],
      });

      // Update notifications cache
      updateNotificationsCache();

      toast.success(t('toasts.friendRequest.sendSuccess'));
    },
    onError: (error) => {
      toast.error(error.message || t('toasts.friendRequest.sendError'));
      console.error("Error sending friend request:", error);
    },
  });
};

export const useAcceptFriendRequestMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (requestId: number) => acceptFriendRequest(requestId),
    onSuccess: async () => {
      // Update friends list to include the new friend
      updateFriendsListCache();

      // Update notifications cache
      updateNotificationsCache();

      // Invalidate friend request status cache
      queryClient.invalidateQueries({
        queryKey: ["friend-request"],
      });

      toast.success(t('toasts.friendRequest.acceptSuccess'));
    },
    onError: (error) => {
      toast.error(error.message || t('toasts.friendRequest.acceptError'));
      console.error("Error accepting friend request:", error);
    },
  });
};

export const useCancelFriendRequestMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (requestId: number) => cancelFriendRequest(requestId),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["friend-request"],
      });

      // Update notifications cache
      updateNotificationsCache();

      toast.success(t('toasts.friendRequest.cancelSuccess'));
    },
    onError: (error) => {
      toast.error(error.message || t('toasts.friendRequest.cancelError'));
      console.error("Error canceling friend request:", error);
    },
  });
};

export const useCheckFriendRequestQuery = (otherUserId: string | null, open?: boolean) =>
  useQuery<FriendRequestDataModel | null>({
    queryKey: ["friend-request", "status", otherUserId, open],
    queryFn: (): Promise<FriendRequestDataModel | null> => {
      if (!otherUserId) return Promise.resolve(null);
      return checkFriendRequestStatus(otherUserId);
    },
    enabled: !!otherUserId && open,
    staleTime: 0,
  });

export const useCheckFriendshipStatus = (otherUserId: string | null, open?: boolean) => {
  const query = useCheckFriendRequestQuery(otherUserId, open);

  return {
    isPending: query.data?.status === "Pending",
    isAccepted: query.data?.status === "Accepted",
    noRequest: !query.data,
    isLoading: query.isLoading,
    friendRequest: query.data,
    refetch: query.refetch, // Expõe a função refetch
  };
};

export const useGetFriendRequestQuery = (friendRequestId: string | null, enabled: boolean = true) =>
  useQuery({
    queryKey: ["friend-request", friendRequestId],
    queryFn: () => getFriendRequest(friendRequestId!),
    enabled: !!friendRequestId && enabled,
    staleTime: 2 * 60 * 1000,
  });