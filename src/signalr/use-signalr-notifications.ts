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
      (payload: { ReferenceId: number; Status: string }) => {
        queryClient.setQueryData(
          ['notifications', 'header', 'unread'],
          (old: any) => {
            if (!old) return old

            return {
              ...old,
              data: old.data.map((n: any) =>
                n.referenceId === payload.ReferenceId
                  ? { ...n, status: payload.Status }
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
