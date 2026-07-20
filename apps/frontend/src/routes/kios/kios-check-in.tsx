import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { QrCode, Keyboard } from 'lucide-react'
import { QrScanner } from '@/components/qr-scanner'

interface KiosCheckInProps {
  inputMode: 'scan' | 'manual'
  checkInToken: string
  checkInError: string | null
  onInputModeToggle: () => void
  onTokenChange: (value: string) => void
  onCheckIn: (token: string) => void
  onScan: (token: string) => void
  onScanError: (msg: string) => void
  onBack: () => void
}

export function KiosCheckIn({
  inputMode,
  checkInToken,
  checkInError,
  onInputModeToggle,
  onTokenChange,
  onCheckIn,
  onScan,
  onScanError,
  onBack,
}: KiosCheckInProps) {
  const id = useId()

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <QrCode className="mx-auto mb-3 size-10 text-primary" />
          <h2 className="kiosk-font-wordmark text-2xl text-foreground">
            Check-In Online
          </h2>
          <p className="mt-0.5 font-body text-sm text-muted-foreground/70">
            {inputMode === 'scan'
              ? 'Arahkan QR code tiket Anda ke kamera'
              : 'Masukkan token dari tiket online Anda'}
          </p>
        </div>

        {inputMode === 'scan' ? (
          <QrScanner
            onScan={onScan}
            onError={onScanError}
          />
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor={`${id}-token`} className="font-body text-sm font-medium text-foreground">
                Token Check-In
              </label>
              <input
                id={`${id}-token`}
                type="text"
                value={checkInToken}
                onChange={(e) => { onTokenChange(e.target.value) }}
                placeholder="Tempel token dari tiket online"
                className="h-13 w-full rounded-lg border border-input bg-card px-4 text-lg text-foreground shadow-sm transition-[color,box-shadow,transform] duration-150 ease-enter outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              onClick={() => onCheckIn(checkInToken.trim())}
              disabled={!checkInToken.trim()}
              className="h-14 w-full text-lg font-body"
            >
              Check-In
            </Button>
          </div>
        )}

        {checkInError && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3">
            <p className="font-body text-sm text-destructive">{checkInError}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={onInputModeToggle}
            variant="ghost"
            className="h-14 w-full text-base font-normal"
          >
            {inputMode === 'scan' ? (
              <span className="flex items-center gap-2">
                <Keyboard className="size-4" />
                Masukkan Token Manual
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <QrCode className="size-4" />
                Scan QR Code
              </span>
            )}
          </Button>
          <Button
            onClick={onBack}
            variant="ghost"
            className="h-14 w-full text-base font-normal"
          >
            Kembali
          </Button>
        </div>
      </div>
    </main>
  )
}