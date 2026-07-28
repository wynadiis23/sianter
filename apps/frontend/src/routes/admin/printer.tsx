import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
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

export function PrinterAdminPage() {
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState<BluetoothDevice[]>([])
  const [savedId, setSavedId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
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
    refresh()
  }, [refresh])

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

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">Pengaturan Printer Thermal</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kelola printer thermal Bluetooth untuk mencetak struk antrean
      </p>

      {!hasBluetooth && (
        <Card className="mt-6 border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BluetoothOff className="size-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Web Bluetooth Tidak Didukung</p>
                <p className="text-sm text-muted-foreground">
                  Browser Anda tidak mendukung Web Bluetooth API. Gunakan Chrome atau Edge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 space-y-6 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {connected ? (
                  <Bluetooth className="size-5 text-green-500" />
                ) : (
                  <Bluetooth className="size-5 text-muted-foreground" />
                )}
                <div>
                  <h2 className="text-lg font-semibold">
                    {connected ? 'Terhubung' : 'Tidak Terhubung'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {connected
                      ? 'Printer siap digunakan'
                      : 'Sambungkan printer untuk mulai mencetak'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
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
                    {connecting ? 'Memindai...' : 'Sambungkan Printer'}
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

        {devices.length > 0 && (
          <>
            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-3">Printer Tersimpan</h2>
              <div className="space-y-3">
                {devices.map((device) => (
                  <Card key={device.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">
                              {device.name ?? 'Printer Tidak Dikenal'}
                            </p>
                            {device.id === savedId && (
                              <Badge variant="secondary" className="text-xs shrink-0">
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
                            <Bluetooth className="size-4" />
                            Sambungkan
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleForget()}
                          >
                            <Trash2 className="size-4" />
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
    </div>
  )
}