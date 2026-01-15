import { useTranslation } from 'react-i18next'
import type { MessageResponseDto } from '@/@types/message/message-types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { ChevronDown, MoreVertical } from 'lucide-react'

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
  const canSelect = isFromMe && !message.deletedAt && message.content

  return (
    <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'} group relative`}>
      {/* Selectable wrapper - includes checkbox and message bubble */}
      {isSelectionMode && canSelect ? (
        <div
          className={`flex items-center gap-2 cursor-pointer transition-all rounded-2xl px-2 py-1 ${
            isSelected ? 'bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
          }`}
          onClick={() => onToggleSelect(message.id)}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(message.id)}
          />
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
              isFromMe
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground border'
            } break-words`}
          >
            <p className="text-sm">{message.content}</p>
            <p
              className={`text-xs mt-1 justify-end flex ${
                isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}
            >
              {formatMessageTime(message.sentAt)}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Message Bubble (normal mode) */}
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
              isFromMe
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground border'
            } break-words`}
          >
            {message.content ? (
              <p className="text-sm">{message.content}</p>
            ) : (
              <p className="text-sm italic flex items-center gap-1 opacity-70">
                🔒 Mensagem apagada
              </p>
            )}
            <p
              className={`text-xs mt-1 justify-end flex ${
                isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}
            >
              {formatMessageTime(message.sentAt)}
            </p>
          </div>

          {/* Dropdown Menu - only on hover, only for user's messages */}
          {isFromMe && !isSelectionMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="absolute top-0 -right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={onStartSelection}>
                  {t('chat.menu.selectMessages')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  )
}
