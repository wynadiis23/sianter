import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Phone,
  PhoneCall,
  SkipForward,
  CheckCircle2,
  Users,
} from 'lucide-react'

interface PetugasSession {
  loketId: string
  nomorLoket: number
}

interface ActiveTicket {
  id: string
  kode: string
  nomorUrut: number
  status: string
  namaLayanan: string
}

interface WaitingItem {
  id: string
  kode: string
  nomorUrut: number
  layananId: string
  namaLayanan: string
  createdAt: Date
}

interface DashboardData {
  mode: string
  aktif: ActiveTicket | null
  daftarWaiting: WaitingItem[]
  countPerLayanan: Record<string, number>
}

interface LayananInfo {
  id: string
  nama: string
  prefix: string
}

export function PetugasDashboardPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<PetugasSession | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [layananInfo, setLayananInfo] = useState<LayananInfo[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    const raw = localStorage.getItem('petugasSession')
    if (!raw) {
      navigate('/petugas', { replace: true })
      return
    }
    const s = JSON.parse(raw) as PetugasSession
    setSession(s)
    setLayananInfo((s as any).layanan ?? [])
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
        daftarWaiting: result.daftarWaiting.map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
        })),
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDashboard()
    intervalRef.current = setInterval(fetchDashboard, 5000)
    return () => clearInterval(intervalRef.current)
  }, [fetchDashboard])

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
        (error as any)?.value?.message ?? 'Gagal memanggil antrean'
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

  const handleGantiLoket = () => {
    localStorage.removeItem('petugasSession')
    navigate('/petugas', { replace: true })
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
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PhoneCall className="size-4 text-primary" />
                  Antrean Aktif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-center">
                  <p className="text-4xl font-bold text-primary">
                    {data.aktif.kode}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.aktif.namaLayanan}
                  </p>
                  <Badge
                    className="mt-2"
                    variant={
                      data.aktif.status === 'RECALLED'
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {data.aktif.status === 'RECALLED'
                      ? 'Dipanggil Ulang'
                      : 'Dipanggil'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleRecall(data.aktif!.id)}
                    disabled={actionLoading === `recall-${data.aktif.id}`}
                  >
                    <Phone className="size-4" />
                    Recall
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleSkip(data.aktif!.id)}
                    disabled={actionLoading === `skip-${data.aktif.id}`}
                  >
                    <SkipForward className="size-4" />
                    Skip
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleFinish(data.aktif!.id)}
                    disabled={actionLoading === `finish-${data.aktif.id}`}
                  >
                    <CheckCircle2 className="size-4" />
                    Selesai
                  </Button>
                </div>
              </CardContent>
            </Card>
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

          {isFifo ? (
            <Button
              size="lg"
              className="w-full py-8 text-lg"
              onClick={() => handleCall()}
              disabled={actionLoading === 'call' || waitingCount === 0}
            >
              {actionLoading === 'call' ? (
                <Spinner className="mr-2 size-5" />
              ) : (
                <PhoneCall className="mr-2 size-5" />
              )}
              PANGGIL ANTREAN BERIKUTNYA
            </Button>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Panggil Per Layanan
              </h3>
              {layananInfo.map((layanan) => {
                const count = data?.countPerLayanan[layanan.id] ?? 0
                return (
                  <Button
                    key={layanan.id}
                    variant="outline"
                    size="lg"
                    className="w-full justify-between"
                    onClick={() => handleCall(layanan.id)}
                    disabled={
                      actionLoading === `call-${layanan.id}` || count === 0
                    }
                  >
                    <span className="flex items-center gap-2">
                      <PhoneCall className="size-4" />
                      {layanan.nama} ({layanan.prefix})
                    </span>
                    <Badge>{count}</Badge>
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-muted-foreground" />
                Daftar Antrean ({waitingCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.daftarWaiting.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Tidak ada antrean yang menunggu
                </p>
              ) : (
                <div className="divide-y">
                  {data?.daftarWaiting.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="font-mono font-bold">{item.kode}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.namaLayanan}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
