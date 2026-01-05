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
  name,
  description,
  appearancePrimaryColor,
  appearanceTextPrimaryLight,
  appearanceTextPrimaryDark,
  avatar,
  removeAvatar,
}: UserUpdateModel & { avatar?: File | null; removeAvatar?: boolean }): Promise<UserDataModel> {
  try {
    const formData = new FormData()

    if (name) formData.append('name', name)
    if (description) formData.append('description', description)
    if (appearancePrimaryColor)
      formData.append('appearancePrimaryColor', appearancePrimaryColor)
    if (appearanceTextPrimaryLight)
      formData.append('appearanceTextPrimaryLight', appearanceTextPrimaryLight)
    if (appearanceTextPrimaryDark)
      formData.append('appearanceTextPrimaryDark', appearanceTextPrimaryDark)

    if (removeAvatar === true) {
      formData.append('removeAvatar', 'true')
    } else if (avatar instanceof File) {
      formData.append('avatar', avatar)
    }

    const response = await http.put(
      API_ENDPOINTS.USER.UPDATE,
      formData
    )

    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
        'An error occurred while updating the user'
      )
    }
    throw error
  }
}

export async function getUserPublicId(userIdentifier: string): Promise<UserDataModel> {
  let response: any;
  try {
    response = await http.get(`${API_ENDPOINTS.USER.GET_PUBLIC(userIdentifier)}`);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data || 'Erro ao buscar usuários');
    }
    throw error;
  }
  return response.data
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

export async function getUserByName(name: string): Promise<UserDataModel[]> {
  let response: any;
  try {
    response = await http.get(`${API_ENDPOINTS.USER.SEARCH}?name=${name}`);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data || 'Erro ao buscar usuários');
    }
    throw error;
  }
  return response.data
}