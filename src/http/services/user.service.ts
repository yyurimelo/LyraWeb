import type { UserDataModel } from "@/@types/user/user-data-model";
import type { UserFormModel } from "@/@types/user/user-form-model";
import type { UserGetAllFriendsDataModel } from "@/@types/user/user-get-all-friends";
import { http, isAxiosError } from "@lyra/axios-config";

const prefix = "/user";

export async function createUser({
  name,
  email,
  password,
}: UserFormModel): Promise<UserDataModel> {
  let response: any;
  try {
    response = await http.post(`${prefix}/create`, {
      name,
      email,
      password,
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
  }
  return response.data;
}

export async function getAllFriends(): Promise<UserGetAllFriendsDataModel> {
  const response = await http.get(`${prefix}/get/all/friends`);

  return response.data;
}

export async function getUser(id: string): Promise<UserDataModel> {
  const response = await http.get(`${prefix}/get/${id}`);
  return response.data;
}

