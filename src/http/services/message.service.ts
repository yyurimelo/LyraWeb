import type { MessageResponseDto, SendMessageRequest } from "@/@types/message/message-types";
import { http, isAxiosError } from "@lyra/axios-config";
import { API_ENDPOINTS } from "../constants";

const prefix = "/message";

export async function sendMessage({
  receiverId,
  content
}: SendMessageRequest): Promise<MessageResponseDto> {
  let response: any;
  try {
    response = await http.post(API_ENDPOINTS.MESSAGE.SEND, {
      receiverId,
      content
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
  }
  return response.data;
}

export async function getMessagesWithUser(
  friendId: string
): Promise<MessageResponseDto[]> {
  let response: any;

  try {
    response = await http.get(`${prefix}/get/all`, {
      params: { friendId }
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
  }

  return response.data;
}
