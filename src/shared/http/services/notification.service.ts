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
  const response = await http.post(
    API_ENDPOINTS.NOTIFICATION.GET_ALL_PAGINATED,
    {
      status: status !== undefined ? (status ? "Read" : "Unread") : null,
      type: type ? type : null,
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

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await http.get(API_ENDPOINTS.NOTIFICATION.GET_UNREAD_COUNT);
  return response.data;
}

export async function maskAsRead(notificationIds: number[]): Promise<void> {
  await http.post(API_ENDPOINTS.NOTIFICATION.MASK_AS_READ, notificationIds);
}