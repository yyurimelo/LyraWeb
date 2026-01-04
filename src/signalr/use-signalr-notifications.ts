import { useEffect } from 'react'
import { queryClient } from '@lyra/react-query-config'
import { API_ENDPOINTS } from '@/http/constants'
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

    connection.on('NotificationRemoved', (notificationId: number) => {
      queryClient.setQueryData(['notifications', 'header', 'unread'], (old: any) => {
        if (!old) return old
        const filtered = old.data.filter((n: any) => n.id !== notificationId)
        queryClient.setQueryData(['notifications', 'count', 'unread'], filtered.length)
        return {
          ...old,
          data: filtered,
          totalRecords: Math.max(0, filtered.length)
        }
      })
    })



    connection.on('UpdateNotificationCount', (count: number) => {
      queryClient.setQueryData(
        ['notifications', 'count', 'unread'],
        count
      )
    })

    connection.on(
      'NotificationUpdated',
      (payload: { referenceId: number; status: string }) => {
        queryClient.setQueryData(
          ['notifications', 'header', 'unread'],
          (old: any) => {
            if (!old) return old

            // If status is Read or Completed, remove from unread list
            if (payload.status === 'Read' || payload.status === 'Completed') {
              return {
                ...old,
                data: old.data.filter((n: any) => n.referenceId !== payload.referenceId),
                totalRecords: Math.max(0, old.totalRecords - 1)
              }
            }

            // Otherwise just update the status
            return {
              ...old,
              data: old.data.map((n: any) =>
                n.referenceId === payload.referenceId
                  ? { ...n, status: payload.status }
                  : n
              )
            }
          }
        )
      }
    )

    connection.on(
      'NotificationRemoved',
      (notificationId: number) => {
        queryClient.setQueryData(
          ['notifications', 'header', 'unread'],
          (old: any) => {
            if (!old) return old

            return {
              ...old,
              data: old.data.filter(
                (n: any) => n.id !== notificationId
              ),
              totalRecords: Math.max(0, old.totalRecords - 1)
            }
          }
        )
      }
    )

    return () => {
      connection.off('NotificationReceived')
      connection.off('NotificationUpdated')
      connection.off('NotificationRemoved')
      connection.off('UpdateNotificationCount')
    }
  }, [connection])

  return {
    connectionState,
    isConnected
  }
}
