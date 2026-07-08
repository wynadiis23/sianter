export function MonitorPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 gap-4 p-4">
        <section className="flex-1 rounded-2xl bg-slate-900 p-6 text-white">
          <h2 className="text-2xl font-bold">Nomor Antrean Aktif</h2>
          <p className="mt-2 text-slate-400">Per loket</p>
        </section>
        <section className="flex-1 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-center text-slate-400 flex items-center justify-center">
          Media / Video YouTube
        </section>
      </div>
      <footer className="h-16 bg-indigo-600 px-4 py-2 text-white flex items-center">
        <p className="text-sm">Running Text: pengumuman akan tampil di sini</p>
      </footer>
    </div>
  )
}
