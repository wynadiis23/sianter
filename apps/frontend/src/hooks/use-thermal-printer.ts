import { useState, useEffect, useCallback } from 'react'
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

export function useThermalPrinter() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([])
  const [hasSavedDevice, setHasSavedDevice] = useState(!!getSavedDeviceId())

  const refreshPaired = useCallback(async () => {
    const devices = await getPairedDevices()
    setPairedDevices(devices)
    setHasSavedDevice(!!getSavedDeviceId())
  }, [])

  useEffect(() => {
    refreshPaired()
  }, [refreshPaired])

  const connect = useCallback(async (device?: BluetoothDevice) => {
    setIsConnecting(true)
    try {
      const d = device ?? (await requestDevice())
      await connectToDevice(d)
      setIsConnected(true)
      await refreshPaired()
      toast.success(`Terhubung ke ${d.name ?? 'printer'}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan printer'
      toast.error(msg)
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }, [refreshPaired])

  const disconnect = useCallback(async () => {
    const device = getActiveDevice()
    if (device) {
      await disconnectDevice(device)
    }
    setIsConnected(false)
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
      await printViaBluetooth(buffer)
      setIsConnected(true)
      await refreshPaired()
      toast.success('Struk berhasil dicetak')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        toast.error('Printer tidak ditemukan. Pastikan printer menyala dan dalam jangkauan.')
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal mencetak struk'
        toast.error(msg)
      }
      setIsConnected(false)
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
      setIsConnected(true)
      await refreshPaired()
      toast.success('Test print berhasil')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Test print gagal'
      toast.error(msg)
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }, [refreshPaired])

  const forgetDevice = useCallback(() => {
    removeSavedDeviceId()
    setHasSavedDevice(false)
    setIsConnected(false)
    toast.info('Printer dihapus dari daftar')
  }, [])

  return {
    isConnected,
    isConnecting,
    pairedDevices,
    hasSavedDevice,
    connect,
    disconnect,
    print,
    testPrint,
    forgetDevice,
    refreshPaired,
  }
}