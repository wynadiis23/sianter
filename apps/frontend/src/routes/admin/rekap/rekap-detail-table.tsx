import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { wita } from '@/lib/dayjs'

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
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

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

interface RekapDetailTableProps {
  items: RekapItem[]
  pagination: Pagination | null
  page: number
  onPageChange: (page: number) => void
}

export function RekapDetailTable({ items, pagination, page, onPageChange }: RekapDetailTableProps) {
  return (
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
              <TableHead className="w-16">Sumber</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
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
                    <Badge variant={item.sumber === 'ONLINE' ? 'default' : 'secondary'}>
                      {item.sumber === 'ONLINE' ? 'Online' : 'Kios'}
                    </Badge>
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
              onClick={() => onPageChange(Math.max(1, page - 1))}
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
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}