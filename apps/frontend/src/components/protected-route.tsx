import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '@/lib/auth'
import { Spinner } from '@/components/ui/spinner'

type Role = 'SUPER_ADMIN' | 'PETUGAS_LOKET'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: Role
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && session.user.role !== role && session.user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
