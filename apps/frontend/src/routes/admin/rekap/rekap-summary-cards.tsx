import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SummaryCardsProps {
  summary: Record<string, number>
}

const CARDS = [
  { label: 'Total', key: 'total', color: 'bg-primary/10 text-primary' },
  { label: 'Menunggu', key: 'waiting', color: 'bg-blue-500/10 text-blue-600' },
  { label: 'Dipanggil', key: 'called', color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Selesai', key: 'finished', color: 'bg-emerald-500/10 text-emerald-600' },
  { label: 'Dilewati', key: 'skipped', color: 'bg-orange-500/10 text-orange-600' },
  { label: 'Kedaluwarsa', key: 'expired', color: 'bg-red-500/10 text-red-600' },
  { label: 'Dipesan', key: 'reserved', color: 'bg-purple-500/10 text-purple-600' },
]

export function RekapSummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
      {CARDS.map((card) => (
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
  )
}