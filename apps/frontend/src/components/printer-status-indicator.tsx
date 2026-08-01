import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Bluetooth, BluetoothOff, AlertCircle, RefreshCw } from 'lucide-react'

interface PrinterStatusIndicatorProps {
  isConnected: boolean
  isConnecting: boolean
  isReconnecting: boolean
  retryCountdown: number | null
  retryAttempt: number
  printerName: string | null
  connectionError: string | null
  onClick: () => void
  onReconnect: () => void
}

export function PrinterStatusIndicator({
  isConnected,
  isConnecting,
  isReconnecting,
  retryCountdown,
  retryAttempt,
  printerName,
  connectionError,
  onClick,
  onReconnect,
}: PrinterStatusIndicatorProps) {
  if (isConnected) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/50"
        title="Kelola Printer Thermal"
      >
        <Bluetooth className="size-4 text-green-500" />
        <span className="max-w-24 truncate text-xs text-muted-foreground/60">
          {printerName ?? 'Printer'}
        </span>
      </button>
    )
  }

  if (isConnecting || isReconnecting) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/50"
        title="Menghubungkan ke printer..."
      >
        <Spinner className="size-4 text-amber-500" />
        <span className="max-w-24 truncate text-xs text-muted-foreground/60">
          {isReconnecting ? 'Menghubungkan...' : 'Menghubungkan...'}
        </span>
      </button>
    )
  }

  if (retryCountdown !== null) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/50"
          title={connectionError ?? 'Menunggu percobaan ulang...'}
        >
          <Spinner className="size-4 text-amber-500" />
          <span className="max-w-24 truncate text-xs text-muted-foreground/60">
            Coba lagi dalam {retryCountdown}s
          </span>
          <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
            ke-{retryAttempt}
          </span>
        </button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onReconnect()
          }}
        >
          <RefreshCw className="size-3" />
          Hubungkan
        </Button>
      </div>
    )
  }

  if (connectionError) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/50"
          title={connectionError}
        >
          <AlertCircle className="size-4 text-destructive" />
          <span className="max-w-24 truncate text-xs text-destructive/70">
            Gagal
          </span>
        </button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation()
            onReconnect()
          }}
        >
          <RefreshCw className="size-3" />
          Hubungkan
        </Button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/50"
      title="Kelola Printer Thermal"
    >
      <BluetoothOff className="size-4 text-muted-foreground" />
      <span className="max-w-24 truncate text-xs text-muted-foreground/60">
        {printerName ?? 'Printer'}
      </span>
    </button>
  )
}