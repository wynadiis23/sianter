import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { useLoketSocket, type WsStatus } from '@/lib/ws'
import type { WsEvent } from '@sianter/backend'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Users } from 'lucide-react'
import { ActiveTicketCard } from '@/routes/petugas/loket/active-ticket-card'
import { CallButtons } from '@/routes/petugas/loket/call-buttons'
import { WaitingList } from '@/routes/petugas/loket/waiting-list'
import { SkippedList } from '@/routes/petugas/loket/skipped-list'
import { OnlineReservationsCard } from '@/routes/petugas/loket/online-reservations-card'
import { DetailPemohonDialog } from '@/routes/petugas/loket/detail-pemohon-dialog'
import { useThermalPrinter } from '@/hooks/use-thermal-printer'

interface PetugasSession {
  loketId: string
  nomorLoket: number
  layanan: LayananInfo[]
}

interface ActiveTicket {
  id: string
  kode: string | null
  nomorUrut: number | null
  status: string
  sumber: string
  namaLayanan: string
  namaPemohon: string | null
  noHpPemohon: string | null
}

interface WaitingItem {
  id: string
  kode: string | null
  nomorUrut: number | null
  layananId: string
  sumber: string
  namaLayanan: string
  createdAt: Date
  namaPemohon: string | null
  noHpPemohon: string | null
}

interface SkippedItem {
  id: string
  kode: string | null
  nomorUrut: number | null
  status: string
  sumber: string
  namaLayanan: string
  skippedAt: Date | string | null
  namaPemohon: string | null
  noHpPemohon: string | null
}

interface OnlineReservation {
  id: string
  kode: string | null
  nomorUrut: number | null
  sumber: string
  namaLayanan: string
  namaPemohon: string | null
  noHpPemohon: string | null
  namaSesi: string
  jamMulai: string
  jamSelesai: string
  tanggalKunjungan: string | null
}

interface DashboardData {
  mode: string
  aktif: ActiveTicket | null
  daftarWaiting: WaitingItem[]
  daftarSkipped: SkippedItem[]
  daftarOnline: OnlineReservation[]
  countPerLayanan: Record<string, number>
}

interface LayananInfo {
  id: string
  nama: string
  prefix: string
}

