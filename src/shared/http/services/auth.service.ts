import { http, isAxiosError } from "@lyra/axios-config";
import type { AuthFormModel } from "@/@types/auth/auth-form-model";
import type { AuthUserDataModel } from "@/@types/auth/auth-user-data-model";

import { API_ENDPOINTS } from "@/shared/http/constants"

export async function authenticate({
  email,
  password,
}: AuthFormModel): Promise<AuthUserDataModel> {
  let response: any;
  try {
    response = await http.post(API_ENDPOINTS.AUTH.AUTHENTICATE, {
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
export async function googleAuthenticate(payload: { email: string, name: string, image: string, providerUserId: string }): Promise<AuthUserDataModel> {
  let response: any;
  try {
    response = await http.post(API_ENDPOINTS.AUTH.GOOGLE_AUTHENTICATE, {
      email: payload.email,
      name: payload.name,
      image: payload.image,
      providerUserId: payload.providerUserId
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
  }
  return response.data;
}

export async function getLoggedUser(): Promise<AuthUserDataModel> {
  const response = await http.get(API_ENDPOINTS.AUTH.GET_LOGGED_USER);

  return response.data;
}