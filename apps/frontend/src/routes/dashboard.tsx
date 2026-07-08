import { useEffect, useState } from 'react'
import { server } from '@/lib/eden'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardPage() {
  const [me, setMe] = useState<{ email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    server.me
      .get()
      .then(({ data }) => {
        if (data) setMe({ email: data.email, role: data.role ?? 'unknown' })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard Petugas</h1>
      <p className="mt-2 text-muted-foreground">Kontrol antrean per loket</p>
      <Card className="mt-6">
        <CardContent className="p-4">
          {loading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sesi: {me ? `${me.email} (${me.role})` : 'Belum login'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
