import { useEffect, useRef } from 'react'
import { server } from './eden'
import type { WsEvent } from '@sianter/backend'

type AnyWs = ReturnType<typeof server.api.ws.monitor.subscribe>

function useReconnectingSocket(
  factory: () => AnyWs,
  onMessage: (event: any) => void,
  onReconnect?: () => void,
) {
  const onMessageRef = useRef(onMessage)
  const onReconnectRef = useRef(onReconnect)
  onMessageRef.current = onMessage
  onReconnectRef.current = onReconnect

  useEffect(() => {
    let ws: AnyWs | null = null
    let retry = 0
    let closed = false
    let opened = false

    const connect = () => {
      ws = factory()
      ws.on('message', (raw: any) => {
        console.log('[ws] message received:', raw)
        onMessageRef.current?.(raw.data)
      })
      ws.on('open', () => {
        console.log('[ws] connected:', ws?.url)
        retry = 0
        if (opened) onReconnectRef.current?.()
        opened = true
      })
      ws.on('close', () => {
        console.log('[ws] closed')
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
}

export function useMonitorSocket(
  onEvent: (event: WsEvent) => void,
  onReconnect?: () => void,
) {
  useReconnectingSocket(
    () => server.api.ws.monitor.subscribe(),
    onEvent,
    onReconnect,
  )
}

export function useLoketSocket(
  onEvent: (event: WsEvent) => void,
  onReconnect?: () => void,
) {
  useReconnectingSocket(
    () => server.api.ws.loket.subscribe(),
    onEvent,
    onReconnect,
  )
}