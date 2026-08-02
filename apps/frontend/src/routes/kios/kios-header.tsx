import { wita } from '@/lib/dayjs'
import { ThemeSelector } from '@/components/theme-selector'
import { PrinterStatusIndicator } from '@/components/printer-status-indicator'

interface KiosHeaderProps {
  now: Date
  isConnected: boolean
  isConnecting: boolean
  isReconnecting: boolean
  retryCountdown: number | null
  retryAttempt: number
  printerName: string | null
  connectionError: string | null
  onPrinterClick: () => void
}

export function KiosHeader({
  now,
  isConnected,
  isConnecting,
  isReconnecting,
  retryCountdown,
  retryAttempt,
  printerName,
  connectionError,
  onPrinterClick,
}: KiosHeaderProps) {
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
      <PrinterStatusIndicator
        isConnected={isConnected}
        isConnecting={isConnecting}
        isReconnecting={isReconnecting}
        retryCountdown={retryCountdown}
        retryAttempt={retryAttempt}
        printerName={printerName}
        connectionError={connectionError}
        onClick={onPrinterClick}
      />
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