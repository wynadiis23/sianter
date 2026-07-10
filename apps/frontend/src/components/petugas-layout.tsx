import { ClipboardList } from 'lucide-react'
import { DashboardLayout } from './dashboard-layout'

const navItems = [
  { title: 'Dashboard', url: '/petugas/dashboard', icon: ClipboardList },
]

export function PetugasLayout() {
  return <DashboardLayout navItems={navItems} />
}