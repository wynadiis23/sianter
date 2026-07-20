import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User } from 'lucide-react'

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

interface OnlineReservationsCardProps {
  items: OnlineReservation[]
  onDetail: (data: { nama: string; noHp: string } | null) => void
}

export function OnlineReservationsCard({ items, onDetail }: OnlineReservationsCardProps) {
  if (items.length === 0) return null

  return (
    <Card className="mt-6 border-amber-200 bg-amber-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="size-4 text-amber-600" />
          Antrean Online ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  {item.namaPemohon ?? '-'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.namaLayanan}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.namaSesi} ({item.jamMulai.slice(0, 5)}–{item.jamSelesai.slice(0, 5)})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Online
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() =>
                    onDetail(
                      item.namaPemohon || item.noHpPemohon
                        ? {
                            nama: item.namaPemohon ?? '-',
                            noHp: item.noHpPemohon ?? '-',
                          }
                        : null,
                    )
                  }
                  disabled={!item.namaPemohon && !item.noHpPemohon}
                  title="Detail Pemohon"
                >
                  <User className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
