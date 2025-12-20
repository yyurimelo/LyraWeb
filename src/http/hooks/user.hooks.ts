import { queryClient, useMutation, useQuery } from "@lyra/react-query-config";
import { createUser, getAllFriends, getUser, removeFriend, updateUser } from "../services/user.service";
import { toast } from "sonner";
import type { UserUpdateModel } from "@/@types/user/user-form-update";
import type { UserDataModel } from "@/@types/user/user-data-model";
import type { AuthUserDataModel } from "@/@types/auth/auth-user-data-model";


export const useCreateUserMutation = () =>
  useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      toast.success("Usuário criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

export const useRemoveFriendMutation = () =>
  useMutation({
    mutationFn: removeFriend,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["chat"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user-details"],
      });
      toast.success("Usuário removido com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });


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


export const useUpdateUserProfileMutation = (
  userId: string,
  setEdit: (edit: boolean) => void,
  updateAuthUser: (data: Partial<AuthUserDataModel>) => void,
  // currentUser: AuthUserDataModel | null // Pass current user directly
) =>
  useMutation<UserDataModel, Error, Omit<UserUpdateModel, 'id'>>({
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
      toast.success("Perfil atualizado com sucesso!")
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro ao atualizar o perfil.");
      }
    },
  });
