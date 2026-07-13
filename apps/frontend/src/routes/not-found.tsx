import { Link } from 'react-router-dom'
import { SearchX, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <SearchX className="size-8 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-4xl font-bold tabular-nums tracking-tight">404</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Halaman yang Anda cari tidak ditemukan
            </p>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button asChild variant="outline" size="lg" className="w-full justify-start gap-3">
              <Link to="/">
                <Home className="size-5" />
                Beranda
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full justify-start gap-3">
              <Link to="/login">
                <ArrowLeft className="size-5" />
                Masuk
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}