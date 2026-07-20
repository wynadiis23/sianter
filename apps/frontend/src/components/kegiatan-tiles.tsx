import { useState, useEffect, useRef, useCallback } from 'react'
import { CalendarDays, RotateCw, X, ChevronLeft, ChevronRight, Video, Users, Blend, Building2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface KegiatanItem {
  id: string
  tanggalWaktu: string
  namaKegiatan: string
  metodeRapat: string
  penyelenggara: string
  nomorSurat: string
  keterangan: string
}

function getMetodeIcon(metode: string) {
  const m = metode?.toLowerCase() || ''
  if (m.includes('daring')) return Video
  if (m.includes('luring')) return Users
  if (m.includes('hybrid')) return Blend
  return Building2
}

const palette = [
  { border: '#3b82f6', bg1: '#3b82f6', bg2: '#60a5fa', bg3: '#1d4ed8' },
  { border: '#8b5cf6', bg1: '#8b5cf6', bg2: '#a78bfa', bg3: '#6d28d9' },
  { border: '#06b6d4', bg1: '#06b6d4', bg2: '#22d3ee', bg3: '#0e7490' },
  { border: '#f59e0b', bg1: '#f59e0b', bg2: '#fbbf24', bg3: '#d97706' },
  { border: '#10b981', bg1: '#10b981', bg2: '#34d399', bg3: '#059669' },
  { border: '#ef4444', bg1: '#ef4444', bg2: '#f87171', bg3: '#dc2626' },
]

export function KegiatanTiles({
  items,
  onToggleMode,
}: {
  items: KegiatanItem[]
  onToggleMode: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openDetail = (index: number) => {
    setSelectedIndex(index)
    setDialogOpen(true)
  }

  const selected = selectedIndex !== null ? items[selectedIndex] : null
  const total = items.length

  const checkOverflow = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setShouldScroll(el.scrollHeight > el.clientHeight)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    checkOverflow()
    const observer = new ResizeObserver(checkOverflow)
    observer.observe(el)
    return () => observer.disconnect()
  }, [items, checkOverflow])

  if (items.length === 0) return null

  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Jadwal Kegiatan
          </span>
        </div>
        <button
          onClick={onToggleMode}
          className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-[color,background-color,transform] duration-150 ease-enter hover:bg-muted active:scale-[0.97]"
        >
          <RotateCw className="size-3.5" />
          Rotate
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl">
        <div
          ref={containerRef}
          className={`h-full overflow-hidden ${shouldScroll ? 'animate-scroll-vertikal' : ''}`}
        >
          <div className="grid grid-cols-2 gap-3 p-0.5">
            {(shouldScroll ? [...items, ...items] : items).map((item, i) => {
              const p = palette[i % palette.length]
              const Icon = getMetodeIcon(item.metodeRapat)
              return (
                <div
                  key={`${item.id}-${i}`}
                  onClick={() => openDetail(i)}
                  className="relative flex flex-col overflow-hidden rounded-lg border shadow-sm transition-[transform,box-shadow] duration-200 ease-enter hover:shadow-md active:scale-[0.97] cursor-pointer"
                  style={{
                    borderLeftColor: p.border,
                    borderLeftWidth: 4,
                    background: `linear-gradient(135deg, ${p.border}12 0%, transparent 60%)`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl"
                    style={{ backgroundColor: p.bg1, opacity: 0.2 }}
                  />
                  <div
                    className="pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full blur-2xl"
                    style={{ backgroundColor: p.bg3, opacity: 0.15 }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle, currentColor 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                      color: p.border,
                    }}
                  />
                  <Icon
                    className="pointer-events-none absolute -bottom-2 -right-2 size-20 rotate-[-12deg]"
                    style={{ color: p.border, opacity: 0.06, strokeWidth: 1.5 }}
                  />
                  <div className="relative z-10 border-b px-3 py-2" style={{ borderColor: `${p.border}15`, backgroundColor: 'rgba(255,255,255,0.4)' }}>
                    <p className="text-xs font-semibold leading-tight" style={{ color: p.bg3 }}>
                      {item.tanggalWaktu}
                    </p>
                  </div>
                  <div className="relative z-10 flex flex-1 flex-col justify-center space-y-1.5 px-3 py-2.5">
                    <p className="text-sm font-semibold leading-snug text-card-foreground line-clamp-2">
                      {item.namaKegiatan}
                    </p>
                    {item.penyelenggara && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.penyelenggara}
                      </p>
                    )}
                    {item.metodeRapat && (
                      <span
                        className="inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          borderColor: `${p.border}25`,
                          color: p.bg3,
                          backgroundColor: `${p.border}08`,
                        }}
                      >
                        <Icon className="size-3" strokeWidth={2.5} />
                        {item.metodeRapat}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 [&>button]:hidden">
          {selected && selectedIndex !== null && (() => {
            const p = palette[selectedIndex % palette.length]
            const Icon = getMetodeIcon(selected.metodeRapat)
            return (
              <div className="relative flex flex-col overflow-hidden rounded-xl shadow-md" style={{ background: `linear-gradient(135deg, ${p.border}18 0%, ${p.bg2}15 100%)` }}>
                <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full blur-3xl" style={{ backgroundColor: p.bg1, opacity: 0.25 }} />
                <div className="pointer-events-none absolute -bottom-12 -left-12 size-52 rounded-full blur-3xl" style={{ backgroundColor: p.bg3, opacity: 0.2 }} />
                <div className="pointer-events-none absolute -left-8 -top-8 size-28 rounded-full border-[8px]" style={{ borderColor: p.border, opacity: 0.12 }} />
                <Icon className="pointer-events-none absolute -right-8 -bottom-8 size-52 rotate-[-12deg]" style={{ color: p.border, opacity: 0.08, strokeWidth: 1.5 }} />
                <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)', backgroundSize: '20px 20px', color: p.border }} />

                <div className="relative z-10 flex items-center justify-between border-b px-5 py-4 backdrop-blur-md" style={{ borderColor: `${p.border}20`, backgroundColor: 'rgba(255,255,255,0.5)' }}>
                  <p className="text-base font-semibold" style={{ color: p.bg3 }}>{selected.tanggalWaktu}</p>
                  <button onClick={() => setDialogOpen(false)} className="rounded p-1 text-muted-foreground transition-[color,background-color,transform] duration-150 ease-enter hover:bg-muted/50 hover:text-foreground active:scale-[0.92]">
                    <X className="size-5" />
                  </button>
                </div>

                <div className="relative z-10 flex flex-col space-y-4 px-5 py-8 backdrop-blur-sm">
                  <p className="text-xl font-bold leading-snug text-card-foreground drop-shadow-sm">{selected.namaKegiatan}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {selected.penyelenggara && <span className="text-base font-medium text-foreground/80">{selected.penyelenggara}</span>}
                    {selected.nomorSurat && <span className="text-base text-muted-foreground">{selected.nomorSurat}</span>}
                    {selected.metodeRapat && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-sm font-semibold" style={{ borderColor: `${p.border}30`, color: p.bg3, backgroundColor: `${p.border}10` }}>
                        <Icon className="size-3.5" strokeWidth={2.5} />
                        {selected.metodeRapat}
                      </span>
                    )}
                  </div>
                  {selected.keterangan && <p className="text-base italic text-muted-foreground/80 leading-relaxed drop-shadow-sm">{selected.keterangan}</p>}
                </div>

                <div className="relative z-10 flex items-center justify-center gap-4 border-t px-5 py-3 backdrop-blur-md" style={{ borderColor: `${p.border}20`, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedIndex <= 0}
                    onClick={() => setSelectedIndex((prev) => (prev! - 1 + total) % total)}
                  >
                    <ChevronLeft className="size-4" />
                    Sebelumnya
                  </Button>
                  <span className="text-sm tabular-nums text-muted-foreground">{selectedIndex + 1} / {total}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedIndex >= total - 1}
                    onClick={() => setSelectedIndex((prev) => (prev! + 1) % total)}
                  >
                    Selanjutnya
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
