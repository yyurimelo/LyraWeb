import type { UserDataModel } from "@/@types/user/user-data-model";
import type { UserFormModel } from "@/@types/user/user-form-model";
import type { UserUpdateModel } from "@/@types/user/user-form-update";
import type { UserGetAllFriendsDataModel } from "@/@types/user/user-get-all-friends";
import { http, isAxiosError } from "@lyra/axios-config";
import { API_ENDPOINTS } from "../constants";


export async function createUser({
  name,
  email,
  password,
}: UserFormModel): Promise<UserDataModel> {
  let response: any;
  try {
    response = await http.post(API_ENDPOINTS.USER.CREATE, {
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
  const response = await http.get(API_ENDPOINTS.USER.GET_ALL_FRIENDS);

  return response.data;
}

export async function getUser(id: string): Promise<UserDataModel> {
  const response = await http.get(API_ENDPOINTS.USER.GET(id));
  return response.data;
}


export async function updateUser({
  id,
  name,
  description,
  appearancePrimaryColor,
  appearanceTextPrimaryLight,
  appearanceTextPrimaryDark,
}: UserUpdateModel) {
  let response: any;
  try {
    response = await http.put(API_ENDPOINTS.USER.UPDATE,
      {
        name,
        description,
        appearancePrimaryColor,
        appearanceTextPrimaryLight,
        appearanceTextPrimaryDark,
      },
      {
        params: {
          id,
        },
      },
    );
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data || 'An error occurred while updating the user');
    }
    throw error;
  }
  return response.data;
}

export async function searchUserByUserIdentifier(userIdentifier: string): Promise<UserDataModel[]> {
  let response: any;
  try {
    response = await http.get(`${API_ENDPOINTS.USER.SEARCH}?userIdentifier=${userIdentifier}`);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data || 'Erro ao buscar usuários');
    }
    throw error;
  }

  if (!response?.data) {
    return [];
  }

  // Handle both single user and array responses
  const data = response.data;
  let result: UserDataModel[] = [];
  if (Array.isArray(data)) {
    result = data;
  } else if (data && typeof data === 'object') {
    // Check if data is wrapped in an object
    if (data.users && Array.isArray(data.users)) {
      result = data.users;
    } else if (data.data && Array.isArray(data.data)) {
      result = data.data;
    } else {
      result = [data];
    }
  }

  return result.filter(Boolean);
}

export async function removeFriend(userIdentifier: string) {
  let response: any;
  try {
    response = await http.delete(`${API_ENDPOINTS.USER.REMOVE}?userIdentifier=${userIdentifier}`);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
    throw error;
  }

  return response;
}