export interface MessageResponseDto {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  receiverName: string
  content: string | null
  sentAt: string
  deletedAt?: string | null
  isLastMessageSentByMe?: boolean
}

export interface SendMessageRequest {
  receiverId: string
  content: string
}

export interface RemoveMessagesRequest {
  messageIds: string[]
}
