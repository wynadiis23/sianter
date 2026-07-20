import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AccessibilityPanel } from '@/components/accessibility-panel'
import { AdminLayout } from './components/admin-layout'
import { ProtectedRoute } from './components/protected-route'
import { ErrorBoundary } from './components/error-boundary'
import { HomePage } from './routes/home'
import { KiosPage } from './routes/kios'
import { OnlineAntreanPage } from './routes/antrean-online'
import { TrackPage } from './routes/track'
import { MonitorPage } from './routes/monitor'
import { LoginPage } from './routes/login'
import { NotFoundPage } from './routes/not-found'
import { UnauthorizedPage } from './routes/unauthorized'
import { LayananAdminPage } from './routes/admin/layanan'
import { LoketAdminPage } from './routes/admin/loket'
import { SesiAdminPage } from './routes/admin/sesi'
import { UsersAdminPage } from './routes/admin/users'
import { SettingsAdminPage } from './routes/admin/settings'
import { KegiatanAdminPage } from './routes/admin/kegiatan'
import { RekapAdminPage } from './routes/admin/rekap'
import { PetugasLayout } from './components/petugas-layout'
import { KegiatanLayout } from './components/kegiatan-layout'
import { PetugasLoketPage } from './routes/petugas/loket'
import { PilihLoketPage } from './routes/petugas/pilih-loket'
import { KegiatanPetugasPage } from './routes/petugas/kegiatan'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/kios', element: <KiosPage /> },
  { path: '/antrean-online', element: <OnlineAntreanPage /> },
  { path: '/track/:token', element: <TrackPage /> },
  { path: '/monitor', element: <MonitorPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '/petugas', element: <Navigate to="/petugas/loket" replace /> },
  {
    path: '/petugas/loket',
    element: (
      <ProtectedRoute role="PETUGAS_LOKET">
        <PetugasLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <PetugasLoketPage /> },
      { path: 'select', element: <PilihLoketPage /> },
    ],
  },
  {
    path: '/petugas/kegiatan',
    element: (
      <ProtectedRoute role="PETUGAS_KEGIATAN">
        <KegiatanLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <KegiatanPetugasPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute role="SUPER_ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/admin', element: <Navigate to="/admin/layanan" replace /> },
      { path: '/admin/layanan', element: <LayananAdminPage /> },
      { path: '/admin/loket', element: <LoketAdminPage /> },
      { path: '/admin/sesi', element: <SesiAdminPage /> },
      { path: '/admin/kegiatan', element: <KegiatanAdminPage /> },
      { path: '/admin/users', element: <UsersAdminPage /> },
      { path: '/admin/settings', element: <SettingsAdminPage /> },
      { path: '/admin/rekap', element: <RekapAdminPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <AccessibilityPanel />
    </>
  )
}
