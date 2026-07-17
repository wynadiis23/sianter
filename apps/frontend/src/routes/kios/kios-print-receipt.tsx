import { QRCodeSVG } from 'qrcode.react'
import { wita } from '@/lib/dayjs'

interface KiosPrintReceiptProps {
  kode?: string
  namaLayanan?: string
  trackingToken?: string
  timestamp: Date
}

export function KiosPrintReceipt({ kode, namaLayanan, trackingToken, timestamp }: KiosPrintReceiptProps) {
  return (
    <div className="hidden print:flex print:fixed print:inset-0 print:flex-col print:items-center print:justify-center print:bg-white print:p-8">
      <div className="w-[320px] text-center">
        <img src="/logo-kpu-bali.png" alt="KPU Provinsi Bali" className="mx-auto mb-4 size-11" />
        <h3 className="kiosk-font-wordmark text-lg text-foreground">
          KOMISI PEMILIHAN UMUM PROVINSI BALI
        </h3>
        <div className="my-6 border-t border-border" />
        <p className="kiosk-font-mono text-[10px] tracking-[0.2em] text-muted-foreground/40 uppercase">
          Nomor Antrean
        </p>
        <p className="kiosk-font-mono mt-4 text-5xl font-bold tracking-[0.12em] text-primary leading-none">
          {kode}
        </p>
        <div className="my-6 border-t border-border" />
        <p className="font-body text-base text-foreground">
          {namaLayanan}
        </p>
        <p className="mt-2 font-body text-sm text-muted-foreground/60">
          {wita(timestamp).format('YYYY-MM-DD HH:mm:ss')} WITA
        </p>
        <div className="my-6 border-t border-border" />
        {trackingToken && (
          <div className="flex justify-center mb-4">
            <QRCodeSVG
              value={`${window.location.origin}/track/${trackingToken}`}
              size={120}
            />
          </div>
        )}
        <p className="font-body text-xs text-muted-foreground/60">
          Scan QR untuk pantau antrean
        </p>
        <div className="my-4 border-t border-border" />
        <p className="font-body text-xs text-muted-foreground/60">
          Harap menunggu nomor antrean Anda dipanggil.
        </p>
        <p className="font-body text-xs text-muted-foreground/60">
          Terima kasih telah menggunakan layanan ini.
        </p>
      </div>
    </div>
  )
}