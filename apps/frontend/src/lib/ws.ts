import { useEffect, useRef, useState } from 'react'
import { server } from './eden'
import type { WsEvent } from '@sianter/backend'

type AnyWs = ReturnType<typeof server.api.ws.monitor.subscribe>

export type WsStatus = 'connecting' | 'connected' | 'disconnected'

function useReconnectingSocket<T>(
  factory: () => AnyWs,
  onMessage: (event: T) => void,
  onReconnect?: () => void,
) {
  const onMessageRef = useRef(onMessage)
  const onReconnectRef = useRef(onReconnect)
  const factoryRef = useRef(factory)
  onMessageRef.current = onMessage
  onReconnectRef.current = onReconnect
  factoryRef.current = factory

  const [status, setStatus] = useState<WsStatus>('connecting')

  useEffect(() => {
    let ws: AnyWs | null = null
    let retry = 0
    let closed = false
    let opened = false

    const connect = () => {
      setStatus('connecting')
      ws = factoryRef.current()
      ws.on('message', (raw: unknown) => {
        onMessageRef.current?.((raw as { data: T }).data)
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