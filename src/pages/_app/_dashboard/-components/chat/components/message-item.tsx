import { useTranslation } from 'react-i18next'
import type { MessageResponseDto } from '@/@types/message/message-types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { ChevronDown } from 'lucide-react'

interface MessageItemProps {
  message: MessageResponseDto
  currentUserId: string | undefined
  isSelectionMode: boolean
  isSelected: boolean
  onToggleSelect: (messageId: string) => void
  onStartSelection: () => void
  formatMessageTime: (date: string | Date) => string
}

export function MessageItem({
  message,
  currentUserId,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onStartSelection,
  formatMessageTime,
}: MessageItemProps) {
  const { t } = useTranslation()

  const isFromMe = message.senderId === currentUserId 
  const isSelectable = isFromMe && !message.deletedAt

  const handleToggle = () => {
    if (!isSelectable) return
    onToggleSelect(message.id)
  }

  return (
    <div
      className={`
        flex ${isFromMe ? 'justify-end' : 'justify-start'}
        group relative
        ${isSelected ? 'bg-primary/10 dark:bg-primary/10 rounded-xl' : ''}
        ${isSelectionMode && isSelectable ? 'cursor-pointer' : ''}
      `}
      onClick={() => {
        if (isSelectionMode && isSelectable) {
          handleToggle()
        }
      }}
    >
      {/* Checkbox */}
      {isSelectionMode && isSelectable && (
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 pr-2 "
          onClick={(e) => e.stopPropagation()} // evita duplo toggle
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleToggle}
          />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`
          max-w-xs lg:max-w-md px-4 py-2 rounded-2xl
          ${isFromMe
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground border'}
          break-words
        `}
      >
        {message.content ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <p className="text-sm italic flex items-center gap-1 opacity-70">
            {t('chat.messageDeleted')}
          </p>
        )}

        <p
          className={`text-xs mt-1 justify-end flex ${isFromMe
            ? 'text-primary-foreground/70'
            : 'text-muted-foreground'
            }`}
        >
          {formatMessageTime(message.sentAt)}
        </p>
      </div>

      {/* Dropdown Menu */}
      {isFromMe && !isSelectionMode && !message.deletedAt && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="
    absolute top-0 -right-1 h-7 w-7 p-0
    opacity-0 group-hover:opacity-100 transition-opacity
    flex items-center justify-center
  "
              onClick={(e) => e.stopPropagation()}
            >
              <ChevronDown className="h-4 w-4 cursor-pointer" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onStartSelection}>
              {t('chat.menu.selectMessages')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
