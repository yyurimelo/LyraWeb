import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HttpTransportType
} from '@microsoft/signalr'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ConnectionState } from '@/@types/signalr/hub-types'

interface UseSignalRBaseProps {
  hubUrl: string
  userId: string
  enabled?: boolean
}

export function useSignalRBase({
  hubUrl,
  userId,
  enabled = true
}: UseSignalRBaseProps) {
  const connectionRef = useRef<HubConnection | null>(null)
  const isMountedRef = useRef(true)

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  )

  const startConnection = useCallback(async () => {
    if (!enabled || !userId || !isMountedRef.current) return

    const token = localStorage.getItem('auth-token')
    if (!token) {
      setConnectionState(ConnectionState.Error)
      return
    }

    if (connectionRef.current) return

    try {
      setConnectionState(ConnectionState.Connecting)

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => localStorage.getItem('auth-token') || '',
          transport: HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build()

      connection.onreconnecting(() =>
        isMountedRef.current && setConnectionState(ConnectionState.Reconnecting)
      )

      connection.onreconnected(() =>
        isMountedRef.current && setConnectionState(ConnectionState.Connected)
      )

      connection.onclose(() =>
        isMountedRef.current && setConnectionState(ConnectionState.Disconnected)
      )

      await connection.start()

      if (isMountedRef.current) {
        connectionRef.current = connection
        setConnectionState(ConnectionState.Connected)
      }
    } catch {
      setConnectionState(ConnectionState.Error)
    }
  }, [hubUrl, userId, enabled])

  const stopConnection = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop()
      connectionRef.current = null
    }
    if (isMountedRef.current) {
      setConnectionState(ConnectionState.Disconnected)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    startConnection()

    return () => {
      isMountedRef.current = false
      stopConnection()
    }
  }, [startConnection, stopConnection])

  return {
    connection: connectionRef.current,
    connectionState,
    isConnected: connectionState === ConnectionState.Connected
  }
}
