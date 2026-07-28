import { useState, useEffect, useCallback } from 'react'
import { server } from '@/lib/eden'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, RefreshCw, User } from 'lucide-react'
import { Stepper } from '@/components/stepper'
import { IdentityForm } from '@/components/identity-form'
import { KiosHeader } from '@/routes/kios/kios-header'
import { KiosServiceSelect } from '@/routes/kios/kios-service-select'
import { KiosCheckIn } from '@/routes/kios/kios-check-in'
import { KiosConfirm } from '@/routes/kios/kios-confirm'
import { KiosTicket } from '@/routes/kios/kios-ticket'
import { KiosPrinterManager } from '@/routes/kios/kios-printer-manager'
import { useThermalPrinter } from '@/hooks/use-thermal-printer'

type PageState = 'loading' | 'select' | 'checkin' | 'identity' | 'confirm' | 'creating' | 'ticket' | 'error'

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
  kuesionerLink?: string | null
  kuesionerCaption?: string | null
}

const KIOS_STEPS = ['Pilih Layanan', 'Isi Identitas', 'Konfirmasi', 'Ambil Tiket']

export function KiosPage() {
  const [state, setState] = useState<PageState>('loading')
  const [layananList, setLayananList] = useState<LayananItem[]>([])
  const [selectedLayanan, setSelectedLayanan] = useState<LayananItem | null>(null)
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  const [countdown, setCountdown] = useState(15)

  const [nama, setNama] = useState('')
  const [noHp, setNoHp] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [checkInError, setCheckInError] = useState<string | null>(null)
  const [checkInToken, setCheckInToken] = useState('')
  const [inputMode, setInputMode] = useState<'scan' | 'manual'>('scan')
  const [showPrinterManager, setShowPrinterManager] = useState(false)

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
      : state === 'identity'
        ? 2
        : state === 'confirm' || state === 'creating'
          ? 3
          : state === 'ticket'
            ? 4
            : 0

  const handleSelectLayanan = useCallback((layanan: LayananItem) => {
    setSelectedLayanan(layanan)
    setNama('')
    setNoHp('')
    setFormError(null)
    setState('identity')
  }, [])

  const handleBackToSelect = useCallback(() => {
    setSelectedLayanan(null)
    setNama('')
    setNoHp('')
    setFormError(null)
    setState('select')
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
    setState('confirm')
  }, [nama, noHp])

  const handleBackToIdentity = useCallback(() => {
    setState('identity')
  }, [])

  const handleCreateAntrean = useCallback(async () => {
    if (!selectedLayanan) return
    setState('creating')
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
      setState('error')
      return
    }
    setTicket(data)
    setNow(new Date())
    setCountdown(15)
    setState('ticket')
  }, [selectedLayanan, nama, noHp])

  const handleCheckIn = useCallback(async (token: string) => {
    setState('creating')
    setCheckInError(null)
    setErrorMsg(null)
    const { data, error } = await server.api.kios['check-in'].post({
      token,
    })
    if (error || !data) {
      const msg =
        error?.value && 'message' in error.value
          ? (error.value as { message: string }).message
          : 'Gagal check-in. Silakan coba lagi.'
      setCheckInError(msg)
      setState('checkin')
      return
    }
    setTicket(data)
    setNow(new Date())
    setCountdown(15)
    setState('ticket')
  }, [])

  const handleReset = useCallback(() => {
    setSelectedLayanan(null)
    setTicket(null)
    setErrorMsg(null)
    setNama('')
    setNoHp('')
    setFormError(null)
    setCheckInError(null)
    setCheckInToken('')
    setInputMode('scan')
    setCountdown(15)
    fetchLayanan()
  }, [fetchLayanan])

  const { print, hasSavedDevice, defaultPrinterName, testPrint, forgetDevice, refreshPaired } = useThermalPrinter()

  const handlePrint = useCallback(async () => {
    if (!ticket) return
    try {
      await print({
        kode: ticket.kode,
        namaLayanan: ticket.namaLayanan,
        timestamp: now,
        trackingUrl: `${window.location.origin}/track/${ticket.trackingToken}`,
        kuesionerUrl: ticket.kuesionerLink ?? null,
        kuesionerCaption: ticket.kuesionerCaption ?? null,
      })
    } catch {
      // toast already handled by the hook
    }
  }, [ticket, now, print])

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

  if (state === 'loading') {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-background">
        <Spinner className="size-10 text-primary" />
        <p className="font-body text-base text-muted-foreground">Memuat layanan...</p>
      </div>
    )
  }

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

  return (
    <>
      <div className="kiosk flex h-dvh flex-col bg-linear-to-b from-primary/4 via-background to-background print:hidden">
        <KiosHeader
            now={now}
            hasSavedPrinter={hasSavedDevice}
            printerName={defaultPrinterName}
            onPrinterClick={() => setShowPrinterManager(true)}
          />

        <Stepper
          steps={KIOS_STEPS}
          current={currentStep}
          error={state === 'error' && !!selectedLayanan}
        />

        <div className="kiosk-step-container flex flex-1 flex-col">
        {state === 'select' && (
          <KiosServiceSelect
            layananList={layananList}
            onSelectLayanan={handleSelectLayanan}
            onOpenCheckIn={() => { setCheckInError(null); setCheckInToken(''); setInputMode('scan'); setState('checkin') }}
          />
        )}

        {state === 'checkin' && (
          <KiosCheckIn
            inputMode={inputMode}
            checkInToken={checkInToken}
            checkInError={checkInError}
            onInputModeToggle={() => { setInputMode(inputMode === 'scan' ? 'manual' : 'scan'); setCheckInError(null); setCheckInToken('') }}
            onTokenChange={(v) => { setCheckInToken(v); setCheckInError(null) }}
            onCheckIn={handleCheckIn}
            onScan={handleCheckIn}
            onScanError={setCheckInError}
            onBack={() => { setCheckInError(null); setCheckInToken(''); setInputMode('scan'); setState('select') }}
          />
        )}

        {state === 'identity' && (
          <main className="flex flex-1 flex-col items-center justify-center px-6 py-8">
            <div className="mb-6 text-center">
              <User className="mx-auto mb-3 size-10 text-primary" />
              <h2 className="kiosk-font-wordmark text-2xl text-foreground">
                Isi Identitas
              </h2>
              <p className="mt-0.5 font-body text-sm text-muted-foreground/70">
                Masukkan data diri Anda
              </p>
            </div>
            <IdentityForm
              nama={nama}
              noHp={noHp}
              onNamaChange={setNama}
              onNoHpChange={setNoHp}
              error={formError}
              onSubmit={handleIdentitySubmit}
              onBack={handleBackToSelect}
            />
          </main>
        )}

        {(state === 'confirm' || state === 'creating' || (state === 'error' && selectedLayanan)) && (
          <KiosConfirm
            state={state === 'error' ? 'error' : state}
            namaLayanan={selectedLayanan?.nama}
            nama={nama}
            noHp={noHp}
            errorMsg={errorMsg}
            onConfirm={handleCreateAntrean}
            onBack={handleBackToIdentity}
            onRetry={handleCreateAntrean}
            onReset={handleReset}
          />
        )}

        {state === 'ticket' && ticket && (
          <KiosTicket
            ticket={ticket}
            timestamp={now}
            countdown={countdown}
            onPrint={handlePrint}
            onReset={handleReset}
          />
        )}
        </div>
      </div>

      <KiosPrinterManager
        open={showPrinterManager}
        onOpenChange={setShowPrinterManager}
        hasSavedPrinter={hasSavedDevice}
        printerName={defaultPrinterName}
        testPrint={testPrint}
        forgetDevice={forgetDevice}
        refreshPaired={refreshPaired}
      />
    </>
  )
}