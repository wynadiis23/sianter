import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Bluetooth, Radio, Wifi } from 'lucide-react'
import { getPairedDevices } from '@/lib/thermal-printer'

interface ThermalPrinterSelectProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPaired: (device: BluetoothDevice) => void
  onScanNew: () => void
  loading: boolean
}

export function ThermalPrinterSelect({
  open,
  onOpenChange,
  onSelectPaired,
  onScanNew,
  loading,
}: ThermalPrinterSelectProps) {
  const [devices, setDevices] = useState<BluetoothDevice[]>([])

  useEffect(() => {
    if (open) {
      getPairedDevices().then(setDevices)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bluetooth className="size-5 text-primary" />
            Sambungkan Printer Thermal
          </DialogTitle>
          <DialogDescription>
            Pilih printer yang sudah pernah dipasangkan atau cari printer baru.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {devices.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Tersimpan</p>
              {devices.map((device) => (
                <Button
                  key={device.id}
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => onSelectPaired(device)}
                  disabled={loading}
                >
                  <Radio className="size-4 text-muted-foreground shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {device.name ?? 'Printer Tidak Dikenal'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {device.id}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                atau
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full justify-start gap-3 h-auto py-3"
            onClick={onScanNew}
            disabled={loading}
          >
            {loading ? (
              <Spinner className="size-4" />
            ) : (
              <Wifi className="size-4 text-muted-foreground" />
            )}
            <div className="text-left">
              <p className="text-sm font-medium">Cari Printer Baru</p>
              <p className="text-xs text-muted-foreground">
                Scan perangkat Bluetooth di sekitar
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}