import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

interface KiosConfirmProps {
  state: 'confirm' | 'creating' | 'error'
  namaLayanan?: string
  nama: string
  noHp: string
  errorMsg: string | null
  onConfirm: () => void
  onBack: () => void
  onRetry: () => void
  onReset: () => void
}

export function KiosConfirm({
  state,
  namaLayanan,
  nama,
  noHp,
  errorMsg,
  onConfirm,
  onBack,
  onRetry,
  onReset,
}: KiosConfirmProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      {state === 'confirm' && (
        <div className="flex flex-col items-center gap-6 text-center">
          <CheckCircle2 className="size-14 text-primary" />
          <div>
            <h2 className="kiosk-font-wordmark text-2xl text-foreground">
              Konfirmasi
            </h2>
            <p className="mt-1 font-body text-base text-muted-foreground/70">
              Anda akan mengambil antrean untuk:
            </p>
          </div>
          <p className="kiosk-font-wordmark text-4xl leading-tight text-foreground">
            {namaLayanan}
          </p>
          <div className="w-full max-w-sm rounded-xl border border-border bg-card px-6 py-4 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-body text-sm text-muted-foreground">Nama</span>
                <span className="font-body text-sm font-medium text-foreground">{nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body text-sm text-muted-foreground">No. HP</span>
                <span className="font-body text-sm font-medium text-foreground">{noHp}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-4">
            <Button
              onClick={onConfirm}
              className="h-14 min-w-65 text-lg font-body"
            >
              Ya, Ambil Antrean
            </Button>
            <Button
              onClick={onBack}
              variant="ghost"
              className="h-14 min-w-65 text-base font-normal"
            >
              Kembali
            </Button>
          </div>
        </div>
      )}

      {state === 'creating' && (
        <div className="flex flex-col items-center gap-6 text-center">
          <Spinner className="size-12 text-primary" />
          <p className="font-body text-base text-muted-foreground/70">
            Memproses antrean...
          </p>
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center gap-6 text-center">
          <AlertCircle className="size-12 text-destructive" />
          <p className="font-body text-base text-foreground">{errorMsg}</p>
          <div className="flex flex-col gap-4">
            <Button
              onClick={onRetry}
              className="h-13 min-w-60 gap-3 text-base"
            >
              <RefreshCw className="size-4" />
              Coba Lagi
            </Button>
            <Button
              onClick={onReset}
              variant="ghost"
              className="h-13 min-w-60 text-base font-normal"
            >
              Kembali ke Awal
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}