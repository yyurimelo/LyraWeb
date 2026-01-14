import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import { Loader2 } from "lucide-react";
import { NotificationItem } from "@/pages/_app/_dashboard/-components/header/notifications/notification-item";
import { NotificationEmpty } from "@/pages/_app/_dashboard/-components/header/notifications/notification-empty";
import { NotificationSkeleton } from "@/pages/_app/_dashboard/-components/header/notifications/notification-skeleton";
import type { ExtendedNotificationDataModel } from "@/@types/notification";

interface NotificationInfiniteListProps {
  notifications: ExtendedNotificationDataModel[]
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  totalRecords: number
}

export function NotificationInfiniteList({
  notifications,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  totalRecords,
}: NotificationInfiniteListProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <NotificationSkeleton />
        <NotificationSkeleton />
        <NotificationSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">
          Erro ao carregar notificações. Tente novamente mais tarde.
        </p>
      </div>
    )
  }

  if (notifications.length === 0) {
    return <NotificationEmpty />
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Notifications List */}
      <div className="space-y-1">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            activeTab={String(notification.status) === 'read' ? 'read' : 'unread'}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
            Carregar mais
          </Button>
        </div>
      )}

      {/* End of list */}
      {!hasNextPage && notifications.length > 0 && (
        <div className="text-center pt-4 text-sm text-muted-foreground">
            {notifications.length} de {totalRecords} notificações
        </div>
      )}
    </div>
  )
}
