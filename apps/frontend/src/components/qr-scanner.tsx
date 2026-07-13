import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, AlertCircle } from 'lucide-react'

interface QrScannerProps {
  onScan: (token: string) => void
  onError?: (error: string) => void
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const elementId = useRef(`qr-scanner-${Math.random().toString(36).slice(2, 9)}`).current
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const runningRef = useRef(false)
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  onScanRef.current = onScan
  onErrorRef.current = onError

  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const scanned = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode(elementId)
    scannerRef.current = scanner

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          setStatus('error')
          setErrorMsg('Kamera tidak ditemukan')
          onErrorRef.current?.('Kamera tidak ditemukan')
          return
        }

        const backCamera = devices.find((d) =>
          d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('belakang'),
        )

        scanner
          .start(
            backCamera?.id ?? devices[0].id,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (scanned.current) return
              scanned.current = true
              runningRef.current = false
              scanner.stop()
                .then(() => onScanRef.current(decodedText))
                .catch(() => onScanRef.current(decodedText))
            },
            () => {
              // scan failure — ignore
            },
          )
          .then(() => {
            runningRef.current = true
            setStatus('scanning')
          })
          .catch(() => {
            setStatus('error')
            setErrorMsg('Gagal mengakses kamera')
            onErrorRef.current?.('Gagal mengakses kamera')
          })
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('Gagal mengakses kamera')
        onErrorRef.current?.('Gagal mengakses kamera')
      })

    return () => {
      if (runningRef.current) {
        scanner.stop().catch(() => {})
      }
    }
  }, [elementId])

  return (
    <div className="flex flex-col items-center gap-4">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Camera className="size-10 animate-pulse" />
          <p className="font-body text-sm">Mengakses kamera...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 text-destructive">
          <AlertCircle className="size-10" />
          <p className="font-body text-sm">{errorMsg}</p>
        </div>
      )}

      <div
        id={elementId}
        className="w-full max-w-sm overflow-hidden rounded-lg"
        style={{ aspectRatio: '1' }}
      />
    </div>
  )
}