import { queryClient, useMutation, useQuery } from "@lyra/react-query-config";
import { sendFriendRequest, acceptFriendRequest, cancelFriendRequest, checkFriendRequestStatus } from "../services/friend-request.service";
import { toast } from "sonner";
import type { FriendRequestFormModel } from "@/@types/friend-request/friend-request-form";
import type { FriendRequestDataModel } from "@/@types/friend-request/friend-request-data";

// Helper function to update friends list cache
const updateFriendsListCache = () => {
  queryClient.invalidateQueries({
    queryKey: ["chat"],
  });
};

export const useSendFriendRequestMutation = () =>
  useMutation({
    mutationFn: ({ userIdentifier }: FriendRequestFormModel) =>
      sendFriendRequest({ userIdentifier }),
    onSuccess: async () => {
      // Invalidate friend request status cache
      queryClient.invalidateQueries({
        queryKey: ["friend-request"],
      });

      toast.success("Solicitação de amizade enviada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao enviar solicitação de amizade");
      console.error("Error sending friend request:", error);
    },
  });

export const useAcceptFriendRequestMutation = () =>
  useMutation({
    mutationFn: (requestId: number) => acceptFriendRequest(requestId),
    onSuccess: async () => {
      // Update friends list to include the new friend
      updateFriendsListCache();

      // Invalidate friend request status cache
      queryClient.invalidateQueries({
        queryKey: ["friend-request"],
      });

      toast.success("Solicitação de amizade aceita!");
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao aceitar solicitação de amizade");
      console.error("Error accepting friend request:", error);
    },
  });

export const useCancelFriendRequestMutation = () =>
  useMutation({
    mutationFn: (requestId: number) => cancelFriendRequest(requestId),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["friend-request"],
      });

      toast.success("Solicitação de amizade cancelada!");
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao cancelar solicitação de amizade");
      console.error("Error canceling friend request:", error);
    },
  });

export const useCheckFriendRequestQuery = (otherUserId: string | null, open?: boolean) =>
  useQuery<FriendRequestDataModel | null>({
    queryKey: ["friend-request", "status", otherUserId, open],
    queryFn: (): Promise<FriendRequestDataModel | null> => {
      if (!otherUserId) return Promise.resolve(null);
      return checkFriendRequestStatus(otherUserId);
    },
    enabled: !!otherUserId || open,
    refetchOnWindowFocus: true,
  });

export const useCheckFriendshipStatus = (otherUserId: string | null, open?: boolean) => {
  const { data: friendRequest, isLoading } = useCheckFriendRequestQuery(otherUserId, open);

  return {
    isPending: friendRequest?.status === "Pending",
    isAccepted: friendRequest?.status === "Accepted",
    noRequest: !friendRequest,
    isLoading,
    friendRequest,
  };
};