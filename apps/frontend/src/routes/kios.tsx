import { useState, useEffect, useCallback } from 'react'
import { server } from '@/lib/eden'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Printer, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

type PageState = 'loading' | 'select' | 'confirm' | 'creating' | 'ticket' | 'error'

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
}

const pad = (n: number) => n.toString().padStart(2, '0')

function formatClock(date: Date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  const wita = new Date(utc + 8 * 3600000)
  return `${pad(wita.getHours())}:${pad(wita.getMinutes())}:${pad(wita.getSeconds())}`
}

function formatDateLong(date: Date) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  const wita = new Date(utc + 8 * 3600000)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return `${days[wita.getDay()]}, ${wita.getDate()} ${months[wita.getMonth()]} ${wita.getFullYear()}`
}

function formatDateTime(d: Date) {
  const utc = d.getTime() + d.getTimezoneOffset() * 60000
  const wita = new Date(utc + 8 * 3600000)
  return `${wita.getFullYear()}-${pad(wita.getMonth() + 1)}-${pad(wita.getDate())} ${pad(wita.getHours())}:${pad(wita.getMinutes())}:${pad(wita.getSeconds())} WITA`
}


function Stepper({
  current,
  error,
}: {
  current: number
  error?: boolean
}) {
  const steps = ['Pilih Layanan', 'Konfirmasi', 'Ambil Tiket']

  return (
    <nav aria-label="Langkah pengambilan antrean" className="border-b border-border bg-card">
      <ol className="mx-auto flex max-w-xl items-center justify-center gap-0 px-4 py-4">
        {steps.map((label, i) => {
          const step = i + 1
          const isActive = step === current
          const isCompleted = step < current
          const isError = error && isActive

          return (
            <li key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
                    ${isError ? 'bg-destructive text-destructive-foreground' : ''}
                    ${isActive && !isError ? 'bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2 ring-offset-card' : ''}
                    ${isCompleted ? 'bg-primary/10 text-primary' : ''}
                    ${!isActive && !isCompleted && !isError ? 'bg-muted text-muted-foreground/40' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <span className="font-bold">{step}</span>
                  )}
                </div>
                <span
                  className={`hidden whitespace-nowrap text-xs sm:block
                    ${isActive ? 'font-semibold text-foreground' : ''}
                    ${isCompleted ? 'text-muted-foreground' : ''}
                    ${!isActive && !isCompleted ? 'text-muted-foreground/40' : ''}`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 mb-6 h-px w-10 sm:w-16 md:w-24
                    ${step <= current ? 'bg-primary/30' : 'bg-border'}`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function KiosPage() {
  const [state, setState] = useState<PageState>('loading')
  const [layananList, setLayananList] = useState<LayananItem[]>([])
  const [selectedLayanan, setSelectedLayanan] = useState<LayananItem | null>(null)
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const fetchLayanan = useCallback(async () => {
    setState('loading')
    setErrorMsg(null)
    const { data, error } = await server.api.kios.layanan.get()
    if (error || !data) {
      setErrorMsg('Gagal memuat daftar layanan. Silakan coba lagi.')
      setState('error')
      return
    }
    if (data.length === 0) {
      setErrorMsg('Belum ada layanan aktif saat ini.')
      setState('error')
      return
    }
    setLayananList(data)
    setState('select')
  }, [])

  useEffect(() => {
    fetchLayanan()
  }, [fetchLayanan])

  const currentStep =
    state === 'select'
      ? 1
      : state === 'confirm' || state === 'creating'
        ? 2
        : state === 'ticket'
          ? 3
          : 0

  const handleSelectLayanan = useCallback((layanan: LayananItem) => {
    setSelectedLayanan(layanan)
    setState('confirm')
  }, [])

  const handleCancelConfirm = useCallback(() => {
    setSelectedLayanan(null)
    setState('select')
  }, [])

  const handleCreateAntrean = useCallback(async () => {
    if (!selectedLayanan) return
    setState('creating')
    setErrorMsg(null)
    const { data, error } = await server.api.kios.antrean.post({
      layananId: selectedLayanan.id,
    })
    if (error || !data) {
      setErrorMsg('Gagal mengambil antrean. Silakan coba lagi.')
      setState('error')
      return
    }
    setTicket(data)
    setNow(new Date())
    setCountdown(15)
    setState('ticket')
  }, [selectedLayanan])

  const handleReset = useCallback(() => {
    setSelectedLayanan(null)
    setTicket(null)
    setErrorMsg(null)
    setCountdown(15)
    fetchLayanan()
  }, [fetchLayanan])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  useEffect(() => {
    if (state !== 'ticket') return
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [state])

  useEffect(() => {
    if (state === 'ticket' && countdown <= 0) {
      handleReset()
    }
  }, [countdown, state, handleReset])

  /* ─── Loading ─── */
  if (state === 'loading') {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-background">
        <Spinner className="size-10 text-primary" />
        <p className="font-body text-base text-muted-foreground">Memuat layanan...</p>
      </div>
    )
  }

  /* ─── Error tanpa flow ─── */
  if (state === 'error' && !selectedLayanan) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-background px-6">
        <AlertCircle className="size-12 text-destructive" />
        <p className="font-body text-center text-lg text-foreground">{errorMsg}</p>
        <Button
          onClick={fetchLayanan}
          className="h-13 gap-3 px-8 text-base"
        >
          <RefreshCw className="size-4" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  /* ─── Main layout with stepper ─── */
  return (
    <>
      {/* ─── Print receipt (outside the hidden parent) ─── */}
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
            {ticket?.kode}
          </p>
          <div className="my-6 border-t border-border" />
          <p className="font-body text-base text-foreground">
            {ticket?.namaLayanan}
          </p>
          <p className="mt-2 font-body text-sm text-muted-foreground/60">
            {ticket ? formatDateTime(now) : ''}
          </p>
          <div className="my-6 border-t border-border" />
          <p className="font-body text-xs text-muted-foreground/60">
            Harap menunggu nomor antrean Anda dipanggil.
          </p>
          <p className="font-body text-xs text-muted-foreground/60">
            Terima kasih telah menggunakan layanan ini.
          </p>
        </div>
      </div>

    <div className="kiosk flex h-dvh flex-col print:hidden">
      {/* Masthead */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
        <img src="/logo-kpu-bali.png" alt="KPU Provinsi Bali" className="size-11" />
        <div className="flex-1">
          <h1 className="kiosk-font-wordmark text-xl leading-tight text-foreground">
            KPU PROVINSI BALI
          </h1>
          <p className="kiosk-font-mono text-[10px] tracking-wider text-muted-foreground/60">
            SISTEM INFORMASI ANTREAN
          </p>
        </div>
        <time
          className="kiosk-font-mono text-lg tracking-widest text-foreground"
          aria-label="Jam saat ini WITA"
        >
          {formatClock(now)}
        </time>
        <span className="kiosk-font-mono text-[10px] text-muted-foreground/60">WITA</span>
      </header>

      {/* Stepper */}
      <Stepper
        current={currentStep}
        error={state === 'error' && !!selectedLayanan}
      />

      {/* ─── Step 1: Select service ─── */}
      {state === 'select' && (
        <main className="flex flex-1 flex-col overflow-auto px-6 py-8">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-6 text-center">
              <h2 className="kiosk-font-wordmark text-2xl text-foreground">
                Pilih Layanan
              </h2>
              <p className="mt-0.5 font-body text-sm text-muted-foreground/70">
                Ketuk layanan yang Anda butuhkan
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {layananList.map((layanan) => (
                <button
                  key={layanan.id}
                  type="button"
                  onClick={() => handleSelectLayanan(layanan)}
                  className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-all duration-150 active:scale-[0.97] active:bg-primary active:border-primary active:text-primary-foreground"
                  style={
                    layanan.warna
                      ? ({
                          backgroundColor: `${layanan.warna}0D`,
                          borderColor: `${layanan.warna}4D`,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <span className="kiosk-font-wordmark text-5xl leading-none text-inherit">
                    {layanan.prefix}
                  </span>
                  <span className="font-body text-base font-medium text-inherit">
                    {layanan.nama}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ─── Step 2: Confirm / Creating / Error ─── */}
      {(state === 'confirm' || state === 'creating' || (state === 'error' && selectedLayanan)) && (
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          {state === 'confirm' && selectedLayanan && (
            <div className="flex flex-col items-center gap-6 text-center">
              <CheckCircle2 className="size-14 text-primary" />
              <div>
                <h2 className="kiosk-font-wordmark text-2xl text-foreground">
                  Ambil Antrean
                </h2>
                <p className="mt-1 font-body text-base text-muted-foreground/70">
                  Anda akan mengambil antrean untuk:
                </p>
              </div>
              <p className="kiosk-font-wordmark text-4xl leading-tight text-foreground">
                {selectedLayanan.nama}
              </p>
              <div className="mt-2 flex flex-col gap-4">
                <Button
                  onClick={handleCreateAntrean}
                  className="h-14 min-w-[260px] text-lg font-body"
                >
                  Ya, Ambil Antrean
                </Button>
                <Button
                  onClick={handleCancelConfirm}
                  variant="ghost"
                  className="h-14 min-w-[260px] text-base font-normal"
                >
                  Batal
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

          {state === 'error' && selectedLayanan && (
            <div className="flex flex-col items-center gap-6 text-center">
              <AlertCircle className="size-12 text-destructive" />
              <p className="font-body text-base text-foreground">{errorMsg}</p>
              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleCreateAntrean}
                  className="h-13 min-w-[240px] gap-3 text-base"
                >
                  <RefreshCw className="size-4" />
                  Coba Lagi
                </Button>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="h-13 min-w-[240px] text-base font-normal"
                >
                  Kembali ke Awal
                </Button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ─── Step 3: Ticket ─── */}
      {state === 'ticket' && ticket && (
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <div className="kiosk-stub-enter flex flex-col items-center gap-8 text-center">
            <div className="w-full max-w-[380px] rounded-2xl border border-border bg-card shadow-lg">
              {/* Stub top — number */}
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

              {/* Perforation */}
              <div className="kiosk-perforation" />

              {/* Stub bottom — info */}
              <div className="px-10 pt-6 pb-10">
                <p className="font-body text-lg font-medium text-foreground">
                  {ticket.namaLayanan}
                </p>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground/60">
                  {formatDateLong(now)}
                </p>
                <p className="font-body text-sm text-muted-foreground/60">
                  {formatClock(now)} WITA
                </p>
                <p className="mt-4 font-body text-xs text-muted-foreground/40">
                  Harap menunggu nomor Anda dipanggil
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handlePrint}
                className="h-14 min-w-[260px] gap-3 text-base"
              >
                <Printer className="size-5" />
                Cetak Struk
              </Button>
              <Button
                onClick={handleReset}
                variant="ghost"
                className="h-14 min-w-[260px] text-base font-normal"
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
      )}

    </div></>
  )
}
