import { useEffect, useState, useCallback } from 'react'
import { server } from '@/lib/eden'
import { ScrollArea } from '@/components/ui/scroll-area'

type MonitorData = NonNullable<
  Awaited<ReturnType<typeof server.api.monitor.get>>['data']
>

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const match = url.match(p)
    if (match) return match[1]
  }
  return null
}

function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const time = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const date = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return { time, date }
}

export function MonitorPage() {
  const [data, setData] = useState<MonitorData | null>(null)
  const { time, date } = useClock()

  const fetchData = useCallback(async () => {
    try {
      const res = await server.api.monitor.get()
      if (res.data) setData(res.data)
    } catch {
      // silently ignore fetch errors
    }
  }, [])

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 5000)
    return () => clearInterval(timer)
  }, [fetchData])

  const youtubeId = data?.mediaUrl ? extractYouTubeId(data.mediaUrl) : null

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between bg-primary px-8 py-3 text-primary-foreground">
        <span className="text-sm font-mono tabular-nums">{time}</span>
        <h1 className="text-lg font-bold tracking-wide">
          SISTEM ANTREAN
        </h1>
        <span className="text-sm">{date}</span>
      </header>

      <main className="flex flex-1 min-h-0">
        <div className="flex w-[60%] flex-col min-w-0">
          <ScrollArea className="flex-1">
            <div className="grid auto-rows-fr grid-cols-2 gap-4 p-6">
              {data?.layanan.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-col rounded-lg border bg-card shadow-sm"
                  style={
                    l.warna
                      ? { borderTopColor: l.warna, borderTopWidth: 4 }
                      : undefined
                  }
                >
                  <div className="px-5 py-3">
                    <h2 className="text-base font-semibold text-card-foreground">
                      {l.nama}
                    </h2>
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-center px-5 py-6">
                    {l.dipanggil ? (
                      <>
                        <p className="text-5xl font-bold font-mono tabular-nums text-primary">
                          {l.dipanggil.kode}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {l.dipanggil.loketNama
                            ? `Loket ${l.dipanggil.loketNama}`
                            : 'Sedang Dilayani'}
                        </p>
                      </>
                    ) : (
                      <p className="text-5xl font-bold font-mono tabular-nums text-muted-foreground/40">
                        ---
                      </p>
                    )}
                  </div>
                  <div className="border-t px-5 py-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      MENUNGGU
                    </p>
                    {l.menunggu.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {l.menunggu.map((t) => (
                          <span
                            key={t.kode}
                            className="rounded bg-muted px-2 py-0.5 font-mono text-sm tabular-nums text-muted-foreground"
                          >
                            {t.kode}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/50">
                        Tidak ada antrean
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(!data || data.layanan.length === 0) && (
                <div className="col-span-2 flex items-center justify-center py-20">
                  <p className="text-sm text-muted-foreground">
                    Belum ada layanan aktif
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex w-[40%] flex-col border-l bg-muted/20">
          <div className="flex flex-1 items-center justify-center p-6">
            {youtubeId ? (
              <iframe
                className="h-full w-full rounded-lg"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}`}
                title="Media Informasi"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                <svg
                  className="size-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <p className="text-sm">Media tidak tersedia</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="flex shrink-0 items-center overflow-hidden bg-primary px-4 py-3">
        <div className="animate-marquee whitespace-nowrap text-sm font-medium text-primary-foreground">
          {data?.runningText
            ? `${data.runningText} \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 ${data.runningText}`
            : 'Selamat datang di Sistem Antrean'}
        </div>
      </footer>
    </div>
  )
}