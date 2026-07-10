import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { signIn } from '@/lib/auth'
import { Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

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
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <Ticket className="size-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold">Sianter</h1>
                  <p className="text-balance text-muted-foreground">
                    Masuk untuk mengelola sistem antrean
                  </p>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@sianter.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Memproses...' : 'Masuk'}
                </Button>
                <FieldDescription className="text-center">
                  <Link to="/" className="underline-offset-2 hover:underline">
                    Kios Tiket
                  </Link>
                  <span className="mx-1 text-muted-foreground">·</span>
                  <Link to="/monitor" className="underline-offset-2 hover:underline">
                    Monitor
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
            <div className="relative hidden flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 md:flex">
              <div className="text-center">
                <Ticket className="mx-auto size-16 text-primary/60" />
                <h2 className="mt-4 text-2xl font-bold text-foreground/80">
                  Sianter
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sistem Informasi Antrean Instansi Pemerintah
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}