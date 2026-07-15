import { ClipboardList } from 'lucide-react'
import { DashboardLayout } from './dashboard-layout'

const navItems = [
  { title: 'Loket', url: '/petugas/loket', icon: ClipboardList },
]

export function PetugasLayout() {
  return <DashboardLayout navItems={navItems} />
}