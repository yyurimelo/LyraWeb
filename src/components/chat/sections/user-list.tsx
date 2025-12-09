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
} from "@/components/ui/avatar";

// helpers
import { getInitialName } from "@/lib/get-initial-name";
import { cn } from "@/lib/utils";

interface UserListProps {
  users: UserGetAllFriendsDataModel[]
  selectedUser: UserGetAllFriendsDataModel | null
  onUserSelect: (user: UserGetAllFriendsDataModel) => void
  isLoading: boolean
  error: any
}

const formatLastMessageTime = (date: Date | string) => {
  const messageDate = dayjs(date)
  const now = dayjs()
  const diffInHours = now.diff(messageDate, 'hour')

  if (diffInHours < 1) {
    return "agora"
  } else if (diffInHours < 24) {
    return `${diffInHours}h`
  } else {
    const diffInDays = now.diff(messageDate, 'day')
    if (diffInDays < 7) {
      return `${diffInDays}d`
    } else {
      return messageDate.format('DD/MM')
    }
  }
}

export function UserList({ users, selectedUser, onUserSelect, isLoading, error }: UserListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-muted-foreground text-sm">Carregando conversas...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-destructive text-sm">Erro ao carregar conversas</div>
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

  return (
    <div className="overflow-y-auto h-full space-y-1 px-4 dark:[color-scheme:dark]">
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onUserSelect(user)}
          className={cn(
            "group relative flex items-start p-3 rounded-lg transition-all duration-200",
            "border border-transparent hover:bg-primary/20 hover:border hover:border-primary/50",
            "cursor-pointer",
            selectedUser?.id === user.id && "bg-primary/20 border border-primary/50"
          )}
        >

          <Avatar className="size-11 rounded-full transition-transform">
            <AvatarImage
              src={user.AvatarUser}
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