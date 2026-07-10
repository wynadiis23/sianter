import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSession, signOut } from '@/lib/auth'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  navItems: NavItem[]
}

export function DashboardLayout({ navItems }: DashboardLayoutProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'AD'

  return (
    <div className="flex h-full">
      <aside className="flex w-64 flex-col border-r bg-sidebar">
        <div className="flex items-center gap-2 px-6 py-4">
          <Ticket className="size-6 text-primary" />
          <span className="text-lg font-bold text-sidebar-foreground">
            Sianter<span className="text-primary">.</span>
          </span>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active = pathname === item.to
              return (
                <Button
                  key={item.to}
                  asChild
                  variant={active ? 'secondary' : 'ghost'}
                  className="justify-start"
                >
                  <Link to={item.to}>
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </ScrollArea>
        <Separator />
        <div className="flex items-center gap-3 p-3">
          <Avatar className="size-9">
            <AvatarFallback className={cn('text-xs')}>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {session?.user?.name ?? 'Admin'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Keluar"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-muted/30">
        <Outlet />
      </main>
    </div>
  )
}
