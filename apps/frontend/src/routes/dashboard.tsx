import { useEffect, useState } from 'react'
import { api } from '../lib/eden'

export function DashboardPage() {
  const [me, setMe] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    api.me.get().then(({ data }) => {
      if (data) setMe({ email: data.email, role: data.role })
    })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard Petugas</h1>
      <p className="mt-2 text-slate-600">Kontrol antrean per loket</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">
          Sesi: {me ? `${me.email} (${me.role})` : 'Belum login'}
        </p>
      </div>
    </div>
  )
}
