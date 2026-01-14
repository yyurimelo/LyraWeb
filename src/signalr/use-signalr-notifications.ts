import { useEffect } from 'react'
import { queryClient } from '@lyra/react-query-config'
import { API_ENDPOINTS } from '@/shared/http/constants'
import { useSignalRBase } from '.'

interface UseSignalRNotificationsProps {
  userId: string
  enabled?: boolean
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
