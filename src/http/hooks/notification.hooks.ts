import { keepPreviousData, queryClient, useMutation, useQuery } from "@lyra/react-query-config";
import { getNotificationPaginated, getUnreadNotificationCount, maskAsRead } from "../services/notification.service";
import { toast } from "sonner";

export const useNotificationPaginationQuery = (filters: Record<string, any>) =>
  useQuery({
    queryKey: ["notifications", filters],
    queryFn: () =>
      getNotificationPaginated({
        status:
          filters.status !== "all"
            ? filters.status
            : undefined, // Changed from null to undefined
        type: filters.type ? filters.type : undefined, // Changed from null to undefined
        pageNumber: Number(filters.page),
        pageSize: Number(filters.pageSize),
      }),
    placeholderData: keepPreviousData,
  });

export const useMaskAsReadMutation = () =>
  useMutation({
    mutationFn: maskAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "count", "unread"],
      });

      queryClient.invalidateQueries({
        queryKey: ["notifications", "header"],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });


export const useAllNotificationsQuery = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["notifications", "header", "all"],
    queryFn: () =>
      getNotificationPaginated({
        pageNumber: 1,
        pageSize: 3,
      }),
    placeholderData: keepPreviousData,
    select: (data) => data.data,
    enabled: enabled,
  });

export const useUnreadNotificationsQuery = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["notifications", "header", "unread"],
    queryFn: () =>
      getNotificationPaginated({
        status: false,
        type: "",
        pageNumber: 1,
        pageSize: 3,
      }),
    placeholderData: keepPreviousData,
    select: (data) => data.data,
    enabled: enabled,
  });

// Hook for read notifications (max 5) - LAZY LOADING
export const useReadNotificationsQuery = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["notifications", "header", "read"],
    queryFn: () =>
      getNotificationPaginated({
        status: true, // true means read
        pageNumber: 1,
        pageSize: 3,
      }),
    placeholderData: keepPreviousData,
    select: (data) => data.data,
    enabled: enabled,
  });

export const useUnreadNotificationsCountQuery = () =>
  useQuery({
    queryKey: ["notifications", "count", "unread"],
    queryFn: () => getUnreadNotificationCount(),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

export const useNotificationsAdaptiveQuery = (isOpen: boolean, activeTab: 'all' | 'unread' | 'read') =>
  useQuery({
    queryKey: ["notifications", "header", activeTab],
    queryFn: () => {
      const statusMap = {
        all: undefined,
        unread: false,
        read: true
      };

      return getNotificationPaginated({
        status: statusMap[activeTab],
        pageNumber: 1,
        pageSize: 3,
      });
    },
    placeholderData: keepPreviousData,
    select: (data) => data.data,
    enabled: isOpen,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

export const useAllNotificationsLazyQuery = (enabled: boolean) =>
  useAllNotificationsQuery(enabled);

export const useUnreadNotificationsLazyQuery = (enabled: boolean) =>
  useUnreadNotificationsQuery(enabled);

export const useReadNotificationsLazyQuery = (enabled: boolean) =>
  useReadNotificationsQuery(enabled);