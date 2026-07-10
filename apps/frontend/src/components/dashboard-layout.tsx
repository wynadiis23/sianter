import { Outlet, useLocation } from 'react-router-dom'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: { title: string; url: string }[]
}

interface DashboardLayoutProps {
  navItems: NavItem[]
}

const routeLabels: Record<string, string> = {
  '/admin/layanan': 'Layanan',
  '/admin/loket': 'Loket',
  '/admin/users': 'Pengguna',
  '/admin/settings': 'Pengaturan',
  '/petugas/dashboard': 'Dashboard',
}

export function DashboardLayout({ navItems }: DashboardLayoutProps) {
  const { pathname } = useLocation()

  const currentLabel = routeLabels[pathname] ?? 'Dashboard'

  return (
    <SidebarProvider>
      <AppSidebar navItems={navItems} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}