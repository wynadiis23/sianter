import { LayoutGrid, Building2, Users, Settings, Clock, CalendarDays } from 'lucide-react'
import { DashboardLayout } from './dashboard-layout'

const navItems = [
  { title: 'Layanan', url: '/admin/layanan', icon: LayoutGrid },
  { title: 'Loket', url: '/admin/loket', icon: Building2 },
  { title: 'Sesi', url: '/admin/sesi', icon: Clock },
  { title: 'Kegiatan', url: '/admin/kegiatan', icon: CalendarDays },
  { title: 'Pengguna', url: '/admin/users', icon: Users },
  { title: 'Pengaturan', url: '/admin/settings', icon: Settings },
]

export function AdminLayout() {
  return <DashboardLayout navItems={navItems} />
}