import { Outlet, Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Kios Tiket' },
  { to: '/monitor', label: 'Monitor Display' },
  { to: '/dashboard', label: 'Dashboard Petugas' },
]

export function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">
            Sianter<span className="text-indigo-600">.</span>
          </h1>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === item.to
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  )
}
