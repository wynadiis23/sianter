import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { server } from '@/lib/eden'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function KiosPage() {
  const [health, setHealth] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    server.health
      .get()
      .then(({ data }) => {
        if (data) setHealth(data.status)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Kios Tiket Mandiri
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pilih layanan untuk mengambil antrean
        </p>
        {loading ? (
          <Skeleton className="mx-auto mt-2 h-4 w-24" />
        ) : (
          <Badge variant={health ? 'default' : 'destructive'} className="mt-2">
            Backend: {health ?? 'offline'}
          </Badge>
        )}
      </div>
      <div className="grid w-full max-w-3xl grid-cols-2 gap-6 lg:grid-cols-3">
        <Card className="border-dashed">
          <CardContent className="flex aspect-square flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <p className="text-sm">Layanan akan muncul di sini</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/layanan">Kelola Layanan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
