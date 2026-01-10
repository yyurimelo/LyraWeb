import type { UserGetAllFriendsDataModel } from '@/@types/user/user-get-all-friends'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/pt-br'
import { useTranslation } from 'react-i18next'

// Configure dayjs
dayjs.extend(relativeTime)
dayjs.locale('pt-br')

// components
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"

// helpers
import { getInitialName } from "@/lib/get-initial-name"
import { cn } from "@/lib/utils"
import { UserListSkeleton } from './user-list-skeleton'
import { CloudAlert } from 'lucide-react'

interface UserListProps {
  users: UserGetAllFriendsDataModel[]
  selectedUser: UserGetAllFriendsDataModel | null
  onUserSelect: (user: UserGetAllFriendsDataModel) => void
  isLoading: boolean
  error: any
}

const formatLastMessageTime = (date: Date | string, t: any, i18n: any) => {
  // Converte para UTC tratando strings corretamente
  const dateStr = typeof date === 'string' ? date : date.toISOString()
  // Verifica se já tem timezone, senão adiciona Z para tratar como UTC
  const finalDateStr = dateStr.includes('Z') || dateStr.includes('+') || (dateStr.includes('-', 10) && dateStr.length > 10)
    ? dateStr
    : dateStr + 'Z'
  const messageDate = dayjs(finalDateStr)
  const now = dayjs()

  const diffInMinutes = now.diff(messageDate, 'minute')
  const diffInHours = now.diff(messageDate, 'hour')
  const diffInDays = now.diff(messageDate, 'day')

  // Atualiza locale do dayjs
  dayjs.locale(
    i18n.language === 'pt-BR' || i18n.language === 'pt'
      ? 'pt-br'
      : 'en'
  )

  if (diffInMinutes < 1) {
    return t('time.now')
  }

  if (diffInMinutes < 60) {
    return t('time.minute', { count: diffInMinutes })
  }

  if (diffInHours < 24) {
    return t('time.hour', { count: diffInHours })
  }

  if (diffInDays < 7) {
    return t('time.day', { count: diffInDays })
  }

  return i18n.language === 'pt-BR' || i18n.language === 'pt'
    ? messageDate.format('DD/MM')
    : messageDate.format('MM/DD')
}


export function UserList({ users, selectedUser, onUserSelect, isLoading, error }: UserListProps) {
  const { t, i18n } = useTranslation()

  // Update dayjs locale based on current language
  const currentLanguage = i18n.language
  if (currentLanguage === 'pt-BR' || currentLanguage === 'pt') {
    dayjs.locale('pt-br')
  } else {
    dayjs.locale('en')
  }

  if (isLoading) {
    return (
      <UserListSkeleton count={6} />
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <CloudAlert className='text-destructive' />
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2 mt-5">
          <div className="text-muted-foreground text-sm">{t('chat.noConversations')}</div>
        </div>
      </div>
    )
  }

  const sortedUsers = [...users].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;

    // Função auxiliar para converter data UTC para timestamp
    const getUtcTimestamp = (dateStr: string) => {
      // Verifica se já tem timezone
      const finalDateStr = dateStr.includes('Z') || dateStr.includes('+') || (dateStr.includes('-', 10) && dateStr.length > 10)
        ? dateStr
        : dateStr + 'Z';
      return new Date(finalDateStr).getTime();
    };

    try {
      const dateA = getUtcTimestamp(a.lastMessageAt);
      const dateB = getUtcTimestamp(b.lastMessageAt);
      return dateB - dateA;
    } catch {
      return 0;
    }
  });

  return (
    <div className="overflow-y-auto h-full space-y-1 px-4 dark:[color-scheme:dark]">
      {sortedUsers.map((user) => (
        <div
          key={user.id}
          onClick={() => onUserSelect(user)}
          className={cn(
            "group relative flex items-start p-3 rounded-lg",
            "border border-transparent hover:bg-primary/15 hover:border hover:border-primary/30",
            "cursor-pointer",
            selectedUser?.id === user.id && "bg-primary/10 border border-primary/30"
          )}
        >

          <Avatar className="size-11 rounded-full transition-transform">
            <AvatarImage
              src={user.avatarUser}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback
              style={{ backgroundColor: user.appearancePrimaryColor || 'hsl(var(--primary))' }}
              className="text-secondary-foreground font-semibold text-sm"
            >
              {getInitialName(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 ml-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-mono text-foreground text-sm truncate">
                  {user.name}
                </h3>
              </div>
              {user.lastMessage && (
                <span className="text-xs text-muted-foreground font-medium flex-shrink-0 px-2 py-1">
                  {formatLastMessageTime(user.lastMessageAt!, t, i18n)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 -mt-1">
              <p className="text-sm text-muted-foreground truncate leading-relaxed">
                {user.lastMessage
                  ? user.lastMessage.slice(0, 200) + (user.lastMessage.length > 45 ? "..." : "")
                  : user.description || <span className="text-muted-foreground/60">{t('chat.noMessages')}</span>
                }
              </p>
            </div>
          </div>

        </div>
      ))}
    </div>
  )
}