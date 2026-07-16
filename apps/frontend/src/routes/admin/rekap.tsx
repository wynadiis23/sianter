import { useEffect, useState, useCallback } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { Search, Download, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { wita } from '@/lib/dayjs'

type Mode = 'tanggal' | 'bulan' | 'tahun'

interface LayananOption {
  id: string
  nama: string
  prefix: string
}

interface LoketOption {
  id: string
  nomor: number
  nama: string | null
}

interface RekapItem {
  id: string
  kode: string | null
  nomorUrut: number | null
  status: string
  namaLayanan: string
  prefixLayanan: string
  nomorLoket: number | null
  namaLoket: string | null
  namaPemohon: string | null
  noHpPemohon: string | null
  tanggalKunjungan: string | null
  createdAt: string
  calledAt: string | null
  finishedAt: string | null
  skippedAt: string | null
  checkedInAt: string | null
  expiredAt: string | null
}

interface PerLayanan {
  layananId: string
  nama: string
  prefix: string
  total: number
  waiting: number
  called: number
  recalled: number
  finished: number
  skipped: number
  expired: number
  reserved: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

type Summary = Record<string, number>

const STATUS_LABEL: Record<string, string> = {
  reserved: 'Dipesan',
  waiting: 'Menunggu',
  called: 'Dipanggil',
  recalled: 'Dipanggil Ulang',
  skipped: 'Dilewati',
  finished: 'Selesai',
  expired: 'Kedaluwarsa',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  reserved: 'secondary',
  waiting: 'default',
  called: 'outline',
  recalled: 'outline',
  skipped: 'secondary',
  finished: 'default',
  expired: 'destructive',
}

function formatDate(iso: string) {
  return wita(iso).format('DD/MM/YYYY HH:mm')
}

function formatDateShort(iso: string) {
  return wita(iso).format('DD/MM/YYYY')
}

export function RekapAdminPage() {
  const [mode, setMode] = useState<Mode>('tanggal')
  const [tanggal, setTanggal] = useState(wita().format('YYYY-MM-DD'))
  const [bulan, setBulan] = useState(wita().format('YYYY-MM'))
  const [tahun, setTahun] = useState(wita().format('YYYY'))
  const [layananId, setLayananId] = useState('')
  const [loketId, setLoketId] = useState('')
  const [status, setStatus] = useState('')

  const [layananList, setLayananList] = useState<LayananOption[]>([])
  const [loketList, setLoketList] = useState<LoketOption[]>([])

  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [perLayanan, setPerLayanan] = useState<PerLayanan[]>([])
  const [items, setItems] = useState<RekapItem[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)

  const fetchFilterData = useCallback(async () => {
    const [layananRes, loketRes] = await Promise.all([
      server.api.admin.layanan.get(),
      server.api.admin.loket.get(),
    ])
    if (layananRes.data) setLayananList(layananRes.data as LayananOption[])
    if (loketRes.data) setLoketList(loketRes.data as LoketOption[])
  }, [])

  useEffect(() => {
    fetchFilterData()
  }, [fetchFilterData])

  const buildQuery = useCallback(() => {
    const q: Record<string, string | number> = { page, limit: 20 }
    if (mode === 'tanggal') q.tanggal = tanggal
    else if (mode === 'bulan') q.bulan = bulan
    else if (mode === 'tahun') q.tahun = tahun
    if (layananId) q.layananId = layananId
    if (loketId) q.loketId = loketId
    if (status) q.status = status
    return q
  }, [mode, tanggal, bulan, tahun, layananId, loketId, status, page])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const query = buildQuery()
    const { data, error } = await server.api.admin.rekap.get({ query })
    if (error) {
      toast.error('Gagal memuat data rekap')
    } else if (data) {
      setSummary(data.summary)
      setPerLayanan(data.perLayanan)
      setItems(data.items)
      setPagination(data.pagination)
    }
    setLoading(false)
  }, [buildQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = () => {
    setPage(1)
  }

  useEffect(() => {
    handleSearch()
  }, [page])

  const exportCSV = () => {
    if (items.length === 0) {
      toast.error('Tidak ada data untuk diexport')
      return
    }

    const header = [
      'Kode', 'Nomor Urut', 'Layanan', 'Loket', 'Pemohon',
      'No HP', 'Status', 'Tanggal Kunjungan',
      'Dibuat', 'Dipanggil', 'Selesai', 'Dilewati',
    ].join(',')

    const rows = items.map((item) => {
      const escape = (v: string | null | undefined) => {
        if (!v) return ''
        const s = String(v).replace(/"/g, '""')
        return `"${s}"`
      }
      return [
        escape(item.kode),
        item.nomorUrut ?? '',
        escape(item.namaLayanan),
        item.nomorLoket ? `Loket ${item.nomorLoket}` : '',
        escape(item.namaPemohon),
        escape(item.noHpPemohon),
        STATUS_LABEL[item.status] ?? item.status,
        item.tanggalKunjungan ?? '',
        formatDateShort(item.createdAt),
        item.calledAt ? formatDateShort(item.calledAt) : '',
        item.finishedAt ? formatDateShort(item.finishedAt) : '',
        item.skippedAt ? formatDateShort(item.skippedAt) : '',
      ].join(',')
    }).join('\n')

    const bom = '\uFEFF'
    const csv = bom + header + '\n' + rows
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rekap-antrean-${wita().format('YYYY-MM-DD_HHmm')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data berhasil diexport')
  }

  const summaryCards = summary
    ? [
        { label: 'Total', key: 'total', color: 'bg-primary/10 text-primary' },
        { label: 'Menunggu', key: 'waiting', color: 'bg-blue-500/10 text-blue-600' },
        { label: 'Dipanggil', key: 'called', color: 'bg-amber-500/10 text-amber-600' },
        { label: 'Selesai', key: 'finished', color: 'bg-emerald-500/10 text-emerald-600' },
        { label: 'Dilewati', key: 'skipped', color: 'bg-orange-500/10 text-orange-600' },
        { label: 'Kedaluwarsa', key: 'expired', color: 'bg-red-500/10 text-red-600' },
        { label: 'Dipesan', key: 'reserved', color: 'bg-purple-500/10 text-purple-600' },
      ]
    : []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rekap Antrean</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lihat dan export data antrean berdasarkan periode
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" disabled={loading || items.length === 0}>
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <div className="mt-6 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v: Mode) => setMode(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tanggal">Tanggal</SelectItem>
                <SelectItem value="bulan">Bulan</SelectItem>
                <SelectItem value="tahun">Tahun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              {mode === 'tanggal' ? 'Tanggal' : mode === 'bulan' ? 'Bulan' : 'Tahun'}
            </Label>
            {mode === 'tanggal' && (
              <Input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-44"
              />
            )}
            {mode === 'bulan' && (
              <Input
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-44"
              />
            )}
            {mode === 'tahun' && (
              <Input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="w-32"
                min={2020}
                max={2099}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Layanan</Label>
            <Select value={layananId} onValueChange={setLayananId}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Semua layanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua layanan</SelectItem>
                {layananList.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.nama} ({l.prefix})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Loket</Label>
            <Select value={loketId} onValueChange={setLoketId}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Semua loket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua loket</SelectItem>
                {loketList.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    Loket {l.nomor}{l.nama ? ` - ${l.nama}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua status</SelectItem>
                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                  <SelectItem key={key} value={key.toUpperCase()}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSearch}>
            <Search className="size-4" />
            Cari
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : (
        <>
          {summary && (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
              {summaryCards.map((card) => (
                <Card key={card.key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {summary[card.key] ?? 0}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {perLayanan.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Per Layanan</h2>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Layanan</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Menunggu</TableHead>
                      <TableHead className="text-right">Dipanggil</TableHead>
                      <TableHead className="text-right">Selesai</TableHead>
                      <TableHead className="text-right">Dilewati</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perLayanan.map((pl) => (
                      <TableRow key={pl.layananId}>
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="mr-2">
                            {pl.prefix}
                          </Badge>
                          {pl.nama}
                        </TableCell>
                        <TableCell className="text-right font-medium">{pl.total}</TableCell>
                        <TableCell className="text-right text-blue-600">{pl.waiting}</TableCell>
                        <TableCell className="text-right text-amber-600">{pl.called + pl.recalled}</TableCell>
                        <TableCell className="text-right text-emerald-600">{pl.finished}</TableCell>
                        <TableCell className="text-right text-orange-600">{pl.skipped}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Detail Antrean</h2>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Kode</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Loket</TableHead>
                    <TableHead className="hidden md:table-cell">Pemohon</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                        <Calendar className="mx-auto mb-2 size-8 opacity-50" />
                        Tidak ada data antrean untuk filter ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono font-medium">
                          {item.kode ?? `#${item.nomorUrut}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="mr-1">
                            {item.prefixLayanan}
                          </Badge>
                          {item.namaLayanan}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.nomorLoket ? `Loket ${item.nomorLoket}` : '—'}
                        </TableCell>
                        <TableCell className="hidden max-w-[160px] truncate md:table-cell">
                          {item.namaPemohon || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANTS[item.status] ?? 'outline'}>
                            {STATUS_LABEL[item.status] ?? item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                          {formatDate(item.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
                  {pagination.total} data
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
