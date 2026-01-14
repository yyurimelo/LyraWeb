import { keepPreviousData, queryClient, useMutation, useQuery } from "@lyra/react-query-config";
import { getNotificationPaginated, getUnreadNotificationCount, maskAsRead } from "../services/notification.service";
import { toast } from "sonner";
import { useState } from "react";
import { isAxiosError } from "@lyra/axios-config";
import { getFriendRequest } from "../services/friend-request.service";
import { getUserPublicId } from "../services/user.service";
import { NotificationTypeEnum } from "@/@types/notification";
import type { ExtendedNotificationDataModel } from "@/@types/notification";
import type { UserDataModel } from "@/@types/user/user-data-model";
import { useTranslation } from "react-i18next";

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
      // Invalida apenas as queries de paginação de notificações
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'header', 'unread']
      })

      queryClient.invalidateQueries({
        queryKey: ['notifications', 'header', 'read']
      })

      queryClient.invalidateQueries({
        queryKey: ['notifications', 'count', 'unread']
      })
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
    staleTime: 1000 * 60 * 5, // 5 minutos - considera os dados frescos por 5 min
    gcTime: 1000 * 60 * 10, // 10 minutos - mantém no cache por 10 min
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

interface UseNotificationClickResult {
  selectedUser: UserDataModel | null;
  userDetailsDialogOpen: boolean;
  isLoadingUser: boolean;
  setUserDetailsDialogOpen: (open: boolean) => void;
  handleNotificationClick: (notification: ExtendedNotificationDataModel) => Promise<void>;
}

export const useNotificationClick = (): UseNotificationClickResult => {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<UserDataModel | null>(null);
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const handleNotificationClick = async (notification: ExtendedNotificationDataModel) => {
    if (notification.type !== NotificationTypeEnum.INVITE_FRIEND) {
      return;
    }

    // Completed notifications are inactive - do nothing
    if (String(notification.status) === "Completed") {
      return;
    }

    if (!notification.referenceId) {
      return;
    }

    setIsLoadingUser(true);

    try {
      const friendRequest = await getFriendRequest(notification.referenceId);
      const senderId = friendRequest.senderId;

      if (!senderId) {
        console.error('Friend request has no senderId');
        toast.error(t('toasts.notification.notFound'));
        return;
      }

      const userData = await getUserPublicId(senderId);

      setSelectedUser(userData);
      setUserDetailsDialogOpen(true);

    } catch (error) {
      console.error('Error handling notification click:', error);
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          toast.error(t('toasts.notification.notFound'));
        } else {
          toast.error(error.response?.data || t('toasts.notification.loadDataError'));
        }
      } else {
        toast.error(t('toasts.notification.processError'));
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  return {
    selectedUser,
    userDetailsDialogOpen,
    isLoadingUser,
    setUserDetailsDialogOpen,
    handleNotificationClick,
  };
};