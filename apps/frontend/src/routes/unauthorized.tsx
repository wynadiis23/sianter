import { Link } from 'react-router-dom'
import { ShieldX, ArrowLeft, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from '@/lib/auth'

export function UnauthorizedPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  const fallbackUrl = role === 'SUPER_ADMIN' ? '/admin/layanan' : '/petugas'
  const fallbackLabel = role === 'SUPER_ADMIN' ? 'Admin Panel' : 'Dashboard Petugas'

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
            <ShieldX className="size-8 text-destructive" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Akses Ditolak</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini
            </p>
          </div>

          <div className="flex w-full flex-col gap-2">
            {session ? (
              <Button asChild variant="outline" size="lg" className="w-full justify-start gap-3">
                <Link to={fallbackUrl}>
                  <ArrowLeft className="size-5" />
                  {fallbackLabel}
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full justify-start gap-3">
                <Link to="/login">
                  <LogIn className="size-5" />
                  Masuk
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="lg" className="w-full justify-start gap-3">
              <Link to="/">
                <ArrowLeft className="size-5" />
                Beranda
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}