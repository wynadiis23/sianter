import { LayoutGrid, Building2, Users, Settings } from 'lucide-react'
import { DashboardLayout } from './dashboard-layout'

const navItems = [
  { to: '/admin/layanan', label: 'Layanan', icon: LayoutGrid },
  { to: '/admin/loket', label: 'Loket', icon: Building2 },
  { to: '/admin/users', label: 'Pengguna', icon: Users },
  { to: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

export function AdminLayout() {
  return <DashboardLayout navItems={navItems} />
}
