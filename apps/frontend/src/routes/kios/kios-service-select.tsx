import { Button } from '@/components/ui/button'
import { ServiceCard } from '@/components/service-card'
import { QrCode } from 'lucide-react'

interface LayananItem {
  id: string
  nama: string
  prefix: string
  warna?: string | null
}

interface KiosServiceSelectProps {
  layananList: LayananItem[]
  onSelectLayanan: (layanan: LayananItem) => void
  onOpenCheckIn: () => void
}

export function KiosServiceSelect({ layananList, onSelectLayanan, onOpenCheckIn }: KiosServiceSelectProps) {
  return (
    <main className="flex flex-1 flex-col overflow-auto px-6 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 text-center">
          <h2 className="kiosk-font-wordmark text-2xl text-foreground">
            Pilih Layanan
          </h2>
          <p className="mt-0.5 font-body text-sm text-muted-foreground/70">
            Ketuk layanan yang Anda butuhkan
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {layananList.map((layanan) => (
            <ServiceCard
              key={layanan.id}
              prefix={layanan.prefix}
              nama={layanan.nama}
              warna={layanan.warna}
              onClick={() => onSelectLayanan(layanan)}
            />
          ))}
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          onClick={onOpenCheckIn}
          variant="outline"
          className="h-14 gap-3 text-base"
        >
          <QrCode className="size-5" />
          Check-In Antrean Online
        </Button>
      </div>
    </main>
  )
}