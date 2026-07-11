import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { server } from '@/lib/eden'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface TrackData {
  kode: string
  status: string
  nama: string
  namaLayanan: string
  position: number | null
  totalWaiting: number
  loketNama: string | null
  createdAt: string
  calledAt: string | null
  finishedAt: string | null
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  WAITING: { label: 'Menunggu', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  CALLED: { label: 'Dipanggil', color: 'text-green-600 bg-green-50 border-green-200' },
  RECALLED: { label: 'Dipanggil Ulang', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  SKIPPED: { label: 'Dilewati', color: 'text-red-600 bg-red-50 border-red-200' },
  FINISHED: { label: 'Selesai', color: 'text-blue-600 bg-blue-50 border-blue-200' },
}

const pad = (n: number) => n.toString().padStart(2, '0')

function formatTime(iso: string) {
  const d = new Date(iso)
  const utc = d.getTime() + d.getTimezoneOffset() * 60000
  const wita = new Date(utc + 8 * 3600000)
  return `${pad(wita.getHours())}:${pad(wita.getMinutes())}:${pad(wita.getSeconds())} WITA`
}

function TrackStatus({ data }: { data: TrackData }) {
  const status = STATUS_LABEL[data.status] ?? { label: data.status, color: 'text-gray-600 bg-gray-50 border-gray-200' }
  const isWaiting = data.status === 'WAITING'
  const isCalled = data.status === 'CALLED' || data.status === 'RECALLED'
  const isDone = data.status === 'FINISHED'

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary/[0.03] via-background to-background">
      <header className="border-b border-border bg-card/80 px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Tracking Antrean</h1>
            <p className="text-xs text-muted-foreground">KPU Provinsi Bali</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
          <p className="text-[10px] tracking-[0.2em] text-muted-foreground/40 uppercase">
            Nomor Antrean
          </p>
          <p className="mt-2 text-5xl font-bold tracking-[0.1em] text-primary">
            {data.kode}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">{data.namaLayanan}</p>
          <p className="mt-1 text-base font-medium text-foreground">{data.nama}</p>
        </div>

        <div className={`mt-4 rounded-xl border-2 p-4 text-center ${status.color}`}>
          <p className="text-sm font-medium uppercase tracking-wider">{status.label}</p>
        </div>

        {isWaiting && data.position !== null && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{data.position}</p>
              <p className="text-xs text-muted-foreground">Antrean ke-</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{data.totalWaiting}</p>
              <p className="text-xs text-muted-foreground">Total menunggu</p>
            </div>
          </div>
        )}

        {isCalled && data.loketNama && (
          <div className="mt-4 rounded-xl border-2 border-green-300 bg-green-50 p-4 text-center">
            <p className="text-sm text-green-700">Silakan menuju loket</p>
            <p className="mt-1 text-xl font-bold text-green-700">{data.loketNama}</p>
          </div>
        )}

        {isDone && (
          <div className="mt-4 rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Selesai pada</p>
            <p className="mt-1 font-medium text-foreground">
              {data.finishedAt ? formatTime(data.finishedAt) : '-'}
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Diambil pada {formatTime(data.createdAt)}
          </p>
        </div>
      </main>
    </div>
  )
}

export function TrackPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<TrackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrack = useCallback(async () => {
    if (!token) {
      setError('Token tidak valid')
      setLoading(false)
      return
    }
    const { data: res, error: err } = await server.api.track({ token }).get()
    if (err || !res) {
      setError('Antrean tidak ditemukan')
      setLoading(false)
      return
    }
    setData(res)
    setError(null)
    setLoading(false)
  }, [token])

  useEffect(() => {
    fetchTrack()
  }, [fetchTrack])

  useEffect(() => {
    if (!data || data.status === 'FINISHED' || data.status === 'SKIPPED') return
    const id = setInterval(fetchTrack, 5000)
    return () => clearInterval(id)
  }, [data?.status, fetchTrack])

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background">
        <Spinner className="size-10 text-primary" />
        <p className="text-base text-muted-foreground">Memuat data antrean...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6">
        <AlertCircle className="size-12 text-destructive" />
        <p className="text-center text-lg text-foreground">{error ?? 'Antrean tidak ditemukan'}</p>
        <button
          onClick={() => { setLoading(true); setError(null); fetchTrack() }}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
        >
          <RefreshCw className="size-4" />
          Coba Lagi
        </button>
      </div>
    )
  }

  return <TrackStatus data={data} />
}
