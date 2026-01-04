import { queryClient, useMutation, useQuery } from "@lyra/react-query-config";
import { createUser, getAllFriends, getUser, getUserByName, getUserPublicId, removeFriend, updateUser } from "../services/user.service";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { UserUpdateModel } from "@/@types/user/user-form-update";
import type { UserDataModel } from "@/@types/user/user-data-model";
import type { AuthUserDataModel } from "@/@types/auth/auth-user-data-model";


export const useCreateUserMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      toast.success(t('toasts.user.createSuccess'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useRemoveFriendMutation = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      // SignalR handles invalidation of ['chat'] and ['friend-request'] automatically via UpdateListFriend and UpdateFriendRequest events

      // Invalidate user-details (no SignalR event for this)
      queryClient.invalidateQueries({
        queryKey: ["user-details"],
      });

      toast.success(t('toasts.user.removeSuccess'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};


export const useGetAllFriendsQuery = () =>
  useQuery({
    queryKey: ["chat"],
    queryFn: () => getAllFriends(),
  })

export const useGetUserQuery = (userId: string) => useQuery({
  queryKey: ["user-details", userId],
  queryFn: () => getUser(userId),
  enabled: !!userId, // Only run query if userId exists
  // Note: In dashboard, userId is usually guaranteed to exist, but we add safety check
});

export const useGetUserWithNameQuery = (name: string) => useQuery({
  queryKey: ["user", name],
  queryFn: () => getUserByName(name),
  enabled: !!name,
});

export const useGetUserPublicIdQuery = (userIdentifier: string | null, enabled: boolean = true) =>
  useQuery({
    queryKey: ["user", "public", userIdentifier],
    queryFn: () => getUserPublicId(userIdentifier!),
    enabled: !!userIdentifier && enabled,
    staleTime: 5 * 60 * 1000,
  });


export const useUpdateUserProfileMutation = (
  userId: string,
  setEdit: (edit: boolean) => void,
  updateAuthUser: (data: Partial<AuthUserDataModel>) => void,
  // currentUser: AuthUserDataModel | null // Pass current user directly
) => {
  const { t } = useTranslation();

  return useMutation<UserDataModel, Error, Omit<UserUpdateModel, 'id'>>({
    mutationFn: (data: Omit<UserUpdateModel, 'id'>) => {
      if (!userId) {
        throw new Error('User ID is required for updating profile');
      }
      return updateUser({ ...data, id: userId });
    },
    onSuccess: async (updatedUser) => {
      updateAuthUser({
        name: updatedUser.name,
        description: updatedUser.description,
        avatarUser: updatedUser.avatarUser,
        appearancePrimaryColor: updatedUser.appearancePrimaryColor,
        appearanceTextPrimaryDark: updatedUser.appearanceTextPrimaryDark,
        appearanceTextPrimaryLight: updatedUser.appearanceTextPrimaryLight,
      })

      await queryClient.invalidateQueries({
        queryKey: ["user-details", userId],
      })

      setEdit(false)
      toast.success(t('toasts.user.updateProfileSuccess'))
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('toasts.user.updateProfileError'));
      }
    },
  });
};
