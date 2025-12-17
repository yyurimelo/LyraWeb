import { keepPreviousData, useQuery } from "config/react-query-config";
import { getNotificationPaginated } from "../services/notification.service";

export const useNotificationPaginationQuery = (filters: Record<string, any>) =>
  useQuery({
    queryKey: ["notifications", filters],
    queryFn: () =>
      getNotificationPaginated({
        status:
          filters.status !== "all"
            ? filters.status
            : null,
        type: filters.type ? filters.type : null,
        pageNumber: Number(filters.page),
        pageSize: Number(filters.pageSize),
      }),
    placeholderData: keepPreviousData,
  });