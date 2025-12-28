import { HubConnectionBuilder, LogLevel, HubConnection, HttpTransportType } from '@microsoft/signalr'
import { useEffect, useState, useRef, useCallback } from 'react'
import { queryClient } from '@lyra/react-query-config'
import { ConnectionState } from '@/@types/signalr/hub-types'
import { API_ENDPOINTS } from '../constants'
import type { ExtendedNotificationDataModel } from '@/@types/notification'

interface UseSignalRNotificationsProps {
  userId: string
  enabled?: boolean
}

interface NotificationCacheData {
  data: ExtendedNotificationDataModel[]
  pageNumber: number
  pageSize: number
  totalRecords: number
  totalPages: number
}

export function useSignalRNotifications({ userId, enabled }: UseSignalRNotificationsProps) {
  const connectionRef = useRef<HubConnection | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const isMountedRef = useRef(true)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected)
  const hasInitializedRef = useRef(false)

  const startConnection = useCallback(async () => {
    console.log('🔔 startConnection called', { userId, isMounted: isMountedRef.current });

    if (!userId || !isMountedRef.current) return

    const token = localStorage.getItem('auth-token')
    if (!token) {
      console.error('No auth token found')
      if (isMountedRef.current) setConnectionState(ConnectionState.Error)
      return
    }

    // Stop existing connection
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop()
        connectionRef.current = null
      } catch (e) {
        console.log('Error stopping existing connection:', e)
      }
    }

    try {
      if (isMountedRef.current) setConnectionState(ConnectionState.Connecting)

      const backendUrl = import.meta.env.VITE_API_URL
      const connection = new HubConnectionBuilder()
        .withUrl(backendUrl + API_ENDPOINTS.NOTIFICATION.HUB, {
          accessTokenFactory: () => localStorage.getItem('auth-token') || '',
          transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build()

      connection.onreconnecting(error => {
        console.log('SignalR reconnecting:', error)
        if (isMountedRef.current) setConnectionState(ConnectionState.Reconnecting)
      })
      connection.onreconnected(() => {
        console.log('SignalR reconnected')
        if (isMountedRef.current) setConnectionState(ConnectionState.Connected)
        reconnectAttemptsRef.current = 0
      })
      connection.onclose(error => {
        console.log('SignalR closed:', error)
        if (isMountedRef.current) setConnectionState(ConnectionState.Disconnected)
      })

      // Listen for notification events
      connection.on('NotificationReceived', (notification: ExtendedNotificationDataModel) => {
        console.log('🔔 NotificationReceived - notification data:', notification);

        // Update cache with deduplication logic
        queryClient.setQueryData(
          ['notifications', 'header', 'unread'],
          (old: NotificationCacheData | undefined) => {
            console.log('🔔 Current unread cache (before update):', old);

            // Handle case where cache doesn't exist yet
            if (!old || !old.data) {
              // New notification - update count
              queryClient.setQueryData(['notifications', 'count', 'unread'], (oldCount: number | undefined) => {
                const newCount = (oldCount ?? 0) + 1;
                console.log('🔔 Count updated from', oldCount, 'to', newCount, '(initial notification)');
                return newCount;
              });

              return {
                data: [notification],
                pageNumber: 1,
                pageSize: 3,
                totalRecords: 1,
                totalPages: 1
              };
            }

            // Check if notification already exists (following existing pattern from use-signalr-messages.ts)
            const existingIndex = old.data.findIndex((n: ExtendedNotificationDataModel) => n.id === notification.id);
            const isNewNotification = existingIndex === -1;

            if (isNewNotification) {
              // New notification - prepend and increment count
              queryClient.setQueryData(['notifications', 'count', 'unread'], (oldCount: number | undefined) => {
                const newCount = (oldCount ?? 0) + 1;
                console.log('🔔 Count updated from', oldCount, 'to', newCount, '(new notification)');
                return newCount;
              });

              const updatedData = [notification, ...old.data].slice(0, 3); // Keep max 3 items

              console.log('🔔 Unread cache after prepend:', {
                ...old,
                data: updatedData,
                totalRecords: old.totalRecords + 1
              });

              return {
                ...old,
                data: updatedData,
                totalRecords: old.totalRecords + 1
              };
            } else {
              // Existing notification - update in place using immutable pattern, don't increment count
              const updatedData = old.data.map((n: ExtendedNotificationDataModel, idx: number) =>
                idx === existingIndex ? notification : n
              );

              console.log('🔔 Unread cache after update in place (duplicate prevented):', {
                ...old,
                data: updatedData
              });

              return {
                ...old,
                data: updatedData
                // totalRecords unchanged - it's an update, not a new notification
              };
            }
          }
        );
      });

      connection.on('NotificationRemoved', (notificationId: number) => {
        console.log('🔔 NotificationRemoved', notificationId);

        queryClient.setQueryData(['notifications', 'header', 'unread'], (old: NotificationCacheData | undefined) => {
          if (!old || !old.data) return old;

          const updatedData = old.data.filter(n => n.id !== String(notificationId));

          return {
            ...old,
            data: updatedData,
            totalRecords: Math.max(0, old.totalRecords - 1) // atualiza totalRecords apenas
          };
        });
      });

      connection.on('UpdateNotificationCount', (count: number) => {
        console.log('🔔 UpdateNotificationCount - setting count to', count)
        queryClient.setQueryData(["notifications", "count", "unread"], count)
      })

      await connection.start()
      if (isMountedRef.current) {
        connectionRef.current = connection
        setConnectionState(ConnectionState.Connected)
        reconnectAttemptsRef.current = 0
      }
    } catch (error) {
      console.error('SignalR connection error:', error)
      reconnectAttemptsRef.current++

      if (isMountedRef.current) {
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionState(ConnectionState.Error)
          setTimeout(() => {
            if (isMountedRef.current && connectionState === ConnectionState.Error) {
              reconnectAttemptsRef.current = 0
              startConnection()
            }
          }, 30000)
        } else {
          setConnectionState(ConnectionState.Disconnected)
          setTimeout(() => {
            if (isMountedRef.current) startConnection()
          }, 5000 * reconnectAttemptsRef.current)
        }
      }
    }
  }, [userId])

  const stopConnection = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop()
      } catch (error) {
        console.error('Error stopping SignalR:', error)
      }
      connectionRef.current = null
    }
    if (isMountedRef.current) setConnectionState(ConnectionState.Disconnected)
  }, [])

  useEffect(() => {
    if (!enabled || !userId) return

    console.log('🔔 useSignalRNotifications useEffect called', {
      enabled,
      userId,
      hasInitialized: hasInitializedRef.current,
      hasConnection: !!connectionRef.current
    });

    if (hasInitializedRef.current && connectionRef.current) {
      console.log('🔔 Skipping - already initialized');
      return;
    }

    console.log('🔔 Initializing SignalR connection...');
    isMountedRef.current = true
    hasInitializedRef.current = true
    startConnection()

    return () => {
      console.log('🔔 Cleanup - stopping connection');
      isMountedRef.current = false
      hasInitializedRef.current = false
      stopConnection()
    }
  }, [userId, enabled, startConnection, stopConnection])

  return {
    connectionState,
    isConnected: connectionState === ConnectionState.Connected
  }
}
