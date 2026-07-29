const SERVICE_UUID = '0000ff00-0000-1000-8000-00805f9b34fb'
const WRITE_CHAR_UUID = '0000ff02-0000-1000-8000-00805f9b34fb'
const CHUNK_SIZE = 512
const STORAGE_KEY = 'thermal-printer-device-id'

let activeDevice: BluetoothDevice | null = null

export function getSavedDeviceId(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function saveDeviceId(deviceId: string): void {
  localStorage.setItem(STORAGE_KEY, deviceId)
}

export function removeSavedDeviceId(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getActiveDevice(): BluetoothDevice | null {
  return activeDevice
}

export async function getPairedDevices(): Promise<BluetoothDevice[]> {
  if (!('bluetooth' in navigator)) return []
  try {
    return await navigator.bluetooth.getDevices()
  } catch {
    return []
  }
}

/**
 * 
 * TODO: get filters from backend, so we can support multiple printer types
 */
export async function requestDevice(): Promise<BluetoothDevice> {
  if (!('bluetooth' in navigator)) {
    throw new Error('Browser tidak mendukung Web Bluetooth')
  }

  const device = await navigator.bluetooth.requestDevice({
    filters:[
      {
        namePrefix: 'POS-58',
      },
      {
        namePrefix: 'RPP',
      }
    ],
    optionalServices: [SERVICE_UUID],
  })

  saveDeviceId(device.id)
  return device
}

export async function connectToDevice(device: BluetoothDevice): Promise<BluetoothRemoteGATTCharacteristic> {
  const server = await device.gatt!.connect()

  device.addEventListener('gattserverdisconnected', () => {
    activeDevice = null
  })

  const service = await server.getPrimaryService(SERVICE_UUID)
  const characteristic = await service.getCharacteristic(WRITE_CHAR_UUID)
  activeDevice = device
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
  if (device.gatt?.connected) {
    device.gatt.disconnect()
  }
  activeDevice = null
}

export async function printViaBluetooth(data: Uint8Array): Promise<void> {
  if (!('bluetooth' in navigator)) {
    throw new Error('Browser tidak mendukung Web Bluetooth')
  }

  let device: BluetoothDevice | null = null

  const savedId = getSavedDeviceId()
  if (savedId) {
    const paired = await getPairedDevices()
    device = paired.find((d) => d.id === savedId) ?? null
  }

  if (!device) {
    device = await requestDevice()
  }

  try {
    const characteristic = await connectToDevice(device)
    await sendToPrinter(characteristic, data)
  } finally {
    await disconnectDevice(device)
  }
}