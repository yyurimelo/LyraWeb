import { keepPreviousData, queryClient, useMutation, useQuery } from "@lyra/react-query-config";
import { sendFriendRequest, acceptFriendRequest, cancelFriendRequest, checkFriendRequestStatus, getFriendRequest, getFriendRequestPaginated } from "../services/friend-request.service";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { FriendRequestFormModel } from "@/@types/friend-request/friend-request-form";
import type { FriendRequestDataModel } from "@/@types/friend-request/friend-request-data";

export const useSendFriendRequestMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ userIdentifier }: FriendRequestFormModel) =>
      sendFriendRequest({ userIdentifier }),
    onSuccess: () => {
      // SignalR handles invalidation of ['friend-request'] and ['notifications', 'header'] automatically via UpdateFriendRequest event

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
    onSuccess: () => {
      // SignalR handles invalidation for the OTHER user via UpdateListFriend
      // But we need to invalidate OUR own friend list manually
      queryClient.invalidateQueries({
        queryKey: ["chat"],
      });

      // Invalidate query to remove accepted request from list
      queryClient.invalidateQueries({
        queryKey: ["friend-requests"],
        refetchType: "all",
      });

      // Clear all notification caches (matches all queries starting with ["notifications", ...])
      queryClient.resetQueries({
        queryKey: ["notifications"],
      });

      // Ensure header notifications are refetched immediately
      queryClient.invalidateQueries({
        queryKey: ["notifications", "header"],
        refetchType: "all",
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
    onSuccess: () => {
      // SignalR handles invalidation of ['friend-request'] automatically via UpdateFriendRequest event

      // Invalidate query to remove canceled request from list
      queryClient.invalidateQueries({
        queryKey: ["friend-requests"],
        refetchType: "all",
      });

      // Clear all notification caches (matches all queries starting with ["notifications", ...])
      queryClient.resetQueries({
        queryKey: ["notifications"],
      });

      // Ensure header notifications are refetched immediately
      queryClient.invalidateQueries({
        queryKey: ["notifications", "header"],
        refetchType: "all",
      });

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
    refetch: query.refetch, // Exposes the refetch function
  };
};

export const useGetFriendRequestQuery = (friendRequestId: string | null, enabled: boolean = true) =>
  useQuery({
    queryKey: ["friend-request", friendRequestId],
    queryFn: () => getFriendRequest(friendRequestId!),
    enabled: !!friendRequestId && enabled,
    staleTime: 2 * 60 * 1000,
  });

interface FriendRequestsQueryOptions {
  name?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export const useFriendRequestsQuery = ({
  name = "",
  page = 1,
  pageSize = 10,
  enabled = true,
}: FriendRequestsQueryOptions) => {
  return useQuery({
    queryKey: ["friend-requests", { name, page, pageSize }],
    queryFn: () =>
      getFriendRequestPaginated({
        name,
        pageNumber: page,
        pageSize,
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    staleTime: 0,
    enabled,
  });
};