import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

interface PerLayananTableProps {
  items: PerLayanan[]
}

export function RekapPerLayananTable({ items }: PerLayananTableProps) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-foreground">Per Layanan</h2>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Layanan</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Dipesan</TableHead>
              <TableHead className="text-right">Menunggu</TableHead>
              <TableHead className="text-right">Dipanggil</TableHead>
              <TableHead className="text-right">Selesai</TableHead>
              <TableHead className="text-right">Dilewati</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((pl) => (
              <TableRow key={pl.layananId}>
                <TableCell className="font-medium">
                  <Badge variant="outline" className="mr-2">
                    {pl.prefix}
                  </Badge>
                  {pl.nama}
                </TableCell>
                <TableCell className="text-right font-medium">{pl.total}</TableCell>
                <TableCell className="text-right text-red-600">{pl.reserved}</TableCell>
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
  )
}