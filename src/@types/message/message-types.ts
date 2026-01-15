export interface MessageResponseDto {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  content: string
  sentAt: string
  deletedAt?: string | null
}

export interface SendMessageRequest {
  receiverId: string
  content: string
}

export interface RemoveMessagesRequest {
  messageIds: string[]
}