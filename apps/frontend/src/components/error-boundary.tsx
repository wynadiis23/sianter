import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ErrorBoundary() {
  const error = useRouteError()

  let title = 'Terjadi Kesalahan'
  let message = 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'

  if (isRouteErrorResponse(error)) {
    title = `Error ${error.status}`
    message = error.statusText || error.data?.message || message
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              size="lg"
              className="w-full justify-start gap-3"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="size-5" />
              Muat Ulang
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full justify-start gap-3">
              <Link to="/">
                <Home className="size-5" />
                Beranda
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}