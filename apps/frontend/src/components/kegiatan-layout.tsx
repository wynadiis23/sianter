import { Calendar } from 'lucide-react'
import { DashboardLayout } from './dashboard-layout'

const navItems = [
  { title: 'Kegiatan', url: '/petugas/kegiatan', icon: Calendar },
]

export function KegiatanLayout() {
  return <DashboardLayout navItems={navItems} />
}
