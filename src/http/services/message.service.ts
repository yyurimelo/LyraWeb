import type { MessageResponseDto, SendMessageRequest } from "@/@types/message/message-types";
import { http, isAxiosError } from "@lyra/axios-config";
import { API_ENDPOINTS } from "../constants";

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
    response = await http.get(API_ENDPOINTS.MESSAGE.GET_MESSAGES_WITH_USER, {
      params: { friendId }
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
  }

  return response.data;
}
