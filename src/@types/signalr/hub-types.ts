import type { MessageResponseDto } from '../message/message-types'

export interface MessageHub {
  on(event: 'ReceiveMessage', callback: (message: MessageResponseDto) => void): void
  on(event: 'UpdateFriendLastMessage', callback: (message: MessageResponseDto) => void): void
  off(event: 'ReceiveMessage', callback: (message: MessageResponseDto) => void): void
  off(event: 'UpdateFriendLastMessage', callback: (message: MessageResponseDto) => void): void
}

export const ConnectionState = {
  Disconnected: 'disconnected',
  Connecting: 'connecting',
  Connected: 'connected',
  Reconnecting: 'reconnecting',
  Error: 'error',
} as const

export type ConnectionState =
  typeof ConnectionState[keyof typeof ConnectionState]