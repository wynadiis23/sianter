import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Ticket } from 'lucide-react'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState)?.from?.pathname ?? '/admin/layanan'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signInError } = await signIn.email({ email, password })

    setLoading(false)

    if (signInError) {
      setError(signInError.message ?? 'Gagal masuk')
      return
    }

    const isFromLogin = from === '/admin/layanan'
    if (isFromLogin) {
      const role = data?.user?.role
      if (role === 'SUPER_ADMIN') {
        navigate('/admin/layanan', { replace: true })
      } else {
        navigate('/petugas', { replace: true })
      }
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Ticket className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Sianter</CardTitle>
          <CardDescription>Masuk untuk mengelola sistem antrean</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sianter.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
            <div className="flex gap-3 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Kios Tiket
              </Link>
              <span>·</span>
              <Link to="/monitor" className="hover:text-foreground">
                Monitor
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
