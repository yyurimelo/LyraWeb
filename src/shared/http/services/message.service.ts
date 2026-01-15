import type { MessageResponseDto, SendMessageRequest, RemoveMessagesRequest } from "@/@types/message/message-types";
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

export async function removeMessages(
  friendId: string,
  messageIds: string[]
): Promise<MessageResponseDto[]> {
  try {
    const requestBody: RemoveMessagesRequest = {
      messageIds: messageIds
    }

    const response = await http.delete(
      API_ENDPOINTS.MESSAGE.REMOVE,
      {
        params: { friendId },
        data: requestBody,
      }
    );

    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? "Failed to remove messages");
    }
    throw error;
  }
}

