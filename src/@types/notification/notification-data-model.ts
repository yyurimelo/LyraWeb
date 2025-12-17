export type NotificationDataModel = {
  id: string;
  type: string;
  status: string;
  receiverId: string;
  receiverName?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}