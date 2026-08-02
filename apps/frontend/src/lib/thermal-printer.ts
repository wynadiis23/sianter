const SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb'
const WRITE_CHAR_UUID = '0000ff02-0000-1000-8000-00805f9b34fb'
const CHUNK_SIZE = 512
const STORAGE_KEY = 'thermal-printer-device-id'
const NAME_STORAGE_KEY = 'thermal-printer-device-name'
const PREFIX_STORAGE_KEY = 'printerNamePrefixes'

let activeDevice: BluetoothDevice | null = null
let activeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
let lastRequestedDevice: BluetoothDevice | null = null

type ConnectionListener = (connected: boolean) => void
const listeners = new Set<ConnectionListener>()

export function onConnectionChange(fn: ConnectionListener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function notifyConnectionChange(connected: boolean) {
  listeners.forEach((fn) => fn(connected))
}

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: Date
  message: string
  level: LogLevel
}

type LogListener = (entry: LogEntry) => void
const logListeners = new Set<LogListener>()

export function onLog(fn: LogListener): () => void {
  logListeners.add(fn)
  return () => {
    logListeners.delete(fn)
  }
}

export function emitLog(level: LogLevel, message: string): void {
  const entry: LogEntry = { timestamp: new Date(), message, level }
  logListeners.forEach((fn) => fn(entry))
}

export function getSavedDeviceId(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function saveDeviceId(deviceId: string): void {
  localStorage.setItem(STORAGE_KEY, deviceId)
}

export function removeSavedDeviceId(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(NAME_STORAGE_KEY)
}

export function getSavedPrinterName(): string | null {
  return localStorage.getItem(NAME_STORAGE_KEY)
}

export function savePrinterName(name: string | null | undefined): void {
  if (name) {
    localStorage.setItem(NAME_STORAGE_KEY, name)
  }
}

export function getActiveDevice(): BluetoothDevice | null {
  return activeDevice
}

export function getLastRequestedDevice(): BluetoothDevice | null {
  return lastRequestedDevice
}

export function supportsGetDevices(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'bluetooth' in navigator &&
    typeof (navigator.bluetooth as { getDevices?: unknown }).getDevices === 'function'
  )
}

export function getActiveCharacteristic(): BluetoothRemoteGATTCharacteristic | null {
  return activeCharacteristic
}

export function getPrinterNamePrefixes(): string[] {
  const raw = localStorage.getItem(PREFIX_STORAGE_KEY)
  if (!raw) return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

export async function syncPrinterNamePrefixes(): Promise<void> {
  try {
    const res = await fetch('/api/settings/printer-prefixes')
    const data = await res.json()
    localStorage.setItem(PREFIX_STORAGE_KEY, data.printerNamePrefixes ?? '')
  } catch {
    // silently ignore
  }
}

export async function getPairedDevices(): Promise<BluetoothDevice[]> {
  if (!('bluetooth' in navigator)) return []

  const cached = lastRequestedDevice
  const result: BluetoothDevice[] = cached ? [cached] : []

  if (supportsGetDevices()) {
    try {
      const devices = await navigator.bluetooth.getDevices()
      for (const device of devices) {
        if (cached && device.id === cached.id) continue
        result.push(device)
      }
      if (devices.length > 0) {
        emitLog('info', `Menemukan ${devices.length} printer tersimpan di browser`)
      }
    } catch (error) {
      emitLog('warn', `Gagal membaca daftar printer tersimpan di browser: ${(error as Error).message}`)
    }
  } else {
    emitLog('info', 'Browser tidak mendukung daftar printer tersimpan (getDevices). Gunakan tombol Sambungkan.')
  }

  return result
}

export async function requestDevice(): Promise<BluetoothDevice> {
  if (!('bluetooth' in navigator)) {
    throw new Error('Browser tidak mendukung Web Bluetooth')
  }

  const prefixes = getPrinterNamePrefixes()

  emitLog('info', 'Membuka dialog pairing Bluetooth...')
  const device = await navigator.bluetooth.requestDevice(
    prefixes.length > 0
      ? { filters: prefixes.map((p) => ({ namePrefix: p })), optionalServices: [SERVICE_UUID] }
      : { acceptAllDevices: true, optionalServices: [SERVICE_UUID] },
  )

  emitLog('info', `Perangkat dipilih: ${device.name ?? device.id}`)
  saveDeviceId(device.id)
  savePrinterName(device.name)
  lastRequestedDevice = device
  return device
}

export async function connectToDevice(device: BluetoothDevice): Promise<BluetoothRemoteGATTCharacteristic> {
  emitLog('info', `Menghubungkan GATT ke ${device.name ?? device.id}...`)
  const server = await device.gatt!.connect()

  savePrinterName(device.name)

  device.addEventListener('gattserverdisconnected', () => {
    emitLog('warn', `Koneksi ke ${device.name ?? device.id} terputus`)
    activeDevice = null
    activeCharacteristic = null
    notifyConnectionChange(false)
  })

  emitLog('info', 'Mencari service printer...')
  const service = await server.getPrimaryService(SERVICE_UUID)
  const characteristic = await service.getCharacteristic(WRITE_CHAR_UUID)
  activeDevice = device
  activeCharacteristic = characteristic
  emitLog('info', `Terhubung ke ${device.name ?? device.id}`)
  notifyConnectionChange(true)
  return characteristic
}

export async function sendToPrinter(
  characteristic: BluetoothRemoteGATTCharacteristic,
  data: Uint8Array,
): Promise<void> {
  let offset = 0
  while (offset < data.length) {
    const chunk = data.slice(offset, offset + CHUNK_SIZE)
    await characteristic.writeValue(chunk)
    offset += CHUNK_SIZE
  }
}

export async function disconnectDevice(device: BluetoothDevice): Promise<void> {
  emitLog('info', 'Memutuskan koneksi secara manual...')
  if (device.gatt?.connected) {
    device.gatt.disconnect()
  }
  activeDevice = null
  activeCharacteristic = null
  notifyConnectionChange(false)
}

export async function ensureConnection(): Promise<BluetoothRemoteGATTCharacteristic> {
  if (activeCharacteristic && activeDevice?.gatt?.connected) {
    return activeCharacteristic
  }

  activeDevice = null
  activeCharacteristic = null

  const savedId = getSavedDeviceId()
  if (savedId) {
    emitLog('info', 'Memastikan koneksi printer...')
    const paired = await getPairedDevices()
    const device = paired.find((d) => d.id === savedId) ?? null
    if (device) {
      return await connectToDevice(device)
    }
  }

  const device = await requestDevice()
  return await connectToDevice(device)
}

export async function printViaBluetooth(data: Uint8Array): Promise<void> {
  if (!('bluetooth' in navigator)) {
    throw new Error('Browser tidak mendukung Web Bluetooth')
  }

  const characteristic = await ensureConnection()
  await sendToPrinter(characteristic, data)
}