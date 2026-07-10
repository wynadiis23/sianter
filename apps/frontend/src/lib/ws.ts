import { useEffect, useRef, useState } from 'react'
import { server } from './eden'
import type { WsEvent } from '@sianter/backend'

type AnyWs = ReturnType<typeof server.api.ws.monitor.subscribe>

export type WsStatus = 'connecting' | 'connected' | 'disconnected'

function useReconnectingSocket(
  factory: () => AnyWs,
  onMessage: (event: any) => void,
  onReconnect?: () => void,
) {
  const onMessageRef = useRef(onMessage)
  const onReconnectRef = useRef(onReconnect)
  onMessageRef.current = onMessage
  onReconnectRef.current = onReconnect

  const [status, setStatus] = useState<WsStatus>('connecting')

  useEffect(() => {
    let ws: AnyWs | null = null
    let retry = 0
    let closed = false
    let opened = false

    const connect = () => {
      setStatus('connecting')
      ws = factory()
      ws.on('message', (raw: any) => {
        onMessageRef.current?.(raw.data)
      })
      ws.on('open', () => {
        setStatus('connected')
        retry = 0
        if (opened) onReconnectRef.current?.()
        opened = true
      })
      ws.on('close', () => {
        setStatus('disconnected')
        if (closed) return
        const delay = Math.min(1000 * 2 ** retry, 30000)
        retry += 1
        setTimeout(connect, delay)
      })
    }

    connect()
    return () => {
      closed = true
      ws?.close()
    }
  }, [])

  return status
}

export function useMonitorSocket(
  onEvent: (event: WsEvent) => void,
  onReconnect?: () => void,
) {
  return useReconnectingSocket(
    () => server.api.ws.monitor.subscribe(),
    onEvent,
    onReconnect,
  )
}

export function useLoketSocket(
  onEvent: (event: WsEvent) => void,
  onReconnect?: () => void,
) {
  return useReconnectingSocket(
    () => server.api.ws.loket.subscribe(),
    onEvent,
    onReconnect,
  )
}