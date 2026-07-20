import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { PhoneCall } from 'lucide-react'

interface LayananInfo {
  id: string
  nama: string
  prefix: string
}

interface CallButtonsProps {
  isFifo: boolean
  actionLoading: string | null
  waitingCount: number
  layananInfo: LayananInfo[]
  countPerLayanan: Record<string, number>
  onFifoCall: () => void
  onSelectiveCall: (layananId: string) => void
}

export function CallButtons({
  isFifo,
  actionLoading,
  waitingCount,
  layananInfo,
  countPerLayanan,
  onFifoCall,
  onSelectiveCall,
}: CallButtonsProps) {
  if (isFifo) {
    return (
      <Button
        size="lg"
        className="w-full py-8 text-lg"
        onClick={onFifoCall}
        disabled={actionLoading === 'call' || waitingCount === 0}
      >
        {actionLoading === 'call' ? (
          <Spinner className="mr-2 size-5" />
        ) : (
          <PhoneCall className="mr-2 size-5" />
        )}
        PANGGIL ANTREAN BERIKUTNYA
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Panggil Per Layanan
      </h3>
      {layananInfo.map((layanan) => {
        const count = countPerLayanan[layanan.id] ?? 0
        return (
          <Button
            key={layanan.id}
            variant="outline"
            size="lg"
            className="w-full justify-between"
            onClick={() => onSelectiveCall(layanan.id)}
            disabled={actionLoading === `call-${layanan.id}` || count === 0}
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
  )
}