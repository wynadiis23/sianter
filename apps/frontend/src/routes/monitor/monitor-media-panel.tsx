import { useState, useEffect } from 'react'
import { Youtube, ListVideo, Image, CalendarDays } from 'lucide-react'
import { KegiatanRotator } from '@/components/kegiatan-rotator'
import { KegiatanTiles } from '@/components/kegiatan-tiles'

type MediaTab = 'video' | 'playlist' | 'slideshow' | 'kegiatan'

interface KegiatanItem {
  id: string
  tanggalWaktu: string
  namaKegiatan: string
  metodeRapat: string
  penyelenggara: string
  nomorSurat: string
  keterangan: string
}

interface MonitorMediaPanelProps {
  youtubeVideoId: string | null
  playlistId: string | null
  slideshowImages: string[]
  slideshowInterval: number
  kegiatanInterval: number
  kegiatanList: KegiatanItem[]
}

function Slideshow({
  images,
  interval,
}: {
  images: string[]
  interval: number
}) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, interval * 1000)
    return () => clearInterval(timer)
  }, [images.length, interval])

  if (images.length === 0) return null

  return (
    <div className="relative h-full w-full overflow-hidden">
      {images.map((url, i) => (
        <img
          key={i}
          src={url}
          alt={`Slide ${i + 1}`}
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
    </div>
  )
}

export function MonitorMediaPanel({
  youtubeVideoId,
  playlistId,
  slideshowImages,
  slideshowInterval,
  kegiatanInterval,
  kegiatanList,
}: MonitorMediaPanelProps) {
  const [tab, setTab] = useState<MediaTab>('kegiatan')
  const [kegiatanMode, setKegiatanMode] = useState<'rotate' | 'tiles'>('tiles')

  const availableTabs = [
    {
      key: 'kegiatan' as MediaTab,
      icon: CalendarDays,
      label: 'Jadwal',
      available: kegiatanList.length > 0,
    },
    {
      key: 'video' as MediaTab,
      icon: Youtube,
      label: 'Video',
      available: !!youtubeVideoId,
    },
    {
      key: 'playlist' as MediaTab,
      icon: ListVideo,
      label: 'Playlist',
      available: !!playlistId,
    },
    {
      key: 'slideshow' as MediaTab,
      icon: Image,
      label: 'Gambar',
      available: slideshowImages.length > 0,
    },
  ].filter((t) => t.available)

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find((t) => t.key === tab)) {
      setTab(availableTabs[0].key)
    }
  }, [availableTabs, tab])

  if (availableTabs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
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
      </div>
    )
  }

  const showTabs = availableTabs.length > 1

  return (
    <div className="flex flex-1 flex-col">
      {showTabs && (
        <div className="flex shrink-0 border-b">
          {availableTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 ease-enter active:scale-[0.97] ${tab === t.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-1 items-center justify-center p-4">
        {tab === 'video' && youtubeVideoId && (
          <iframe
            className="h-full w-full rounded-lg"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeVideoId}`}
            title="Video"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
        {tab === 'playlist' && playlistId && (
          <iframe
            className="h-full w-full rounded-lg"
            src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=1&controls=0`}
            title="Playlist"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
        {tab === 'slideshow' && slideshowImages.length > 0 && (
          <Slideshow
            images={slideshowImages}
            interval={slideshowInterval}
          />
        )}
        {tab === 'kegiatan' && kegiatanMode === 'rotate' && (
          <KegiatanRotator
            items={kegiatanList}
            interval={kegiatanInterval}
            onToggleMode={() => setKegiatanMode('tiles')}
          />
        )}
        {tab === 'kegiatan' && kegiatanMode === 'tiles' && (
          <KegiatanTiles
            items={kegiatanList}
            onToggleMode={() => setKegiatanMode('rotate')}
          />
        )}
      </div>
    </div>
  )
}