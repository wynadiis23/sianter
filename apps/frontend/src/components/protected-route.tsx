import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '@/lib/auth'
import { Spinner } from '@/components/ui/spinner'

type Role = 'SUPER_ADMIN' | 'PETUGAS_LOKET' | 'PETUGAS_KEGIATAN'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role | Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
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

  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    if (!roles.includes(session.user.role as Role) && session.user.role !== 'SUPER_ADMIN') {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}
