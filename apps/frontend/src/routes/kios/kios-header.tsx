import { wita } from '@/lib/dayjs'
import { ThemeSelector } from '@/components/theme-selector'
import { Bluetooth, BluetoothOff } from 'lucide-react'

interface KiosHeaderProps {
  now: Date
  hasSavedPrinter: boolean
  printerName: string | null
  onPrinterClick: () => void
}

export function KiosHeader({ now, hasSavedPrinter, printerName, onPrinterClick }: KiosHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-card/80 px-5 py-3 shadow-sm backdrop-blur-sm">
      <img src="/logo-kpu-bali.png" alt="KPU Provinsi Bali" className="size-11" />
      <div className="flex-1">
        <h1 className="kiosk-font-wordmark text-2xl leading-tight tracking-tight text-foreground">
          KPU PROVINSI BALI
        </h1>
        <p className="kiosk-font-mono text-[10px] tracking-wider text-muted-foreground/60">
          SISTEM INFORMASI ANTREAN
        </p>
      </div>
      <button
        type="button"
        onClick={onPrinterClick}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/50"
        title="Kelola Printer Thermal"
      >
        {hasSavedPrinter ? (
          <Bluetooth className="size-4 text-green-500" />
        ) : (
          <BluetoothOff className="size-4 text-muted-foreground" />
        )}
        <span className="kiosk-font-mono text-[10px] text-muted-foreground/60 max-w-24 truncate">
          {printerName ?? 'Printer'}
        </span>
      </button>
      <time
        className="kiosk-font-mono text-lg tracking-widest text-foreground"
        aria-label="Jam saat ini WITA"
      >
        {wita(now).format('HH:mm:ss')}
      </time>
      <span className="kiosk-font-mono text-[10px] text-muted-foreground/60">WITA</span>
      <ThemeSelector />
    </header>
  )
}