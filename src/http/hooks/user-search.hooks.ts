import { useMutation } from "@lyra/react-query-config";
import { searchUserByUserIdentifier } from "../services/user.service";

export const useUserSearchMutation = () =>
  useMutation({
    mutationFn: searchUserByUserIdentifier,
  });