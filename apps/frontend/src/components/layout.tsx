import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/', label: 'Kios Tiket' },
  { to: '/monitor', label: 'Monitor Display' },
]

export function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-full flex-col">
      <header className="bg-background px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">
            Sianter<span className="text-primary">.</span>
          </h1>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Button
                key={item.to}
                asChild
                variant={pathname === item.to ? 'secondary' : 'ghost'}
                size="sm"
              >
                <Link to={item.to}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
        <Separator className="mt-3" />
      </header>
      <main className="flex-1 overflow-auto bg-muted/30">
        <Outlet />
      </main>
    </div>
  )
}
