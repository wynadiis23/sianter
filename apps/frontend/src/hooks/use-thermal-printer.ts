import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { server } from '@/lib/eden'
import {
  printViaBluetooth,
  getPairedDevices,
  getSavedDeviceId,
  getSavedPrinterName,
  requestDevice,
  removeSavedDeviceId,
  getActiveDevice,
  connectToDevice,
  disconnectDevice,
  syncPrinterNamePrefixes,
  onConnectionChange,
  ensureConnection,
  sendToPrinter,
  emitLog,
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
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null)
  const [retryAttempt, setRetryAttempt] = useState(0)

  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const attemptRef = useRef(0)
  const manualDisconnectRef = useRef(false)
  const scheduleReconnectRef = useRef<() => void>(() => {})

  const clearRetryCountdown = useCallback(() => {
    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current)
      retryTimerRef.current = null
    }
    setRetryCountdown(null)
    setRetryAttempt(0)
  }, [])

  const savedId = getSavedDeviceId()
  const defaultPrinterName = getSavedPrinterName() ?? (connectedDeviceName ?? (hasSavedDevice
    ? (pairedDevices.find((d) => d.id === savedId)?.name ?? null)
    : null))

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
      emitLog('info', 'Mencoba menyambungkan ulang...')
    } else {
      setIsConnecting(true)
      emitLog('info', 'Mencari printer tersimpan...')
    }

    try {
      const paired = await getPairedDevices()
      const device = paired.find((d) => d.id === savedDeviceId)

      if (!device) {
        emitLog('warn', 'Printer tersimpan tidak ditemukan. Pastikan printer menyala.')
        setConnectionError('Printer tidak ditemukan. Pastikan printer menyala.')
        scheduleReconnectRef.current()
        return
      }

      emitLog('info', `Menemukan printer: ${device.name ?? device.id}`)
      await connectToDevice(device)
      attemptRef.current = 0
      clearRetryCountdown()
      setConnectionError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan printer'
      emitLog('error', `Gagal menghubungkan printer: ${msg}`)
      setConnectionError(msg)
      scheduleReconnectRef.current()
    } finally {
      setIsConnecting(false)
      setIsReconnecting(false)
    }
  }, [clearRetryCountdown])

  const scheduleReconnect = useCallback(() => {
    if (manualDisconnectRef.current) return

    const attempt = attemptRef.current
    if (attempt >= BACKOFF_MS.length * 3) {
      emitLog('error', 'Percobaan ulang otomatis dihentikan. Silakan sambungkan manual.')
      clearRetryCountdown()
      return
    }

    const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]
    attemptRef.current++

    setRetryAttempt(attemptRef.current)
    setRetryCountdown(Math.ceil(delay / 1000))
    emitLog('info', `Percobaan ulang ke-${attemptRef.current} dalam ${Math.ceil(delay / 1000)}s...`)

    if (retryTimerRef.current) {
      clearInterval(retryTimerRef.current)
    }
    retryTimerRef.current = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev === null || prev <= 1) return null
        return prev - 1
      })
    }, 1000)

    reconnectTimerRef.current = setTimeout(() => {
      attemptConnection(true)
    }, delay)
  }, [attemptConnection, clearRetryCountdown])

  scheduleReconnectRef.current = scheduleReconnect

  const reconnectNow = useCallback(() => {
    emitLog('info', 'Menghubungkan ulang secara manual...')
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    manualDisconnectRef.current = false
    attemptRef.current = 0
    clearRetryCountdown()
    attemptConnection()
  }, [attemptConnection, clearRetryCountdown])

  useEffect(() => {
    const unsub = onConnectionChange((connected) => {
      setIsConnected(connected)
      setConnectedDeviceName(connected ? (getActiveDevice()?.name ?? null) : null)
      if (connected) {
        attemptRef.current = 0
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current)
          reconnectTimerRef.current = null
        }
        clearRetryCountdown()
      } else if (!manualDisconnectRef.current) {
        scheduleReconnect()
      }
    })

    return () => {
      unsub()
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      clearRetryCountdown()
    }
  }, [scheduleReconnect, clearRetryCountdown])

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
      clearRetryCountdown()
    }
  }, [attemptConnection, clearRetryCountdown])

  const connect = useCallback(async (device?: BluetoothDevice) => {
    manualDisconnectRef.current = false
    clearRetryCountdown()
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
  }, [refreshPaired, clearRetryCountdown])

  const disconnect = useCallback(async () => {
    manualDisconnectRef.current = true
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    clearRetryCountdown()
    const device = getActiveDevice()
    if (device) {
      await disconnectDevice(device)
    }
    setConnectionError(null)
    toast.info('Printer terputus')
  }, [clearRetryCountdown])

  const print = useCallback(async (data: ReceiptData) => {
    try {
      setIsConnecting(true)
      emitLog('info', 'Mengirim perintah cetak struk...')
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
      emitLog('info', 'Struk berhasil dicetak')
      toast.success('Struk berhasil dicetak')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        emitLog('error', 'Printer tidak ditemukan saat mencetak')
        toast.error('Printer tidak ditemukan. Pastikan printer menyala dan dalam jangkauan.')
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal mencetak struk'
        emitLog('error', `Gagal mencetak struk: ${msg}`)
        toast.error(msg)
      }
    } finally {
      setIsConnecting(false)
    }
  }, [refreshPaired])

  const testPrint = useCallback(async () => {
    try {
      setIsConnecting(true)
      emitLog('info', 'Mengirim perintah cetak test...')
      const { data: result, error } = await server.api.printer.test.post()
      if (error || !result) {
        toast.error('Gagal menghasilkan buffer test')
        return
      }
      const buffer = base64ToUint8Array(result.buffer)
      await printViaBluetooth(buffer)
      await refreshPaired()
      emitLog('info', 'Test print berhasil')
      toast.success('Test print berhasil')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Test print gagal'
      emitLog('error', `Test print gagal: ${msg}`)
      toast.error(msg)
    } finally {
      setIsConnecting(false)
    }
  }, [refreshPaired])

  const forgetDevice = useCallback(async () => {
    manualDisconnectRef.current = true
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    clearRetryCountdown()
    const device = getActiveDevice()
    if (device) {
      await disconnectDevice(device)
    }
    removeSavedDeviceId()
    setHasSavedDevice(false)
    setConnectedDeviceName(null)
    setConnectionError(null)
    emitLog('info', 'Printer dihapus dari daftar')
    toast.info('Printer dihapus dari daftar')
  }, [clearRetryCountdown])

  return {
    isConnected,
    isConnecting,
    isReconnecting,
    connectionError,
    pairedDevices,
    hasSavedDevice,
    defaultPrinterName,
    retryCountdown,
    retryAttempt,
    connect,
    disconnect,
    print,
    testPrint,
    forgetDevice,
    reconnectNow,
    refreshPaired,
  }
}