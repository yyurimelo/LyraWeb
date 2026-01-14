import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
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
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      { threshold: 1.0 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

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

      {/* Loading indicator at bottom */}
      {(hasNextPage || isFetchingNextPage) && (
        <div ref={loadMoreRef} className="flex justify-center pt-4">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
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
