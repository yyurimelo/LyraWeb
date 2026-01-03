import { useEffect } from 'react'
import { queryClient } from '@lyra/react-query-config'
import type { ExtendedNotificationDataModel } from '@/@types/notification'
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

    connection.on(
      'NotificationReceived',
      (notification: ExtendedNotificationDataModel) => {
        queryClient.setQueryData(
          ['notifications', 'header', 'unread'],
          (old: any) => {
            if (!old) {
              return {
                data: [notification],
                pageNumber: 1,
                pageSize: 3,
                totalRecords: 1,
                totalPages: 1
              }
            }

            if (old.data.some((n: any) => n.id === notification.id)) {
              return old
            }

            return {
              ...old,
              data: [notification, ...old.data].slice(0, 3),
              totalRecords: old.totalRecords + 1
            }
          }
        )
      }
    )

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
