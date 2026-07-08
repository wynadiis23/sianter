import { useEffect, useState } from 'react'
import { api } from '../lib/eden'

export function KiosPage() {
  const [health, setHealth] = useState<string>('')

  useEffect(() => {
    api.health.get().then(({ data }) => {
      if (data) setHealth(data.status)
    })
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Kios Tiket Mandiri</h1>
        <p className="mt-2 text-slate-600">Pilih layanan untuk mengambil antrean</p>
        <p className="mt-1 text-xs text-slate-400">Backend: {health || '...'}</p>
      </div>
      <div className="grid w-full max-w-3xl grid-cols-2 gap-6 lg:grid-cols-3">
        <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400 flex items-center justify-center">
          Layanan akan muncul di sini
        </div>
      </div>
    </div>
  )
}
