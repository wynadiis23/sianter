import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { server } from '@/lib/eden'
import {
  printViaBluetooth,
  getPairedDevices,
  getSavedDeviceId,
  requestDevice,
  removeSavedDeviceId,
  getActiveDevice,
  connectToDevice,
  disconnectDevice,
  syncPrinterNamePrefixes,
  onConnectionChange,
  ensureConnection,
  sendToPrinter,
} from '@/lib/thermal-printer'

export interface ReceiptData {
  kode: string
  namaLayanan: string
  timestamp: Date
  trackingUrl: string
  kuesionerUrl?: string | null
  kuesionerCaption?: string | null
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const BACKOFF_MS = [1000, 2000, 4000, 8000, 16000, 30000]

export function useThermalPrinter() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([])
  const [hasSavedDevice, setHasSavedDevice] = useState(!!getSavedDeviceId())
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null)

  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptRef = useRef(0)
  const manualDisconnectRef = useRef(false)
  const scheduleReconnectRef = useRef<() => void>(() => {})

  const savedId = getSavedDeviceId()
  const defaultPrinterName = connectedDeviceName ?? (hasSavedDevice
    ? (pairedDevices.find((d) => d.id === savedId)?.name ?? null)
    : null)

  const refreshPaired = useCallback(async () => {
    const devices = await getPairedDevices()
    setPairedDevices(devices)
    setHasSavedDevice(!!getSavedDeviceId())
  }, [])

  useEffect(() => {
    syncPrinterNamePrefixes()
  }, [])

  useEffect(() => {
    refreshPaired()
  }, [refreshPaired])

  const attemptConnection = useCallback(async (isRetry?: boolean) => {
    const savedDeviceId = getSavedDeviceId()
    if (!savedDeviceId) return

    if (isRetry) {
      setIsReconnecting(true)
      setConnectionError(null)
    } else {
      setIsConnecting(true)
    }

    try {
      const paired = await getPairedDevices()
      const device = paired.find((d) => d.id === savedDeviceId)

      if (!device) {
        setConnectionError('Printer tidak ditemukan. Pastikan printer menyala.')
        scheduleReconnectRef.current()
        return
      }

      await connectToDevice(device)
      attemptRef.current = 0
      setConnectionError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan printer'
      setConnectionError(msg)
      scheduleReconnectRef.current()
    } finally {
      setIsConnecting(false)
      setIsReconnecting(false)
    }
  }, [])

  const scheduleReconnect = useCallback(() => {
    if (manualDisconnectRef.current) return

    const attempt = attemptRef.current
    if (attempt >= BACKOFF_MS.length * 3) return

    const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]
    attemptRef.current++

    reconnectTimerRef.current = setTimeout(() => {
      attemptConnection(true)
    }, delay)
  }, [attemptConnection])

  scheduleReconnectRef.current = scheduleReconnect

  const reconnectNow = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    manualDisconnectRef.current = false
    attemptRef.current = 0
    attemptConnection()
  }, [attemptConnection])

  useEffect(() => {
    const unsub = onConnectionChange((connected) => {
      setIsConnected(connected)
      setConnectedDeviceName(connected ? (getActiveDevice()?.name ?? null) : null)
      if (!connected && !manualDisconnectRef.current) {
        scheduleReconnect()
      }
    })

    return () => {
      unsub()
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
    }
  }, [scheduleReconnect])

  useEffect(() => {
    const savedDeviceId = getSavedDeviceId()
    if (savedDeviceId) {
      attemptConnection()
    }
    return () => {
      manualDisconnectRef.current = true
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
    }
  }, [attemptConnection])

  const connect = useCallback(async (device?: BluetoothDevice) => {
    manualDisconnectRef.current = false
    setIsConnecting(true)
    try {
      const d = device ?? (await requestDevice())
      await connectToDevice(d)
      await refreshPaired()
      toast.success(`Terhubung ke ${d.name ?? 'printer'}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan printer'
      toast.error(msg)
      setConnectionError(msg)
    } finally {
      setIsConnecting(false)
    }
  }, [refreshPaired])

  const disconnect = useCallback(async () => {
    manualDisconnectRef.current = true
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    const device = getActiveDevice()
    if (device) {
      await disconnectDevice(device)
    }
    setConnectionError(null)
    toast.info('Printer terputus')
  }, [])

  const print = useCallback(async (data: ReceiptData) => {
    try {
      setIsConnecting(true)
      const { data: result, error } = await server.api.printer.receipt.post({
        kode: data.kode,
        namaLayanan: data.namaLayanan,
        timestamp: data.timestamp.toISOString(),
        trackingUrl: data.trackingUrl,
        kuesionerUrl: data.kuesionerUrl ?? null,
        kuesionerCaption: data.kuesionerCaption ?? null,
      })
      if (error || !result) {
        toast.error('Gagal menghasilkan buffer struk')
        return
      }
      const buffer = base64ToUint8Array(result.buffer)
      const characteristic = await ensureConnection()
      await sendToPrinter(characteristic, buffer)
      await refreshPaired()
      toast.success('Struk berhasil dicetak')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        toast.error('Printer tidak ditemukan. Pastikan printer menyala dan dalam jangkauan.')
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal mencetak struk'
        toast.error(msg)
      }
    } finally {
      setIsConnecting(false)
    }
  }, [refreshPaired])

  const testPrint = useCallback(async () => {
    try {
      setIsConnecting(true)
      const { data: result, error } = await server.api.printer.test.post()
      if (error || !result) {
        toast.error('Gagal menghasilkan buffer test')
        return
      }
      const buffer = base64ToUint8Array(result.buffer)
      await printViaBluetooth(buffer)
      await refreshPaired()
      toast.success('Test print berhasil')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Test print gagal'
      toast.error(msg)
    } finally {
      setIsConnecting(false)
    }
  }, [refreshPaired])

  const forgetDevice = useCallback(() => {
    manualDisconnectRef.current = true
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    removeSavedDeviceId()
    setHasSavedDevice(false)
    setConnectionError(null)
    toast.info('Printer dihapus dari daftar')
  }, [])

  return {
    isConnected,
    isConnecting,
    isReconnecting,
    connectionError,
    pairedDevices,
    hasSavedDevice,
    defaultPrinterName,
    connect,
    disconnect,
    print,
    testPrint,
    forgetDevice,
    reconnectNow,
    refreshPaired,
  }
}