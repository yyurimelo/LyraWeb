export interface MessageResponseDto {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  content: string
  sentAt: string
}

export interface SendMessageRequest {
  receiverId: string
  content: string
}

export interface SignalREventMap {
  ReceiveMessage: (message: MessageResponseDto) => void
  UpdateFriendList: () => void
}