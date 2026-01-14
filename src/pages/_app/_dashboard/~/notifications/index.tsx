import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Bell, UserPlus, UserCheck, Settings, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSignalRNotifications } from "@/signalr/use-signalr-notifications"
import { useAuth } from "@/contexts/auth-provider"

// components
import { Button } from "@/shared/components/ui/button"

// custom components

// hooks
import { useNotificationsInfiniteQuery, useUnreadNotificationsCountQuery, useMaskAsReadMutation } from "@/shared/http/hooks/notification.hooks"
import type { ExtendedNotificationDataModel } from '@/@types/notification'
import { NotificationInfiniteList } from './-components/notification-infinite-list'

export const Route = createFileRoute('/_app/_dashboard/~/notifications/')({
  component: NotificationsPage,
  head: () => ({
    meta: [
      {
        title: 'Notificações | Lyra Chat'
      },
    ],
  }),
})

type NotificationFilter = 'all' | 'friend-requests' | 'accepted-friends' | 'messages' | 'system'

interface FilterButtonProps {
  filter: NotificationFilter
  currentFilter: NotificationFilter
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  onClick: () => void
}

function FilterButton({ filter, currentFilter, icon: Icon, children, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-sm w-full text-left",
        "hover:bg-accent/30 hover:text-accent-foreground",
        "bg-background/80 transition-colors",
        currentFilter === filter && "bg-muted/50"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </button>
  )
}

function NotificationsPage() {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()

  useSignalRNotifications({
    userId: user?.userIdentifier ?? '',
    enabled: isAuthenticated,
  })

  const [filterType, setFilterType] = useState<NotificationFilter>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('unread')

  // Map filter type to notification type
  const getNotificationType = (filter: NotificationFilter): string => {
    switch (filter) {
      case 'all':
        return ''
      case 'friend-requests':
        return 'InviteFriend'
      case 'accepted-friends':
        return 'AcceptFriendRequest'
      case 'system':
        return 'System'
      default:
        return ''
    }
  }

  const notificationType = getNotificationType(filterType)

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotificationsInfiniteQuery({
    status: statusFilter === 'all' ? undefined : (statusFilter === 'read' ? true : false),
    type: notificationType,
  })

  const { data: unreadCount } = useUnreadNotificationsCountQuery()
  const { mutateAsync: maskAsReadFn, isPending: isMarkingAsRead } = useMaskAsReadMutation()

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

  const getFilterLabel = (filter: NotificationFilter) => {
    switch (filter) {
      case 'all':
        return t('notifications.filters.all')
      case 'friend-requests':
        return t('notifications.filters.friendRequests')
      case 'accepted-friends':
        return t('notifications.filters.acceptedFriends')
      case 'system':
        return t('notifications.filters.system')
    }
  }

  // Helper to determine if we should show friend request UI
  const showFriendRequestUI = filterType !== 'messages' && filterType !== 'system'

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-6xl">
      <div className='flex flex-col space-y-1 mb-6'>
        <h1 className="text-2xl font-bold">{t('notifications.page.title')}</h1>
        <p className='text-muted-foreground'>
          {t('notifications.page.description')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filter Navigation */}
        <nav className="flex flex-row lg:flex-col lg:w-64 lg:shrink-0 overflow-x-auto lg:overflow-x-visible">
          <div className='border rounded-md p-2 space-y-1 w-full'>
            <FilterButton
              filter="all"
              currentFilter={filterType}
              icon={Bell}
              onClick={() => setFilterType('all')}
            >
              {t('notifications.filters.all')}
            </FilterButton>
            <FilterButton
              filter="friend-requests"
              currentFilter={filterType}
              icon={UserPlus}
              onClick={() => setFilterType('friend-requests')}
            >
              {t('notifications.filters.friendRequests')}
            </FilterButton>
            <FilterButton
              filter="accepted-friends"
              currentFilter={filterType}
              icon={UserCheck}
              onClick={() => setFilterType('accepted-friends')}
            >
              {t('notifications.filters.acceptedFriends')}
            </FilterButton>
            <FilterButton
              filter="system"
              currentFilter={filterType}
              icon={Settings}
              onClick={() => setFilterType('system')}
            >
              {t('notifications.filters.system')}
            </FilterButton>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 min-w-0 border rounded-md p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {getFilterLabel(filterType)}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("notifications.count.label", { count: totalRecords })}

                {unreadCount! > 0 && filterType === "all" && (
                  <> • {t("notifications.count.unread", { count: unreadCount })}</>
                )}
              </p>
            </div>

            {showFriendRequestUI && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAsRead || statusFilter === 'read' || !unreadCount || unreadCount === 0}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                {t('notifications.actions.markAllAsRead')}
              </Button>
            )}
          </div>

          {/* Status Tabs */}
          {showFriendRequestUI ? (
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${statusFilter === 'all'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('notifications.tabs.all')}
              </button>
              <button
                onClick={() => setStatusFilter('unread')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${statusFilter === 'unread'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('notifications.tabs.unread')}
              </button>
              <button
                onClick={() => setStatusFilter('read')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${statusFilter === 'read'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('notifications.tabs.read')}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                {filterType === 'messages' ? `${t('notifications.filters.messages')} - ${t('notifications.comingSoon')}` : `${t('notifications.filters.system')} - ${t('notifications.comingSoon')}`}
              </p>
            </div>
          )}

          {/* List */}
          {showFriendRequestUI && (
            <NotificationInfiniteList
              notifications={notifications as ExtendedNotificationDataModel[]}
              isLoading={isLoading}
              isError={isError}
              hasNextPage={hasNextPage ?? false}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={handleLoadMore}
              totalRecords={totalRecords}
            />
          )}
        </main>
      </div>
    </div>
  )
}
