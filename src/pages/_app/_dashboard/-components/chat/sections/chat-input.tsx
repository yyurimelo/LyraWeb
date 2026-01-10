import { useState, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { SendIcon } from 'lucide-react'
import { Spinner } from '@/shared/components/ui/spinner'

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
            type="submit"
            variant="default"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || disabled || isSending}
          >
            {isSending ? (
              <Spinner />
            ) : (
              <SendIcon />
            )}

          </Button>
        </div>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'