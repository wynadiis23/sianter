import { ClipboardList } from 'lucide-react'
import { DashboardLayout } from './dashboard-layout'

const navItems = [
  { to: '/petugas/dashboard', label: 'Dashboard', icon: ClipboardList },
]

export function PetugasLayout() {
  return <DashboardLayout navItems={navItems} />
}
