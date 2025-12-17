import type { NotificationDataModel } from "@/@types/notification/notification-data-model";
import type { NotificationFilter } from "@/@types/notification/notification-filter";
import type { PaginationDataModel } from "@/@types/pagination";
import { http } from "@lyra/axios-config";
import { API_ENDPOINTS } from "../constants";

export async function getNotificationPaginated({
  status,
  type,
  pageNumber,
  pageSize,
}: NotificationFilter): Promise<PaginationDataModel<NotificationDataModel>> {
  // Build request payload, only including fields that are not null
  const payload: any = {};

  // Only include status if it's defined (not undefined)
  if (status !== undefined) {
    payload.status = status;
  }

  // Only include type if it's defined and not empty
  if (type !== undefined && type !== '') {
    payload.type = type;
  }

  const response = await http.post(
    API_ENDPOINTS.NOTIFICATION.GET_ALL_PAGINATED,
    payload,
    {
      params: {
        pageNumber,
        pageSize,
      },
    },
  );

  return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await http.get(API_ENDPOINTS.NOTIFICATION.GET_UNREAD_COUNT);
  return response.data;
}