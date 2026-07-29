import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Bluetooth, BluetoothOff, Plus, Trash2, Printer, RefreshCw } from 'lucide-react'
import { server } from '@/lib/eden'
import { printViaBluetooth } from '@/lib/thermal-printer'
import {
  getPairedDevices,
  getSavedDeviceId,
  requestDevice,
  connectToDevice,
  disconnectDevice,
  removeSavedDeviceId,
  getActiveDevice,
} from '@/lib/thermal-printer'

interface PetugasPrinterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PetugasPrinterDialog({ open, onOpenChange }: PetugasPrinterDialogProps) {
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState<BluetoothDevice[]>([])
  const [savedId, setSavedId] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [testing, setTesting] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const paired = await getPairedDevices()
    setDevices(paired)
    setSavedId(getSavedDeviceId())
    setConnected(!!getActiveDevice())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open) refresh()
  }, [open, refresh])

  const handleScan = async () => {
    setConnecting(true)
    try {
      await requestDevice()
      await refresh()
      toast.success('Printer berhasil dipasangkan')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        toast.info('Pemindaian dibatalkan')
      } else {
        const msg = err instanceof Error ? err.message : 'Gagal memindai printer'
        toast.error(msg)
      }
    } finally {
      setConnecting(false)
    }
  }

  const handleConnect = async (device: BluetoothDevice) => {
    setConnecting(true)
    try {
      await connectToDevice(device)
      setConnected(true)
      toast.success('Terhubung ke printer')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan printer'
      toast.error(msg)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    const device = getActiveDevice()
    if (device) {
      await disconnectDevice(device)
    }
    setConnected(false)
    toast.info('Printer terputus')
  }

  const handleForget = () => {
    removeSavedDeviceId()
    setSavedId(null)
    if (connected) {
      handleDisconnect()
    }
    toast.info('Printer dihapus dari daftar')
  }

  const handleTestPrint = async () => {
    setTesting(true)
    try {
      const { data: result, error } = await server.api.printer.test.post()
      if (error || !result) {
        toast.error('Gagal menghasilkan buffer test')
        return
      }
      const binary = atob(result.buffer)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      await printViaBluetooth(bytes)
      setConnected(true)
      toast.success('Test print berhasil')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Test print gagal'
      toast.error(msg)
    } finally {
      setTesting(false)
    }
  }

  const hasBluetooth = 'bluetooth' in navigator

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            Pengaturan Printer Thermal
          </DialogTitle>
        </DialogHeader>

        {!hasBluetooth && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BluetoothOff className="size-5 text-destructive shrink-0" />
                <div>
                  <p className="font-medium text-destructive text-sm">Web Bluetooth Tidak Didukung</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Browser Anda tidak mendukung Web Bluetooth API. Gunakan Chrome atau Edge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {connected ? (
                    <Bluetooth className="size-5 text-green-500" />
                  ) : (
                    <Bluetooth className="size-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">
                      {connected ? 'Terhubung' : 'Tidak Terhubung'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {connected
                        ? 'Printer siap digunakan'
                        : 'Sambungkan printer untuk mulai mencetak'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={refresh}
                    disabled={loading}
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                  {connected ? (
                    <Button size="sm" variant="secondary" onClick={handleDisconnect}>
                      Putuskan
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleScan} disabled={connecting || !hasBluetooth}>
                      <Plus className="size-4" />
                      {connecting ? 'Memindai...' : 'Sambungkan'}
                    </Button>
                  )}
                </div>
              </div>

              {connected && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTestPrint}
                  disabled={testing}
                >
                  <Printer className="size-4" />
                  {testing ? 'Mencetak...' : 'Test Print'}
                </Button>
              )}
            </CardContent>
          </Card>

          {devices.length > 0 && !loading && (
            <>
              <Separator />

              <div>
                <p className="text-sm font-semibold mb-2">Printer Tersimpan</p>
                <div className="space-y-2">
                  {devices.map((device) => (
                    <Card key={device.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {device.name ?? 'Printer Tidak Dikenal'}
                              </p>
                              {device.id === savedId && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 h-4 shrink-0">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {device.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConnect(device)}
                              disabled={connecting}
                            >
                              <Bluetooth className="size-3.5" />
                              Sambungkan
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleForget()}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
