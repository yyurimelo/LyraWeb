export type FriendRequestDataModel = {
  id: number;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: "Pending" | "Accepted";
  createdAt: Date;
};
