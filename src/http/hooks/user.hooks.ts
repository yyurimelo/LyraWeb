import { queryClient, useMutation } from "@lyra/react-query-config";
import { createUser } from "../services/user.service";
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