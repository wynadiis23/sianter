import { Button } from '@/components/ui/button'
import { Printer, ExternalLink } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { wita } from '@/lib/dayjs'

interface TicketData {
  kode: string
  namaLayanan: string
  trackingToken: string
}

interface KiosTicketProps {
  ticket: TicketData
  timestamp: Date
  countdown: number
  onPrint: () => void
  onReset: () => void
}

export function KiosTicket({ ticket, timestamp, countdown, onPrint, onReset }: KiosTicketProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      <div className="kiosk-stub-enter flex flex-col items-center gap-8 text-center">
        <div className="w-full max-w-95 rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">
          <div className="px-10 pt-10 pb-6">
            <p className="kiosk-font-mono text-[10px] tracking-[0.2em] text-muted-foreground/40 uppercase">
              Nomor Antrean
            </p>
            <p
              className="kiosk-font-mono mt-3 text-6xl font-bold tracking-[0.12em] text-primary leading-none"
              aria-label={`Nomor antrean ${ticket.kode}`}
            >
              {ticket.kode}
            </p>
          </div>

          <div className="kiosk-perforation" />

          <div className="px-10 pt-6 pb-10">
            <p className="font-body text-lg font-medium text-foreground">
              {ticket.namaLayanan}
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground/60">
              {wita(timestamp).format('dddd, D MMMM YYYY')}
            </p>
            <p className="font-body text-sm text-muted-foreground/60">
              {wita(timestamp).format('HH:mm:ss')} WITA
            </p>
            <div className="mt-4 flex justify-center">
              <QRCodeSVG
                value={`${window.location.origin}/track/${ticket.trackingToken}`}
                size={100}
              />
            </div>
            <div className="mt-2 flex items-center justify-center gap-1">
              <ExternalLink className="size-3 text-muted-foreground/40" />
              <a
                href={`/track/${ticket.trackingToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs text-muted-foreground/40 hover:text-primary transition-colors underline underline-offset-2"
              >
                Pantau antrean
              </a>
            </div>
            <p className="mt-3 font-body text-xs text-muted-foreground/40">
              Harap menunggu nomor Anda dipanggil
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={onPrint}
            className="h-14 min-w-65 gap-3 text-base"
          >
            <Printer className="size-5" />
            Cetak Struk
          </Button>
          <Button
            onClick={onReset}
            variant="ghost"
            className="h-14 min-w-65 text-base font-normal"
          >
            Selesai
            {countdown > 0 && (
              <span className="kiosk-font-mono ml-2 text-sm text-muted-foreground/50">
                ({countdown})
              </span>
            )}
          </Button>
        </div>
      </div>
    </main>
  )
}