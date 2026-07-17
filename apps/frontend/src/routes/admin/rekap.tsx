import { useEffect, useState, useCallback } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Download } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { AdminPageHeader } from '@/components/admin-page-header'
import { RekapFilters } from '@/routes/admin/rekap/rekap-filters'
import { RekapSummaryCards } from '@/routes/admin/rekap/rekap-summary-cards'
import { RekapPerLayananTable } from '@/routes/admin/rekap/rekap-per-layanan-table'
import { RekapDetailTable } from '@/routes/admin/rekap/rekap-detail-table'
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
  sumber: string
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
  const [sumber, setSumber] = useState('')

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
    if (sumber) q.sumber = sumber
    return q
  }, [mode, tanggal, bulan, tahun, layananId, loketId, status, sumber, page])

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
      'No HP', 'Sumber', 'Status', 'Tanggal Kunjungan',
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
        item.sumber === 'ONLINE' ? 'Online' : 'Kios',
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

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Rekap Antrean"
        description="Lihat dan export data antrean berdasarkan periode"
        extraActions={
          <Button onClick={exportCSV} variant="outline" disabled={loading || items.length === 0}>
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <RekapFilters
        mode={mode}
        onModeChange={setMode}
        tanggal={tanggal}
        onTanggalChange={setTanggal}
        bulan={bulan}
        onBulanChange={setBulan}
        tahun={tahun}
        onTahunChange={setTahun}
        layananId={layananId}
        onLayananIdChange={setLayananId}
        layananList={layananList}
        loketId={loketId}
        onLoketIdChange={setLoketId}
        loketList={loketList}
        status={status}
        onStatusChange={setStatus}
        sumber={sumber}
        onSumberChange={setSumber}
        onSearch={handleSearch}
      />

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
          {summary && <RekapSummaryCards summary={summary} />}

          {perLayanan.length > 0 && <RekapPerLayananTable items={perLayanan} />}

          <RekapDetailTable
            items={items}
            pagination={pagination}
            page={page}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}