export function PetugasLoketPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<PetugasSession | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [layananInfo, setLayananInfo] = useState<LayananInfo[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detailItem, setDetailItem] = useState<{
    nama: string
    noHp: string
  } | null>(null)

  const { print } = useThermalPrinter()

  useEffect(() => {
    const raw = localStorage.getItem('petugasSession')
    if (!raw) {
      navigate('/petugas/loket/select', { replace: true })
      return
    }
    const s = JSON.parse(raw) as PetugasSession
    setSession(s)
    setLayananInfo(s.layanan)
  }, [navigate])

  const fetchDashboard = useCallback(async () => {
    const raw = localStorage.getItem('petugasSession')
    if (!raw) return
    const s = JSON.parse(raw) as PetugasSession

    const { data: result, error } = await server.api.loket.antrean.get({
      query: {
        loketId: s.loketId,
      },
    })
    if (error) {
      toast.error('Gagal memuat data antrean')
      return
    }
    if (result) {
      setData({
        ...result,
        daftarOnline: result.daftarOnline ?? [],
        daftarWaiting: result.daftarWaiting.map((w) => ({
          ...w,
          createdAt: new Date(w.createdAt),
        })),
        daftarSkipped: (result.daftarSkipped ?? []).map((s) => ({
          ...s,
          skippedAt: s.skippedAt ?? null,
        })),
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleWsEvent = useCallback(
    (event: WsEvent) => {
      if (event.type === 'pengaturan:updated' || event.type === 'layanan:changed' || event.type === 'kegiatan:changed') {
        fetchDashboard()
        return
      }

      const d = event.data
      if (event.type === 'antrean:created') {
        fetchDashboard()
        return
      }

      if (d.loketId && d.loketId !== session?.loketId) {
        fetchDashboard()
      }
    },
    [fetchDashboard, session?.loketId],
  )

  const wsStatus = useLoketSocket(handleWsEvent, fetchDashboard)

  const prevStatus = useRef<WsStatus>(wsStatus)
  useEffect(() => {
    if (prevStatus.current === wsStatus) return
    prevStatus.current = wsStatus
    if (wsStatus === 'connected') toast.success('WebSocket connected')
    if (wsStatus === 'disconnected') toast.error('WebSocket disconnected')
  }, [wsStatus])

  const handleCall = async (layananId?: string) => {
    if (!session) return
    setActionLoading('call')
    const { error } = await server.api.loket.antrean.call.post({
      loketId: session.loketId,
      layananId,
    })
    setActionLoading(null)
    if (error) {
      const errMsg =
        (error)?.value?.message ?? 'Gagal memanggil antrean'
      toast.error(errMsg)
      return
    }
    toast.success('Antrean dipanggil')
    fetchDashboard()
  }

  const handleRecall = async (id: string) => {
    setActionLoading(`recall-${id}`)
    const { error } = await server.api.loket.antrean({ id }).recall.post()
    setActionLoading(null)
    if (error) {
      toast.error('Gagal memanggil ulang')
      return
    }
    toast.success('Antrean dipanggil ulang')
    fetchDashboard()
  }

  const handleSkip = async (id: string) => {
    setActionLoading(`skip-${id}`)
    const { error } = await server.api.loket.antrean({ id }).skip.post()
    setActionLoading(null)
    if (error) {
      toast.error('Gagal melewati antrean')
      return
    }
    toast.success('Antrean dilewati')
    fetchDashboard()
  }

  const handleFinish = async (id: string) => {
    setActionLoading(`finish-${id}`)
    const { error } = await server.api.loket.antrean({ id }).finish.post()
    setActionLoading(null)
    if (error) {
      toast.error('Gagal menyelesaikan antrean')
      return
    }
    toast.success('Antrean selesai')
    fetchDashboard()
  }

  const handleCallSkipped = async (id: string) => {
    setActionLoading(`call-skipped-${id}`)
    const { error } = await server.api.loket.antrean({ id })['call-skipped'].post()
    setActionLoading(null)
    if (error) {
      const errMsg =
        (error)?.value?.message ?? 'Gagal memanggil ulang antrean'
      toast.error(errMsg)
      return
    }
    toast.success('Antrean dipanggil')
    fetchDashboard()
  }

  const handleFinishSkipped = async (id: string) => {
    await handleFinish(id)
  }

  const handleReprint = useCallback(async (id: string) => {
    const ticket = data?.aktif
    if (!ticket || ticket.id !== id) return
    setActionLoading(`reprint-${id}`)
    try {
      await print({
        kode: ticket.kode ?? '-',
        namaLayanan: ticket.namaLayanan,
        timestamp: new Date(),
        trackingUrl: `${window.location.origin}/track/${id}`,
      })
    } catch {
      // toast already handled by the hook
    } finally {
      setActionLoading(null)
    }
  }, [data?.aktif, print])

  const handleReprintWaiting = useCallback(async (item: WaitingItem) => {
    setActionLoading(`reprint-${item.id}`)
    try {
      await print({
        kode: item.kode ?? '-',
        namaLayanan: item.namaLayanan,
        timestamp: item.createdAt,
        trackingUrl: `${window.location.origin}/track/${item.id}`,
      })
    } catch {
      // toast already handled by the hook
    } finally {
      setActionLoading(null)
    }
  }, [print])

  const handleGantiLoket = () => {
    localStorage.removeItem('petugasSession')
    navigate('/petugas/loket/select', { replace: true })
  }

  if (!session) return null

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  const isFifo = data?.mode === 'FIFO_GLOBAL'
  const waitingCount = data?.daftarWaiting.length ?? 0

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full shrink-0 ${wsStatus === 'connected' ? 'bg-green-500' :
                wsStatus === 'disconnected' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}
            />
            <h1 className="text-2xl font-bold text-foreground">
              Loket {session.nomorLoket}
            </h1>
            <Badge variant="outline">
              {isFifo ? 'FIFO Global' : 'Selektif'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Melayani: {layananInfo.map((l) => l.nama).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>
              {waitingCount} menunggu
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleGantiLoket}>
            Ganti Loket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          {data?.aktif ? (
            <ActiveTicketCard
              ticket={data.aktif}
              actionLoading={actionLoading}
              onRecall={handleRecall}
              onSkip={handleSkip}
              onFinish={handleFinish}
              onReprint={handleReprint}
              onDetail={setDetailItem}
            />
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tidak Ada Antrean Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Panggil antrean berikutnya untuk mulai melayani
                </p>
              </CardContent>
            </Card>
          )}

          <CallButtons
            isFifo={isFifo}
            actionLoading={actionLoading}
            waitingCount={waitingCount}
            layananInfo={layananInfo}
            countPerLayanan={data?.countPerLayanan ?? {}}
            onFifoCall={() => handleCall()}
            onSelectiveCall={handleCall}
          />
        </div>

        <div>
          <WaitingList
            items={data?.daftarWaiting ?? []}
            onDetail={setDetailItem}
            onReprint={handleReprintWaiting}
          />

          <OnlineReservationsCard
            items={data?.daftarOnline ?? []}
            onDetail={setDetailItem}
          />

          <SkippedList
            items={data?.daftarSkipped ?? []}
            actionLoading={actionLoading}
            onCallSkipped={handleCallSkipped}
            onFinishSkipped={handleFinishSkipped}
            onDetail={setDetailItem}
          />
        </div>
      </div>

      <DetailPemohonDialog
        open={!!detailItem}
        onOpenChange={(open) => !open && setDetailItem(null)}
        data={detailItem}
      />
    </div>
  )
}