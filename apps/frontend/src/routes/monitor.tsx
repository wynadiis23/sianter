import { useEffect, useState, useCallback, useRef } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMonitorSocket, type WsStatus } from '@/lib/ws'
import { useSpeech } from '@/hooks/use-speech'
import { useClock } from '@/hooks/use-clock'
import { MonitorHeader } from '@/routes/monitor/monitor-header'
import { MonitorServiceCard } from '@/routes/monitor/monitor-service-card'
import { MonitorFooter } from '@/routes/monitor/monitor-footer'
import { MonitorMediaPanel } from '@/routes/monitor/monitor-media-panel'
import type { WsEvent } from '@sianter/backend'

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

function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

function parseSlideshowImages(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function MonitorPage() {
  const [data, setData] = useState<MonitorData | null>(null)
  const { time } = useClock()
  const { enabled, setEnabled, speak } = useSpeech()
  const [animatingIds, setAnimatingIds] = useState<string[]>([])
  const prevDipanggilRef = useRef<Map<string, string | null>>(new Map())

  const fetchData = useCallback(async () => {
    try {
      const res = await server.api.monitor.get()
      if (res.data) setData(res.data)
    } catch {
      // silently ignore fetch errors
    }
  }, [])

  const handleWsEvent = useCallback(
    (event: WsEvent) => {
      if (event.type === 'antrean:called' || event.type === 'antrean:recalled') {
        const d = event.data
        speak(
          `Nomor ${d.kode}, silakan menuju ${d.loketNama ?? 'loket'}`,
        )
      }

      if (event.type === 'kegiatan:changed' && event.data.action === 'replaced') {
        fetchData()
        return
      }

      setData((prev) => {
        if (!prev) return prev
        switch (event.type) {
          case 'antrean:called':
          case 'antrean:recalled': {
            const d = event.data
            return {
              ...prev,
              layanan: prev.layanan.map((l) =>
                l.id === d.layananId
                  ? {
                    ...l,
                    dipanggil: {
                      kode: d.kode,
                      nomorUrut: d.nomorUrut,
                      status: d.status,
                      loketNama: d.loketNama,
                    },
                    menunggu: l.menunggu.filter((m) => m.kode !== d.kode),
                    dilewati: l.dilewati.filter((s) => s.kode !== d.kode),
                  }
                  : l,
              ),
            }
          }
          case 'antrean:skipped': {
            const d = event.data
            return {
              ...prev,
              layanan: prev.layanan.map((l) =>
                l.id === d.layananId
                  ? {
                    ...l,
                    dipanggil: null,
                    dilewati: l.dilewati.length < 5
                      ? [
                        ...l.dilewati,
                        { kode: d.kode, nomorUrut: d.nomorUrut },
                      ]
                      : l.dilewati,
                  }
                  : l,
              ),
            }
          }
          case 'antrean:finished': {
            const d = event.data
            return {
              ...prev,
              layanan: prev.layanan.map((l) =>
                l.id === d.layananId
                  ? {
                    ...l,
                    dipanggil: null,
                    dilewati: l.dilewati.filter((s) => s.kode !== d.kode),
                  }
                  : l,
              ),
            }
          }
          case 'antrean:created': {
            const d = event.data
            return {
              ...prev,
              layanan: prev.layanan.map((l) =>
                l.id === d.layananId && l.menunggu.length < 5
                  ? {
                    ...l,
                    menunggu: [
                      ...l.menunggu,
                      { kode: d.kode, nomorUrut: d.nomorUrut },
                    ],
                  }
                  : l,
              ),
            }
          }
          case 'pengaturan:updated': {
            const d = event.data
            return {
              ...prev,
              runningText: d.runningText,
              mediaUrl: d.mediaUrl,
              youtubeVideoUrl: d.youtubeVideoUrl,
              youtubePlaylistUrl: d.youtubePlaylistUrl,
              slideshowImages: d.slideshowImages,
              slideshowInterval: d.slideshowInterval,
              kegiatanInterval: d.kegiatanInterval,
            }
          }
          case 'layanan:changed': {
            const d = event.data
            if (d.action === 'deleted' || !d.aktif) {
              return { ...prev, layanan: prev.layanan.filter((l) => l.id !== d.id) }
            }
            const existing = prev.layanan.find((l) => l.id === d.id)
            if (existing) {
              return {
                ...prev,
                layanan: prev.layanan.map((l) =>
                  l.id === d.id
                    ? { ...l, nama: d.nama, prefix: d.prefix, warna: d.warna }
                    : l,
                ),
              }
            }
            return {
              ...prev,
              layanan: [
                ...prev.layanan,
                {
                  id: d.id,
                  nama: d.nama,
                  prefix: d.prefix,
                  warna: d.warna,
                  dipanggil: null,
                  menunggu: [],
                  dilewati: [],
                },
              ],
            }
          }
          case 'kegiatan:changed': {
            const { action, ...item } = event.data
            if (action === 'deleted') {
              return {
                ...prev,
                kegiatan: (prev.kegiatan ?? []).filter((k) => k.id !== item.id),
              }
            }
            const ex = (prev.kegiatan ?? []).find((k) => k.id === item.id)
            if (ex) {
              return {
                ...prev,
                kegiatan: (prev.kegiatan ?? []).map((k) =>
                  k.id === item.id ? { ...k, ...item } : k,
                ),
              }
            }
            return { ...prev, kegiatan: [...(prev.kegiatan ?? []), item] }
          }
          default:
            return prev
        }
      })
    },
    [speak, fetchData],
  )

  const wsStatus = useMonitorSocket(handleWsEvent, fetchData)

  const prevStatus = useRef<WsStatus>(wsStatus)
  useEffect(() => {
    if (prevStatus.current === wsStatus) return
    prevStatus.current = wsStatus
    if (wsStatus === 'connected') toast.success('WebSocket connected', {
      duration: 1000,
    })
    if (wsStatus === 'disconnected') toast.error('WebSocket disconnected', {
      duration: 1000,
    })
  }, [wsStatus])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!data) return
    data.layanan.forEach((l) => {
      const prevKode = prevDipanggilRef.current.get(l.id) ?? null
      const currKode = l.dipanggil?.kode ?? null
      if (prevKode !== undefined && prevKode !== currKode && currKode !== null) {
        setAnimatingIds((ids) => [...ids, l.id])
        setTimeout(() => {
          setAnimatingIds((ids) => ids.filter((id) => id !== l.id))
        }, 1500)
      }
      prevDipanggilRef.current.set(l.id, currKode)
    })
  }, [data])

  const youtubeVideoId = data?.youtubeVideoUrl
    ? extractYouTubeId(data.youtubeVideoUrl)
    : null
  const playlistId = data?.youtubePlaylistUrl
    ? extractPlaylistId(data.youtubePlaylistUrl)
    : null
  const slideshowImages = parseSlideshowImages(data?.slideshowImages ?? null)

  return (
    <div className="flex h-full flex-col bg-background">
      <MonitorHeader
        time={time}
        wsStatus={wsStatus}
        speechEnabled={enabled}
        onToggleSpeech={() => setEnabled((v) => !v)}
      />

      <main className="flex flex-1 min-h-0">
        <div className="flex w-[60%] flex-col min-w-0 min-h-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="grid auto-rows-fr grid-cols-2 gap-4 p-6">
              {data?.layanan.map((l) => (
                <MonitorServiceCard
                  key={l.id}
                  nama={l.nama}
                  warna={l.warna}
                  dipanggil={l.dipanggil}
                  menunggu={l.menunggu}
                  dilewati={l.dilewati}
                  isAnimating={animatingIds.includes(l.id)}
                />
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
          {data && (
            <MonitorMediaPanel
              youtubeVideoId={youtubeVideoId}
              playlistId={playlistId}
              slideshowImages={slideshowImages}
              slideshowInterval={data.slideshowInterval}
              kegiatanInterval={data.kegiatanInterval}
              kegiatanList={data.kegiatan ?? []}
            />
          )}
        </div>
      </main>

      <MonitorFooter runningText={data?.runningText ?? null} />
    </div>
  )
}