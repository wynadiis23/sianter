import { Volume2, VolumeX } from 'lucide-react'
import { ThemeSelector } from '@/components/theme-selector'
import type { WsStatus } from '@/lib/ws'

interface MonitorHeaderProps {
  time: string
  wsStatus: WsStatus
  speechEnabled: boolean
  onToggleSpeech: () => void
}

export function MonitorHeader({ time, wsStatus, speechEnabled, onToggleSpeech }: MonitorHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card/80 px-5 py-3 shadow-sm">
      <img src="/logo-kpu-bali.png" alt="KPU Provinsi Bali" className="size-11" />
      <div className="flex-1">
        <h1 className="kiosk-font-wordmark text-2xl leading-tight tracking-tight text-foreground">
          KPU PROVINSI BALI
        </h1>
        <p className="kiosk-font-mono text-[10px] tracking-wider text-muted-foreground/60">
          SISTEM INFORMASI ANTREAN
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeSelector />
        <span
          className={`size-2 rounded-full ${wsStatus === 'connected' ? 'bg-green-400' :
            wsStatus === 'disconnected' ? 'bg-red-400' :
              'bg-yellow-400'
            }`}
        />
        <time
          className="kiosk-font-mono text-lg tracking-widest text-foreground"
          aria-label="Jam saat ini"
        >
          {time}
        </time>
        <button
          onClick={onToggleSpeech}
          className="rounded p-1 text-foreground transition-[color,background-color,transform] duration-150 ease-enter hover:bg-foreground/10 active:scale-[0.92]"
          title={speechEnabled ? 'Matikan suara' : 'Nyalakan suara'}
        >
          {speechEnabled ? (
            <Volume2 className="size-4" />
          ) : (
            <VolumeX className="size-4" />
          )}
        </button>
      </div>
    </header>
  )
}