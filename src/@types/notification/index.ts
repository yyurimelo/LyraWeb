export const NotificationTypeEnum = {
  INVITE_FRIEND: 'InviteFriend',
  ACCEPT_FRIEND_REQUEST: 'AcceptFriendRequest',
  NEW_MESSAGE: 'NewMessage',
  SYSTEM: 'System',
  WARNING: 'Warning'
} as const;

export type NotificationTypeEnum = typeof NotificationTypeEnum[keyof typeof NotificationTypeEnum];

export interface NotificationMessage {
  title: string;
  message: string;
}

export type NotificationStatus = 'read' | 'unread';

export interface ExtendedNotificationDataModel {
  id: string;
  type: NotificationTypeEnum;
  status: NotificationStatus;
  receiverId: string;
  receiverName?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationTab {
  id: 'all' | 'read' | 'unread';
  label: string;
  filter: NotificationStatus | null;
}

export interface NotificationState {
  isOpen: boolean;
  activeTab: NotificationTab['id'];
  unreadCount: number;
}