import { http, isAxiosError } from "@lyra/axios-config";
import type { AuthFormModel } from "@/@types/auth/auth-form-model";
import type { AuthUserDataModel } from "@/@types/auth/auth-user-data-model";

const prefix = "/auth";

export async function authenticate({
  email,
  password,
}: AuthFormModel): Promise<AuthUserDataModel> {
  let response: any;
  try {
    response = await http.post(`${prefix}`, {
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
export async function googleAuthenticate(email: string): Promise<AuthUserDataModel> {
  let response: any;
  try {
    response = await http.post(`${prefix}/google`, {
      email,
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
  }
  return response.data;
}

export async function getLoggedUser(): Promise<AuthUserDataModel> {
  const response = await http.get(`${prefix}/me`);

  return response.data;
}