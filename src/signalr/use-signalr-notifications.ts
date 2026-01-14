import { useEffect } from 'react'
import { queryClient } from '@lyra/react-query-config'
import { API_ENDPOINTS } from '@/shared/http/constants'
import { useSignalRBase } from '.'

interface UseSignalRNotificationsProps {
  userId: string
  enabled?: boolean
}

// Helper function to add notification to infinite scroll cache
const addNotificationToCache = (notification: any) => (old: any) => {
  if (!old || !old.pages || old.pages.length === 0) {
    return old
  }

  const firstPage = old.pages[0]
  const exists = firstPage.data.some((n: any) => n.id === notification.id)
  if (exists) return old

  return {
    ...old,
    pages: [
      {
        ...firstPage,
        data: [notification, ...firstPage.data],
        totalRecords: firstPage.totalRecords + 1
      },
      ...old.pages.slice(1)
    ]
  }
}

// Helper function to remove notification from cache
const removeNotificationFromCache = (notificationId: number) => (old: any) => {
  if (!old || !old.pages) return old
  return {
    ...old,
    pages: old.pages.map((page: any) => ({
      ...page,
      data: page.data.filter((n: any) => String(n.id) !== String(notificationId)),
      totalRecords: Math.max(0, page.totalRecords - 1)
    }))
  }
}

// Helper function to update notification status in cache
const updateNotificationStatusInCache = (referenceId: number, status: string) => (old: any) => {
  if (!old || !old.pages) return old
  return {
    ...old,
    pages: old.pages.map((page: any) => ({
      ...page,
      data: page.data.map((n: any) =>
        String(n.referenceId) === String(referenceId)
          ? { ...n, status: status.toLowerCase() }
          : n
      )
    }))
  }
}

