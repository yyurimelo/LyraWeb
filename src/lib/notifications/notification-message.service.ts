import { useTranslation } from 'react-i18next';
import { NotificationTypeEnum } from '@/@types/notification';
import type { NotificationMessage, ExtendedNotificationDataModel } from '@/@types/notification';

export const useNotificationMessage = () => {
  const { t } = useTranslation();

  const getNotificationMessage = (notification: ExtendedNotificationDataModel): NotificationMessage => {
    const creatorName = notification.createdByName || t('notifications.unknownUser');
    const receiverName = notification.receiverName || t('notifications.you');

    switch (notification.type) {
      case NotificationTypeEnum.INVITE_FRIEND:
        return {
          title: t('notifications.types.inviteFriend.title'),
          message: t('notifications.types.inviteFriend.message', {
            senderName: creatorName,
            receiverName
          })
        };

      case NotificationTypeEnum.ACCEPT_FRIEND_REQUEST:
        return {
          title: t('notifications.types.acceptFriendRequest.title'),
          message: t('notifications.types.acceptFriendRequest.message', {
            senderName: creatorName,
            receiverName
          })
        };

      case NotificationTypeEnum.NEW_MESSAGE:
        return {
          title: t('notifications.types.newMessage.title'),
          message: t('notifications.types.newMessage.message', {
            senderName: creatorName
          })
        };

      case NotificationTypeEnum.SYSTEM:
        return {
          title: t('notifications.types.system.title'),
          message: t('notifications.types.system.message', {
            content: notification.receiverName || ''
          })
        };

      case NotificationTypeEnum.WARNING:
        return {
          title: t('notifications.types.warning.title'),
          message: t('notifications.types.warning.message', {
            content: notification.receiverName || ''
          })
        };

      default:
        return {
          title: t('notifications.types.default.title'),
          message: t('notifications.types.default.message', {
            senderName: creatorName
          })
        };
    }
  };

  const getNotificationIcon = (type: NotificationTypeEnum): string => {
    switch (type) {
      case NotificationTypeEnum.INVITE_FRIEND:
        return '👥';
      case NotificationTypeEnum.ACCEPT_FRIEND_REQUEST:
        return '✅';
      case NotificationTypeEnum.NEW_MESSAGE:
        return '💬';
      case NotificationTypeEnum.SYSTEM:
        return '🔔';
      case NotificationTypeEnum.WARNING:
        return '⚠️';
      default:
        return '📢';
    }
  };

  const formatNotificationTime = (date?: Date): string => {
    if (!date) return t('notifications.time.justNow');

    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return t('notifications.time.justNow');
    } else if (diffInMinutes < 60) {
      return t('notifications.time.minutesAgo', { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('notifications.time.hoursAgo', { count: diffInHours });
    } else if (diffInDays < 7) {
      return t('notifications.time.daysAgo', { count: diffInDays });
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  return {
    getNotificationMessage,
    getNotificationIcon,
    formatNotificationTime
  };
};