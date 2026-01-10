import { useState, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
  sendButtonText?: string
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ onSendMessage, disabled, placeholder, sendButtonText }, ref) => {
    const { t } = useTranslation()
    const [messageInput, setMessageInput] = useState('')
    const [isSending, setIsSending] = useState(false)

    const handleSendMessage = async () => {
      if (!messageInput.trim() || disabled || isSending) return

      const messageContent = messageInput.trim()
      setMessageInput('')
      setIsSending(true)

      try {
        await onSendMessage(messageContent)
      } catch (error) {
        console.error('Error sending message:', error)
        // Revert message on error
        setMessageInput(messageContent)
      } finally {
        setIsSending(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSendMessage()
      }
    }

    return (
      <div className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <input
            ref={ref}
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('chat.typeMessage')}
            disabled={disabled || isSending}
            role="textbox"
            aria-multiline="false"
            aria-label={placeholder || t('chat.typeMessage')}
            className="flex-1 px-4 py-2 border border-input rounded-full bg-background focus:ring-2 focus:ring-primary disabled:opacity-50"
          />

          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || disabled || isSending}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:bg-muted transition-colors flex items-center gap-2"
          >
            {isSending && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {sendButtonText || t('chat.sendMessage')}
          </Button>
        </div>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'