export function useSignalRNotifications({
  userId,
  enabled
}: UseSignalRNotificationsProps) {
  const backendUrl = import.meta.env.VITE_API_URL

  const { connection, connectionState, isConnected } = useSignalRBase({
    hubUrl: backendUrl + API_ENDPOINTS.NOTIFICATION.HUB,
    userId,
    enabled
  })

  useEffect(() => {
    if (!connection) return

    connection.on('notificationreceived', (notification: any) => {
      // Se não vier com dados, não faz nada
      if (!notification || !notification.id) {
        return
      }

      // Map backend payload to frontend model - handle both formats
      const mappedNotification = {
        id: String(notification.id),
        type: notification.type,
        status: notification.status?.toLowerCase() || 'unread',
        receiverId: notification.receiverId?.toString() || notification.receiverId,
        receiverName: notification.receiverName || notification.senderName,
        createdBy: notification.senderId?.toString() || notification.createdBy,
        createdByName: notification.senderName || notification.createdByName,
        createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date(),
        referenceType: notification.referenceType,
        referenceId: notification.referenceId ? String(notification.referenceId) : undefined,
        message: notification.message
      }

      // Add to unread list if status is unread
      if (mappedNotification.status === 'unread') {
        queryClient.setQueryData(['notifications', 'header', 'unread'], (old: any) => {
          if (!old) {
            return {
              data: [mappedNotification],
              totalRecords: 1
            }
          }

          // Check if notification already exists
          const exists = old.data.some((n: any) => n.id === mappedNotification.id)
          if (exists) return old

          // Add to beginning of list, maintain max 3 items
          const newData = [mappedNotification, ...old.data].slice(0, 3)

          return {
            ...old,
            data: newData,
            totalRecords: old.totalRecords + 1
          }
        })

        // Update unread count
        queryClient.setQueryData(['notifications', 'count', 'unread'], (old: any) => {
          const currentCount = old || 0
          return currentCount + 1
        })

        // Update infinite scroll caches - base caches
        queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: '' }], addNotificationToCache(mappedNotification))
        queryClient.setQueryData(['notifications', 'infinite', { status: false, type: '' }], addNotificationToCache(mappedNotification))

        // Update type-specific caches based on notification type
        if (mappedNotification.type === 'InviteFriend') {
          queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'InviteFriend' }], addNotificationToCache(mappedNotification))
          queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'InviteFriend' }], addNotificationToCache(mappedNotification))
        } else if (mappedNotification.type === 'AcceptFriendRequest') {
          queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'AcceptFriendRequest' }], addNotificationToCache(mappedNotification))
          queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'AcceptFriendRequest' }], addNotificationToCache(mappedNotification))
        } else if (mappedNotification.type === 'NewMessage') {
          queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'NewMessage' }], addNotificationToCache(mappedNotification))
          queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'NewMessage' }], addNotificationToCache(mappedNotification))
        } else if (mappedNotification.type === 'System') {
          queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'System' }], addNotificationToCache(mappedNotification))
          queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'System' }], addNotificationToCache(mappedNotification))
        }
      } else {
        // Add to read list if status is read
        queryClient.setQueryData(['notifications', 'header', 'read'], (old: any) => {
          if (!old) {
            return {
              data: [mappedNotification],
              totalRecords: 1
            }
          }

          // Check if notification already exists
          const exists = old.data.some((n: any) => n.id === mappedNotification.id)
          if (exists) return old

          // Add to beginning of list, maintain max 3 items
          const newData = [mappedNotification, ...old.data].slice(0, 3)

          return {
            ...old,
            data: newData,
            totalRecords: old.totalRecords + 1
          }
        })

        // Update infinite scroll cache for read notifications
        queryClient.setQueryData(['notifications', 'infinite', { status: true, type: '' }], addNotificationToCache(mappedNotification))

        // Update type-specific read caches
        if (mappedNotification.type === 'InviteFriend') {
          queryClient.setQueryData(['notifications', 'infinite', { status: true, type: 'InviteFriend' }], addNotificationToCache(mappedNotification))
        } else if (mappedNotification.type === 'AcceptFriendRequest') {
          queryClient.setQueryData(['notifications', 'infinite', { status: true, type: 'AcceptFriendRequest' }], addNotificationToCache(mappedNotification))
        } else if (mappedNotification.type === 'NewMessage') {
          queryClient.setQueryData(['notifications', 'infinite', { status: true, type: 'NewMessage' }], addNotificationToCache(mappedNotification))
        } else if (mappedNotification.type === 'System') {
          queryClient.setQueryData(['notifications', 'infinite', { status: true, type: 'System' }], addNotificationToCache(mappedNotification))
        }
      }
    })

    connection.on('notificationremoved', (notificationId: number) => {
      queryClient.setQueryData(['notifications', 'header', 'unread'], (old: any) => {
        if (!old) return old
        const filtered = old.data.filter((n: any) => String(n.id) !== String(notificationId))
        queryClient.setQueryData(['notifications', 'count', 'unread'], filtered.length)
        return {
          ...old,
          data: filtered,
          totalRecords: Math.max(0, filtered.length)
        }
      })

      // Also remove from infinite scroll caches
      queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: '' }], removeNotificationFromCache(notificationId))
      queryClient.setQueryData(['notifications', 'infinite', { status: false, type: '' }], removeNotificationFromCache(notificationId))

      // Remove from type-specific caches (we need to remove from all type caches since we don't know the type)
      queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'InviteFriend' }], removeNotificationFromCache(notificationId))
      queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'InviteFriend' }], removeNotificationFromCache(notificationId))
      queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'AcceptFriendRequest' }], removeNotificationFromCache(notificationId))
      queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'AcceptFriendRequest' }], removeNotificationFromCache(notificationId))
      queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'NewMessage' }], removeNotificationFromCache(notificationId))
      queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'NewMessage' }], removeNotificationFromCache(notificationId))
      queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'System' }], removeNotificationFromCache(notificationId))
      queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'System' }], removeNotificationFromCache(notificationId))
    })

    connection.on('updatenotificationcount', (count: number) => {
      queryClient.setQueryData(
        ['notifications', 'count', 'unread'],
        count
      )
    })

    connection.on(
      'notificationupdated',
      (payload: { referenceId: number; status: string }) => {
        queryClient.setQueryData(
          ['notifications', 'header', 'unread'],
          (old: any) => {
            if (!old) return old

            // If status is Read or Completed, remove from unread list
            if (payload.status === 'Read' || payload.status === 'Completed') {
              return {
                ...old,
                data: old.data.filter((n: any) => String(n.referenceId) !== String(payload.referenceId)),
                totalRecords: Math.max(0, old.totalRecords - 1)
              }
            }

            // Otherwise just update the status
            return {
              ...old,
              data: old.data.map((n: any) =>
                String(n.referenceId) === String(payload.referenceId)
                  ? { ...n, status: payload.status.toLowerCase() }
                  : n
              )
            }
          }
        )

        // Update infinite scroll caches
        queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: '' }], updateNotificationStatusInCache(payload.referenceId, payload.status))
        queryClient.setQueryData(['notifications', 'infinite', { status: false, type: '' }], updateNotificationStatusInCache(payload.referenceId, payload.status))

        // Update type-specific caches
        queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'InviteFriend' }], updateNotificationStatusInCache(payload.referenceId, payload.status))
        queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'InviteFriend' }], updateNotificationStatusInCache(payload.referenceId, payload.status))
        queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'AcceptFriendRequest' }], updateNotificationStatusInCache(payload.referenceId, payload.status))
        queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'AcceptFriendRequest' }], updateNotificationStatusInCache(payload.referenceId, payload.status))
        queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'NewMessage' }], updateNotificationStatusInCache(payload.referenceId, payload.status))
        queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'NewMessage' }], updateNotificationStatusInCache(payload.referenceId, payload.status))
        queryClient.setQueryData(['notifications', 'infinite', { status: undefined, type: 'System' }], updateNotificationStatusInCache(payload.referenceId, payload.status))
        queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'System' }], updateNotificationStatusInCache(payload.referenceId, payload.status))

        // Special handling for unread cache - remove if marked as read
        if (payload.status === 'Read' || payload.status === 'Completed') {
          queryClient.setQueryData(['notifications', 'infinite', { status: false, type: '' }], (old: any) => {
            if (!old || !old.pages) return old
            const updatedPages = old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((n: any) => String(n.referenceId) !== String(payload.referenceId)),
              totalRecords: Math.max(0, page.totalRecords - 1)
            }))
            return { ...old, pages: updatedPages }
          })

          // Remove from type-specific unread caches
          queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'InviteFriend' }], (old: any) => {
            if (!old || !old.pages) return old
            const updatedPages = old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((n: any) => String(n.referenceId) !== String(payload.referenceId)),
              totalRecords: Math.max(0, page.totalRecords - 1)
            }))
            return { ...old, pages: updatedPages }
          })

          queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'AcceptFriendRequest' }], (old: any) => {
            if (!old || !old.pages) return old
            const updatedPages = old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((n: any) => String(n.referenceId) !== String(payload.referenceId)),
              totalRecords: Math.max(0, page.totalRecords - 1)
            }))
            return { ...old, pages: updatedPages }
          })

          queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'NewMessage' }], (old: any) => {
            if (!old || !old.pages) return old
            const updatedPages = old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((n: any) => String(n.referenceId) !== String(payload.referenceId)),
              totalRecords: Math.max(0, page.totalRecords - 1)
            }))
            return { ...old, pages: updatedPages }
          })

          queryClient.setQueryData(['notifications', 'infinite', { status: false, type: 'System' }], (old: any) => {
            if (!old || !old.pages) return old
            const updatedPages = old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((n: any) => String(n.referenceId) !== String(payload.referenceId)),
              totalRecords: Math.max(0, page.totalRecords - 1)
            }))
            return { ...old, pages: updatedPages }
          })
        }
      }
    )

    return () => {
      connection.off('notificationreceived')
      connection.off('notificationupdated')
      connection.off('notificationremoved')
      connection.off('updatenotificationcount')
    }
  }, [connection])

  return {
    connectionState,
    isConnected
  }
}
