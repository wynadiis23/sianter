import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, User } from 'lucide-react'
import { wita } from '@/lib/dayjs'

interface WaitingItem {
  id: string
  kode: string | null
  namaLayanan: string
  createdAt: Date
  namaPemohon: string | null
  noHpPemohon: string | null
}

interface WaitingListProps {
  items: WaitingItem[]
  onDetail: (data: { nama: string; noHp: string } | null) => void
}

export function WaitingList({ items, onDetail }: WaitingListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4 text-muted-foreground" />
          Daftar Antrean ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Tidak ada antrean yang menunggu
          </p>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-mono font-bold">{item.kode ?? '-'}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.namaLayanan}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {wita(item.createdAt).format('HH:mm')}
                  </p>
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
        )}
      </CardContent>
    </Card>
  )
}