import { useState, useEffect, useCallback } from 'react'
import { server } from '@/lib/eden'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

type Step = 'select' | 'identity' | 'confirm' | 'creating' | 'ticket' | 'error'

interface LayananItem {
  id: string
  nama: string
  prefix: string
  deskripsi?: string | null
  gambar?: string | null
  warna?: string | null
}

interface TicketData {
  kode: string
  nomorUrut: number
  namaLayanan: string
  trackingToken: string
}

export function OnlineAntreanPage() {
  const [step, setStep] = useState<Step>('select')
  const [layananList, setLayananList] = useState<LayananItem[]>([])
  const [selectedLayanan, setSelectedLayanan] = useState<LayananItem | null>(null)
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [nama, setNama] = useState('')
  const [noHp, setNoHp] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const fetchLayanan = useCallback(async () => {
    setErrorMsg(null)
    const { data, error } = await server.api.kios.layanan.get()
    if (error || !data) {
      setErrorMsg('Gagal memuat daftar layanan. Silakan coba lagi.')
      setStep('error')
      return
    }
    if (data.length === 0) {
      setErrorMsg('Belum ada layanan aktif saat ini.')
      setStep('error')
      return
    }
    setLayananList(data)
  }, [])

  useEffect(() => {
    fetchLayanan()
  }, [fetchLayanan])

  const handleSelectLayanan = useCallback((layanan: LayananItem) => {
    setSelectedLayanan(layanan)
    setNama('')
    setNoHp('')
    setFormError(null)
    setStep('identity')
  }, [])

  const handleIdentitySubmit = useCallback(() => {
    const trimmedNama = nama.trim()
    const trimmedNoHp = noHp.trim()

    if (!trimmedNama) {
      setFormError('Nama harus diisi')
      return
    }
    if (trimmedNoHp.length < 10 || trimmedNoHp.length > 15 || !/^0\d+$/.test(trimmedNoHp)) {
      setFormError('Masukkan nomor HP yang valid (diawali 0, 10-15 digit)')
      return
    }
    setFormError(null)
    setStep('confirm')
  }, [nama, noHp])

  const handleCreateAntrean = useCallback(async () => {
    if (!selectedLayanan) return
    setStep('creating')
    setErrorMsg(null)
    const { data, error } = await server.api.kios.antrean.post({
      layananId: selectedLayanan.id,
      nama: nama.trim(),
      noHp: noHp.trim(),
    })
    if (error || !data) {
      const msg =
        error?.value && 'message' in error.value
          ? (error.value as { message: string }).message
          : 'Gagal mengambil antrean. Silakan coba lagi.'
      setErrorMsg(msg)
      setStep('error')
      return
    }
    setTicket(data)
    setStep('ticket')
  }, [selectedLayanan, nama, noHp])

  const handleReset = useCallback(() => {
    setSelectedLayanan(null)
    setTicket(null)
    setErrorMsg(null)
    setNama('')
    setNoHp('')
    setFormError(null)
    setStep('select')
  }, [])

  if (step === 'error' && !selectedLayanan) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6">
        <AlertCircle className="size-12 text-destructive" />
        <p className="text-center text-lg text-foreground">{errorMsg}</p>
        <Button onClick={fetchLayanan} className="gap-3 px-8">
          <RefreshCw className="size-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary/[0.03] via-background to-background">
      <header className="border-b border-border bg-card/80 px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Antrean Online</h1>
            <p className="text-xs text-muted-foreground">KPU Provinsi Bali</p>
          </div>
        </div>
      </header>

      {step === 'select' && (
        <main className="mx-auto max-w-lg px-4 py-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Pilih Layanan</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pilih layanan yang Anda butuhkan</p>
          </div>
          <div className="space-y-3">
            {layananList.map((layanan) => (
              <button
                key={layanan.id}
                type="button"
                onClick={() => handleSelectLayanan(layanan)}
                className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
              >
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-lg text-xl font-bold"
                  style={{
                    backgroundColor: layanan.warna ? `${layanan.warna}15` : 'var(--color-primary)',
                    color: layanan.warna ?? 'var(--color-primary)',
                  }}
                >
                  {layanan.prefix}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{layanan.nama}</p>
                  {layanan.deskripsi && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{layanan.deskripsi}</p>
                  )}
                </div>
                <ChevronLeft className="size-5 rotate-180 text-muted-foreground" />
              </button>
            ))}
          </div>
        </main>
      )}

      {step === 'identity' && (
        <main className="mx-auto max-w-sm px-4 py-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Isi Identitas</h2>
            <p className="mt-1 text-sm text-muted-foreground">Masukkan data diri Anda</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nama Lengkap <span className="text-destructive">*</span>
              </label>
              <Input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama sesuai KTP"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nomor HP <span className="text-destructive">*</span>
              </label>
              <Input
                type="tel"
                inputMode="tel"
                value={noHp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setNoHp(val)
                }}
                placeholder="08xxxxxxxxxx"
                maxLength={15}
              />
            </div>
            {formError && (
              <div className="rounded-lg bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={handleIdentitySubmit}
              disabled={!nama.trim() || !noHp.trim()}
              className="w-full"
            >
              Lanjut
            </Button>
            <Button
              onClick={handleReset}
              variant="ghost"
              className="w-full"
            >
              Kembali
            </Button>
          </div>
        </main>
      )}

      {step === 'confirm' && selectedLayanan && (
        <main className="mx-auto max-w-sm px-4 py-8">
          <div className="mb-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 size-12 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Konfirmasi</h2>
            <p className="mt-1 text-sm text-muted-foreground">Anda akan mengambil antrean untuk:</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-2xl font-bold text-foreground">{selectedLayanan.nama}</p>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama</span>
                <span className="font-medium text-foreground">{nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. HP</span>
                <span className="font-medium text-foreground">{noHp}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={handleCreateAntrean} className="w-full">
              Ya, Ambil Antrean
            </Button>
            <Button onClick={() => setStep('identity')} variant="ghost" className="w-full">
              Kembali
            </Button>
          </div>
        </main>
      )}

      {step === 'creating' && (
        <main className="flex flex-col items-center justify-center gap-6 px-4 py-24">
          <Spinner className="size-10 text-primary" />
          <p className="text-base text-muted-foreground">Memproses antrean...</p>
        </main>
      )}

      {step === 'ticket' && ticket && (
        <main className="mx-auto max-w-sm px-4 py-8">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xl shadow-primary/5">
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground/40 uppercase">
              Nomor Antrean
            </p>
            <p className="mt-2 text-5xl font-bold tracking-[0.1em] text-primary">
              {ticket.kode}
            </p>
            <div className="my-4 border-t border-border" />
            <p className="text-lg font-medium text-foreground">
              {ticket.namaLayanan}
            </p>
            <div className="mt-4 flex justify-center">
              <QRCodeSVG
                value={`${window.location.origin}/track/${ticket.trackingToken}`}
                size={140}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-1">
              <ExternalLink className="size-3 text-muted-foreground" />
              <a
                href={`/track/${ticket.trackingToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                Pantau antrean
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Simpan halaman tracking untuk pantau antrean Anda
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={() => window.open(`/track/${ticket.trackingToken}`, '_blank')}
              className="w-full gap-2"
            >
              <ExternalLink className="size-4" />
              Buka Halaman Tracking
            </Button>
            <Button onClick={handleReset} variant="outline" className="w-full">
              Ambil Antrean Lain
            </Button>
          </div>
        </main>
      )}

      {step === 'error' && selectedLayanan && (
        <main className="mx-auto max-w-sm px-4 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 size-12 text-destructive" />
            <p className="mb-6 text-lg text-foreground">{errorMsg}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleCreateAntrean} className="w-full gap-2">
                <RefreshCw className="size-4" />
                Coba Lagi
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full">
                Kembali ke Awal
              </Button>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
