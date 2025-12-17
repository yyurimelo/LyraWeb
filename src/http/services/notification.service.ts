import type { NotificationDataModel } from "@/@types/notification/notification-data-model";
import type { NotificationFilter } from "@/@types/notification/notification-filter";
import type { PaginationDataModel } from "@/@types/pagination";
import { http } from "config/axios-config";
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
      status,
      type,
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