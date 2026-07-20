import { useState, useEffect } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, LayoutGrid, Video, Users, Blend, Building2 } from 'lucide-react'

interface KegiatanItem {
  id: string
  tanggalWaktu: string
  namaKegiatan: string
  metodeRapat: string
  penyelenggara: string
  nomorSurat: string
  keterangan: string
}

export function KegiatanRotator({
  items,
  interval,
  onToggleMode,
}: {
  items: KegiatanItem[]
  interval: number
  onToggleMode?: () => void
}) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = items.length

  useEffect(() => {
    if (total <= 1 || paused) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total)
    }, interval * 1000)
    return () => clearInterval(timer)
  }, [total, interval, paused])

  if (total === 0) return null

  const item = items[current]

  const palette = [
    { border: '#3b82f6', bg1: '#3b82f6', bg2: '#60a5fa', bg3: '#1d4ed8' },
    { border: '#8b5cf6', bg1: '#8b5cf6', bg2: '#a78bfa', bg3: '#6d28d9' },
    { border: '#06b6d4', bg1: '#06b6d4', bg2: '#22d3ee', bg3: '#0e7490' },
    { border: '#f59e0b', bg1: '#f59e0b', bg2: '#fbbf24', bg3: '#d97706' },
    { border: '#10b981', bg1: '#10b981', bg2: '#34d399', bg3: '#059669' },
    { border: '#ef4444', bg1: '#ef4444', bg2: '#f87171', bg3: '#dc2626' },
  ]
  const p = palette[current % palette.length]

  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1))
  const next = () => setCurrent((c) => (c + 1) % total)

  // Logika pemilihan ikon watermark berdasarkan metodeRapat
  const getWatermarkIcon = () => {
    const method = item.metodeRapat?.toLowerCase() || ''
    if (method.includes('daring')) return Video
    if (method.includes('luring')) return Users
    if (method.includes('hybrid')) return Blend
    return Building2 // Fallback jika tidak ada yang cocok
  }

  const WatermarkIcon = getWatermarkIcon()

  return (
    <div
      className="flex h-full w-full flex-col p-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Jadwal Kegiatan
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-[color,background-color,transform] duration-150 ease-enter hover:bg-muted active:scale-[0.97]"
            >
              <LayoutGrid className="size-3.5" />
              Tile
            </button>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              className="rounded p-0.5 text-muted-foreground transition-[color,background-color,transform] duration-150 ease-enter hover:bg-muted hover:text-foreground active:scale-[0.92]"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="min-w-10 text-center text-sm tabular-nums text-muted-foreground">
              {current + 1}/{total}
            </span>
            <button
              onClick={next}
              className="rounded p-0.5 text-muted-foreground transition-[color,background-color,transform] duration-150 ease-enter hover:bg-muted hover:text-foreground active:scale-[0.92]"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative flex flex-1 flex-col overflow-hidden rounded-xl border shadow-md transition-[opacity] duration-500 ease-on-screen"
        style={{
          borderLeftColor: p.border,
          borderLeftWidth: 5,
          background: `linear-gradient(135deg, ${p.border}18 0%, ${p.bg2}15 100%)`,
        }}
      >
        {/* Shape 1: Blurred Blob Kanan Atas */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full blur-3xl"
          style={{ backgroundColor: p.bg1, opacity: 0.25 }}
        />

        {/* Shape 2: Blurred Blob Kiri Bawah */}
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 size-52 rounded-full blur-3xl"
          style={{ backgroundColor: p.bg3, opacity: 0.2 }}
        />

        {/* Shape 3: Decorative Ring Kiri Atas */}
        <div
          className="pointer-events-none absolute -left-8 -top-8 size-28 rounded-full border-8"
          style={{ borderColor: p.border, opacity: 0.12 }}
        />

        {/* Shape 4: Giant Watermark Icon (Pojok Kanan Bawah) */}
        <WatermarkIcon
          className="pointer-events-none absolute -right-8 -bottom-8 size-52 -rotate-12"
          style={{
            color: p.border,
            opacity: 0.08,
            strokeWidth: 1.5 // Ketebalan garis ikon dibuat tipis agar terlihat elegan seperti watermark
          }}
        />

        {/* Shape 5: Dot Pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
            color: p.border,
          }}
        />

        {/* Header dengan Glassmorphism */}
        <div
          className="relative z-10 border-b px-5 py-4 backdrop-blur-md"
          style={{
            borderColor: `${p.border}20`,
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <p className="text-base font-semibold" style={{ color: p.bg3 }}>
            {item.tanggalWaktu}
          </p>
        </div>

        {/* Konten Utama */}
        <div className="relative z-10 flex flex-1 flex-col justify-center space-y-4 px-5 py-6 backdrop-blur-sm">
          <p className="text-xl font-bold leading-snug text-card-foreground drop-shadow-sm">
            {item.namaKegiatan}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {item.penyelenggara && (
              <span className="text-base font-medium text-foreground/80">
                {item.penyelenggara}
              </span>
            )}
            {item.nomorSurat && (
              <span className="text-base text-muted-foreground">
                {item.nomorSurat}
              </span>
            )}
            {item.metodeRapat && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-sm font-semibold"
                style={{
                  borderColor: `${p.border}30`,
                  color: p.bg3,
                  backgroundColor: `${p.border}10`
                }}
              >
                {/* Ikon kecil di dalam badge untuk penegas informasi */}
                <WatermarkIcon className="size-3.5" strokeWidth={2.5} />
                {item.metodeRapat}
              </span>
            )}
          </div>
          {item.keterangan && (
            <p className="text-base italic text-muted-foreground/80 leading-relaxed drop-shadow-sm">
              {item.keterangan}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}