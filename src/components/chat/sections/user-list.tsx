import type { UserGetAllFriendsDataModel } from '../../../@types/user/user-get-all-friends'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/pt-br'

// Configure dayjs
dayjs.extend(relativeTime)
dayjs.locale('pt-br')

// components
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

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

const pluralize = (value: number, singular: string) => {
  return value === 1 ? singular : `${singular}s`
}

const formatLastMessageTime = (date: Date | string) => {
  const messageDate = dayjs(date)
  const now = dayjs()

  const diffInMinutes = now.diff(messageDate, 'minute')
  const diffInHours = now.diff(messageDate, 'hour')
  const diffInDays = now.diff(messageDate, 'day')

  if (diffInMinutes < 1) {
    return 'Now'
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${pluralize(diffInMinutes, 'minute')}`
  }

  if (diffInHours < 24) {
    return `${diffInHours} ${pluralize(diffInHours, 'hour')}`
  }

  if (diffInDays < 7) {
    return `${diffInDays} ${pluralize(diffInDays, 'day')}`
  }

  return messageDate.format('DD/MM')
}


export function UserList({ users, selectedUser, onUserSelect, isLoading, error }: UserListProps) {
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
          <div className="text-muted-foreground text-sm">Nenhuma conversa, contato ou mensagem encontrada</div>
        </div>
      </div>
    )
  }

  const sortedUsers = [...users].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;

    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  return (
    <div className="overflow-y-auto h-full space-y-1 px-4 dark:[color-scheme:dark]">
      {sortedUsers.map((user) => (
        <div
          key={user.id}
          onClick={() => onUserSelect(user)}
          className={cn(
            "group relative flex items-start p-3 rounded-lg",
            "border border-transparent hover:bg-primary/50 hover:border hover:border-primary",
            "cursor-pointer",
            selectedUser?.id === user.id && "bg-primary/50 border border-primary"
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
                  {formatLastMessageTime(user.lastMessageAt!)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 -mt-1">
              <p className="text-sm text-muted-foreground truncate leading-relaxed">
                {user.lastMessage
                  ? user.lastMessage.slice(0, 200) + (user.lastMessage.length > 45 ? "..." : "")
                  : user.description || <span className="text-muted-foreground/60">Sem mensagens</span>
                }
              </p>
            </div>
          </div>

        </div>
      ))}
    </div>
  )
}