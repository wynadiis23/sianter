import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { SkipForward, PhoneCall, CheckCircle2, User } from 'lucide-react'

interface SkippedItem {
  id: string
  kode: string | null
  namaLayanan: string
  namaPemohon: string | null
  noHpPemohon: string | null
}

interface SkippedListProps {
  items: SkippedItem[]
  actionLoading: string | null
  onCallSkipped: (id: string) => void
  onFinishSkipped: (id: string) => void
  onDetail: (data: { nama: string; noHp: string } | null) => void
}

export function SkippedList({
  items,
  actionLoading,
  onCallSkipped,
  onFinishSkipped,
  onDetail,
}: SkippedListProps) {
  if (items.length === 0) return null

  return (
    <div className="mt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <SkipForward className="size-4 text-destructive" />
            Antrean Dilewati ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Kode</th>
                  <th className="pb-2 font-medium">Layanan</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 font-mono font-bold">
                      {item.kode ?? '-'}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {item.namaLayanan}
                    </td>
                    <td className="py-3">
                      <Badge variant="destructive">Dilewati</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCallSkipped(item.id)}
                          disabled={actionLoading === `call-skipped-${item.id}`}
                        >
                          {actionLoading === `call-skipped-${item.id}` ? (
                            <Spinner className="size-3" />
                          ) : (
                            <PhoneCall className="size-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onFinishSkipped(item.id)}
                          disabled={actionLoading === `finish-${item.id}`}
                        >
                          {actionLoading === `finish-${item.id}` ? (
                            <Spinner className="size-3" />
                          ) : (
                            <CheckCircle2 className="size-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}