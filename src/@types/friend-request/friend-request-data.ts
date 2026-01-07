export type FriendRequestDataModel = {
  id: number;
  senderId: string;
  senderName: string;
  senderAvatarUser?: string;
  senderPrimaryColor?: string;
  receiverId: string;
  receiverName: string;
  status: "Pending" | "Accepted";
  createdAt: Date;
};
