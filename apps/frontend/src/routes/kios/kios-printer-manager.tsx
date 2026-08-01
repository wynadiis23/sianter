import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Bluetooth, BluetoothOff, Plus, Trash2, Printer, Check, RefreshCw } from 'lucide-react'
import { getPairedDevices, getSavedDeviceId, requestDevice, saveDeviceId, connectToDevice } from '@/lib/thermal-printer'
import { ThermalPrinterSelect } from '@/components/thermal-printer-select'
import { BluetoothLog } from '@/components/bluetooth-log'

interface KiosPrinterManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasSavedPrinter: boolean
  printerName: string | null
  testPrint: () => Promise<void>
  forgetDevice: () => void | Promise<void>
  refreshPaired: () => Promise<void>
  reconnectNow: () => void
}

export function KiosPrinterManager({
  open,
  onOpenChange,
  hasSavedPrinter,
  printerName,
  testPrint,
  forgetDevice,
  refreshPaired,
  reconnectNow,
}: KiosPrinterManagerProps) {
  const [testing, setTesting] = useState(false)
  const [showSelect, setShowSelect] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const handleTestPrint = async () => {
    setTesting(true)
    try {
      await testPrint()
    } finally {
      setTesting(false)
    }
  }

  const handleScanNew = useCallback(async () => {
    setScanning(true)
    try {
      const device = await requestDevice()
      await connectToDevice(device)
      await refreshPaired()
      toast.success(`Terhubung ke ${device.name ?? 'printer'}`)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        // user cancelled
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal menghubungkan printer'
        toast.error(msg)
      }
    } finally {
      setScanning(false)
    }
  }, [refreshPaired])

  const handleSelectPaired = useCallback(async (device: BluetoothDevice) => {
    setConnecting(true)
    setShowSelect(false)
    try {
      saveDeviceId(device.id)
      await connectToDevice(device)
      await refreshPaired()
      toast.success(`Terhubung ke ${device.name ?? 'printer'}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan printer'
      toast.error(msg)
    } finally {
      setConnecting(false)
    }
  }, [refreshPaired])

  const handleScanNewFromSelect = useCallback(async () => {
    setShowSelect(false)
    await handleScanNew()
  }, [handleScanNew])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bluetooth className="size-5 text-primary" />
              Kelola Printer Thermal
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <div className="rounded-lg border border-border bg-card p-4">
              <Label className="text-xs text-muted-foreground">Printer Default</Label>
              {hasSavedPrinter ? (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <Bluetooth className="size-4 text-green-500" />
                    <p className="text-sm font-medium text-foreground">
                      {printerName ?? 'Printer Tidak Dikenal'}
                    </p>
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={handleTestPrint}
                      disabled={testing}
                    >
                      <Printer className="size-4" />
                      {testing ? 'Mencetak...' : 'Test Print'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={reconnectNow}
                    >
                      <RefreshCw className="size-4" />
                      Hubungkan
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowSelect(true)}
                    >
                      Ganti
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={forgetDevice}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <BluetoothOff className="size-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Belum ada printer</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={handleScanNew}
                    disabled={scanning}
                  >
                    {scanning ? (
                      <Spinner className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    {scanning ? 'Memindai...' : 'Sambungkan Printer'}
                  </Button>
                </div>
              )}
            </div>

            {hasSavedPrinter && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Printer Lain</Label>
                <PairedDevicesList
                  excludeId={getSavedDeviceId()}
                  onSelect={async (device) => {
                    saveDeviceId(device.id)
                    await connectToDevice(device)
                    await refreshPaired()
                    toast.success(`Terhubung ke ${device.name ?? 'printer'}`)
                  }}
                />
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleScanNew}
                  disabled={scanning}
                >
                  {scanning ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  Scan Printer Baru
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Log Aktivitas</Label>
            <BluetoothLog className="mt-2" />
          </div>
        </DialogContent>
      </Dialog>

      <ThermalPrinterSelect
        open={showSelect}
        onOpenChange={setShowSelect}
        onSelectPaired={handleSelectPaired}
        onScanNew={handleScanNewFromSelect}
        loading={connecting || scanning}
      />
    </>
  )
}

function PairedDevicesList({
  excludeId,
  onSelect,
}: {
  excludeId: string | null
  onSelect: (device: BluetoothDevice) => void
}) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([])

  useEffect(() => {
    let cancelled = false
    getPairedDevices().then((d) => {
      if (!cancelled) setDevices(d.filter((d) => d.id !== excludeId))
    })
    return () => {
      cancelled = true
    }
  }, [excludeId])

  if (devices.length === 0) return null

  return (
    <div className="space-y-1">
      {devices.map((device) => (
        <div
          key={device.id}
          className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {device.name ?? 'Printer Tidak Dikenal'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {device.id}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelect(device)}
          >
            <Check className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}