import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AdminLayout } from './components/admin-layout'
import { ProtectedRoute } from './components/protected-route'
import { KiosPage } from './routes/kios'
import { MonitorPage } from './routes/monitor'
import { LoginPage } from './routes/login'
import { LayananAdminPage } from './routes/admin/layanan'
import { LoketAdminPage } from './routes/admin/loket'
import { UsersAdminPage } from './routes/admin/users'
import { SettingsAdminPage } from './routes/admin/settings'
import { PetugasLayout } from './components/petugas-layout'
import { PilihLoketPage } from './routes/petugas/pilih-loket'
import { PetugasDashboardPage } from './routes/petugas/dashboard'

const router = createBrowserRouter([
  { path: '/', element: <KiosPage /> },
  { path: '/monitor', element: <MonitorPage /> },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/petugas',
    element: (
      <ProtectedRoute role="PETUGAS_LOKET">
        <PetugasLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PilihLoketPage /> },
      { path: 'dashboard', element: <PetugasDashboardPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute role="SUPER_ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin', element: <Navigate to="/admin/layanan" replace /> },
      { path: '/admin/layanan', element: <LayananAdminPage /> },
      { path: '/admin/loket', element: <LoketAdminPage /> },
      { path: '/admin/users', element: <UsersAdminPage /> },
      { path: '/admin/settings', element: <SettingsAdminPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
