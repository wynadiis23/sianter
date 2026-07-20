import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, PhoneCall, SkipForward, CheckCircle2, User } from 'lucide-react'

interface ActiveTicket {
  id: string
  kode: string | null
  namaLayanan: string
  status: string
  sumber: string
  namaPemohon: string | null
  noHpPemohon: string | null
}

interface ActiveTicketCardProps {
  ticket: ActiveTicket
  actionLoading: string | null
  onRecall: (id: string) => void
  onSkip: (id: string) => void
  onFinish: (id: string) => void
  onDetail: (data: { nama: string; noHp: string } | null) => void
}

export function ActiveTicketCard({
  ticket,
  actionLoading,
  onRecall,
  onSkip,
  onFinish,
  onDetail,
}: ActiveTicketCardProps) {
  return (
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
            {ticket.kode ?? '-'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {ticket.namaLayanan}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            {ticket.sumber === 'ONLINE' && (
              <Badge variant="secondary" className="text-xs">
                Online
              </Badge>
            )}
          </div>
          <Badge
            variant={
              ticket.status === 'RECALLED'
                ? 'destructive'
                : 'default'
            }
          >
            {ticket.status === 'RECALLED'
              ? 'Dipanggil Ulang'
              : 'Dipanggil'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onRecall(ticket.id)}
            disabled={actionLoading === `recall-${ticket.id}`}
          >
            <Phone className="size-4" />
            Recall
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onSkip(ticket.id)}
            disabled={actionLoading === `skip-${ticket.id}`}
          >
            <SkipForward className="size-4" />
            Skip
          </Button>
          <Button
            className="flex-1"
            onClick={() => onFinish(ticket.id)}
            disabled={actionLoading === `finish-${ticket.id}`}
          >
            <CheckCircle2 className="size-4" />
            Selesai
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() =>
              onDetail(
                ticket.namaPemohon || ticket.noHpPemohon
                  ? { nama: ticket.namaPemohon ?? '-', noHp: ticket.noHpPemohon ?? '-' }
                  : null,
              )
            }
            disabled={!ticket.namaPemohon && !ticket.noHpPemohon}
            title="Detail Pemohon"
          >
            <User className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}