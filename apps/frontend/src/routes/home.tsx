import { Link } from 'react-router-dom'
import { Ticket, Monitor, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-sm overflow-hidden border-0 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Ticket className="size-8 text-primary" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Sianter</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sistem Informasi Antrean Instansi Pemerintah
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5">
            <Button asChild variant="secondary" size="lg" className="w-full justify-start gap-3">
              <Link to="/kios">
                <Ticket className="size-5" />
                Kios Tiket
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full justify-start gap-3">
              <Link to="/monitor">
                <Monitor className="size-5" />
                Monitor Display
              </Link>
            </Button>
            <Button asChild size="lg" className="w-full justify-start gap-3">
              <Link to="/login">
                <LogIn className="size-5" />
                Masuk
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}