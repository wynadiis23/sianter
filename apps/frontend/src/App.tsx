import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/layout'
import { KiosPage } from './routes/kios'
import { MonitorPage } from './routes/monitor'
import { DashboardPage } from './routes/dashboard'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <KiosPage /> },
      { path: '/monitor', element: <MonitorPage /> },
      { path: '/dashboard', element: <DashboardPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
