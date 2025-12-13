import { queryClient, useMutation, useQuery } from "@lyra/react-query-config";
import { createUser, getAllFriends, getUser } from "../services/user.service";
import { toast } from "sonner";


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


export const useGetAllFriendsQuery = () =>
  useQuery({
    queryKey: ["chat"],
    queryFn: () => getAllFriends(),
  })

export const useGetUserQuery = (userId: string) => useQuery({
  queryKey: ["user-details", userId],
  queryFn: () => getUser(userId),
  enabled: userId !== null,
});
