import type { FriendRequestFormModel } from "@/@types/friend-request/friend-request-form";
import type { FriendRequestDataModel } from "@/@types/friend-request/friend-request-data";
import { API_ENDPOINTS } from "../constants";
import { http, isAxiosError } from "@lyra/axios-config";
import type { FriendRequestFilter } from "@/@types/friend-request/friend-request-filter";
import type { PaginationDataModel } from "@/@types/pagination";

export async function sendFriendRequest({
  userIdentifier
}: FriendRequestFormModel) {
  let response: any;
  try {
    response = await http.post(API_ENDPOINTS.FRIEND_REQUEST.SEND, {
      receiverId: userIdentifier
    });
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
  }
  return response.data;
}

export async function acceptFriendRequest(requestId: number) {
  let response: any;
  try {
    response = await http.put(`${API_ENDPOINTS.FRIEND_REQUEST.ACCEPT}?requestId=${requestId}`);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
  }
  return response.data;
}

export async function cancelFriendRequest(requestId: number) {
  let response: any;
  try {
    response = await http.delete(`${API_ENDPOINTS.FRIEND_REQUEST.REMOVE}?requestId=${requestId}`);
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data);
    }
  }
  return response.data;
}

export async function checkFriendRequestStatus(otherUserId: string): Promise<FriendRequestDataModel | null> {
  let response: any;
  try {
    response = await http.get(`${API_ENDPOINTS.FRIEND_REQUEST.CHECK_REQUEST}?otherUserId=${otherUserId}`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data);
    }
  }
  return null;
}

export async function getFriendRequest(id: string): Promise<FriendRequestDataModel> {
  const response = await http.get(API_ENDPOINTS.FRIEND_REQUEST.GET(id));
  return response.data;
}

export async function getFriendRequestPaginated({
  name,
  pageNumber,
  pageSize,
}: FriendRequestFilter): Promise<PaginationDataModel<FriendRequestDataModel>> {
  const response = await http.post(
    API_ENDPOINTS.FRIEND_REQUEST.GET_ALL_PAGINATED,
    {
      name: name ? name : null,
    },
    {
      params: {
        pageNumber,
        pageSize,
      },
    },

  );

  return response.data;
}
