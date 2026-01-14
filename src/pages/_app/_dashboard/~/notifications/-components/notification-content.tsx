import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { CheckCheck } from "lucide-react";
import { Separator } from '@/shared/components/ui/separator';

// hooks
import { useNotificationsInfiniteQuery, useUnreadNotificationsCountQuery, useMaskAsReadMutation } from "@/shared/http/hooks/notification.hooks";

// components
import { NotificationInfiniteList } from "./notification-infinite-list";
import type { NotificationDataModel } from "@/@types/notification/notification-data-model";
import type { ExtendedNotificationDataModel } from "@/@types/notification";

interface NotificationContentProps {
  selectedType: string
  statusFilter: 'all' | 'unread' | 'read'
  onStatusChange: (status: 'all' | 'unread' | 'read') => void
}

export function NotificationContent({
  selectedType,
  statusFilter,
  onStatusChange,
}: NotificationContentProps) {
  const { t } = useTranslation()

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotificationsInfiniteQuery({
    status: statusFilter === 'all' ? undefined : (statusFilter === 'read' ? true : false),
    type: selectedType === 'all' ? '' : selectedType,
  })

  const { data: unreadCount } = useUnreadNotificationsCountQuery()
  const { mutateAsync: maskAsReadFn, isPending: isMarkingAsRead } = useMaskAsReadMutation()

  // Flatten infinite query data
  const notifications = data?.pages.flatMap(page => page.data) ?? []
  const totalRecords = data?.pages[0]?.totalRecords ?? 0

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => String(n.status) === 'unread')
      .map(n => Number(n.id))

    if (unreadIds.length === 0) return

    await maskAsReadFn(unreadIds)
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('notifications.title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalRecords} {totalRecords === 1 ? 'notificação' : 'notificações'}
              {unreadCount && unreadCount > 0 && ` • ${unreadCount} não lida${unreadCount > 1 ? 's' : ''}`}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAsRead || unreadCount === 0}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como lidas
          </Button>
        </div>

        <Separator />

        {/* Status Tabs */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onStatusChange('all')}
            className="h-9"
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 'unread' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onStatusChange('unread')}
            className="h-9"
          >
            Não lidos
            {unreadCount && unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant={statusFilter === 'read' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onStatusChange('read')}
            className="h-9"
          >
            Lidos
          </Button>
        </div>
      </div>

      {/* List with Scroll */}
      <div className="flex-1 overflow-y-auto px-6">
        <NotificationInfiniteList
          notifications={notifications as ExtendedNotificationDataModel[]}
          isLoading={isLoading}
          isError={isError}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={handleLoadMore}
          totalRecords={totalRecords}
        />
      </div>
    </div>
  )
}
