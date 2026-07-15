import { useEffect, useState, useCallback } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { Save, Radio, Youtube, ListVideo, Image, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Pengaturan {
  modeAntrean: 'FIFO_GLOBAL' | 'SELECTIVE'
  runningText: string | null
  mediaUrl: string | null
  youtubeVideoUrl: string | null
  youtubePlaylistUrl: string | null
  slideshowImages: string | null
  slideshowInterval: number
  kegiatanInterval: number
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

export function SettingsAdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Pengaturan>({
    modeAntrean: 'FIFO_GLOBAL',
    runningText: '',
    mediaUrl: '',
    youtubeVideoUrl: '',
    youtubePlaylistUrl: '',
    slideshowImages: null,
    slideshowInterval: 5,
    kegiatanInterval: 8,
  })
  const [slideshowImages, setSlideshowImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await server.api.admin.pengaturan.get()
    if (error) {
      toast.error('Gagal memuat pengaturan')
    } else if (data) {
      setForm({
        modeAntrean: data.modeAntrean,
        runningText: data.runningText ?? '',
        mediaUrl: data.mediaUrl ?? '',
        youtubeVideoUrl: data.youtubeVideoUrl ?? '',
        youtubePlaylistUrl: data.youtubePlaylistUrl ?? '',
        slideshowImages: data.slideshowImages ?? null,
        slideshowInterval: data.slideshowInterval ?? 5,
        kegiatanInterval: data.kegiatanInterval ?? 8,
      })
      setSlideshowImages(parseSlideshowImages(data.slideshowImages))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      ...form,
      runningText: form.runningText || null,
      mediaUrl: form.mediaUrl || null,
      youtubeVideoUrl: form.youtubeVideoUrl || null,
      youtubePlaylistUrl: form.youtubePlaylistUrl || null,
      slideshowImages: slideshowImages.length > 0 ? JSON.stringify(slideshowImages) : null,
      slideshowInterval: form.slideshowInterval,
      kegiatanInterval: form.kegiatanInterval,
    }
    const { data, error } = await server.api.admin.pengaturan.put(body)
    setSaving(false)
    if (error) {
      toast.error('Gagal menyimpan pengaturan')
    } else if (data) {
      setForm({
        modeAntrean: data.modeAntrean,
        runningText: data.runningText ?? '',
        mediaUrl: data.mediaUrl ?? '',
        youtubeVideoUrl: data.youtubeVideoUrl ?? '',
        youtubePlaylistUrl: data.youtubePlaylistUrl ?? '',
        slideshowImages: data.slideshowImages ?? null,
        slideshowInterval: data.slideshowInterval ?? 5,
        kegiatanInterval: data.kegiatanInterval ?? 8,
      })
      setSlideshowImages(parseSlideshowImages(data.slideshowImages))
      toast.success('Pengaturan disimpan')
    }
  }

  const addImage = () => {
    const url = newImageUrl.trim()
    if (url && !slideshowImages.includes(url)) {
      setSlideshowImages([...slideshowImages, url])
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setSlideshowImages(slideshowImages.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">Pengaturan Sistem</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Konfigurasi mode antrean, running text, dan media display
      </p>

      <form onSubmit={handleSave} className="mt-6 max-w-2xl space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Radio className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Mode Antrean</h2>
            </div>
            <RadioGroup
              value={form.modeAntrean}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  modeAntrean: v as Pengaturan['modeAntrean'],
                })
              }
              className="space-y-3"
            >
              <Label
                htmlFor="mode-fifo"
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-checked:border-primary has-checked:bg-primary/5"
              >
                <RadioGroupItem id="mode-fifo" value="FIFO_GLOBAL" />
                <div>
                  <p className="font-medium">FIFO Global (Otomatis)</p>
                  <p className="text-sm text-muted-foreground">
                    Pemanggilan berdasarkan siapa yang datang duluan lintas
                    layanan. Petugas hanya tekan tombol "Panggil Berikutnya".
                  </p>
                </div>
              </Label>
              <Label
                htmlFor="mode-selective"
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-checked:border-primary has-checked:bg-primary/5"
              >
                <RadioGroupItem id="mode-selective" value="SELECTIVE" />
                <div>
                  <p className="font-medium">Selektif per Kategori (Manual)</p>
                  <p className="text-sm text-muted-foreground">
                    Petugas memilih layanan mana yang dipanggil. Muncul kartu
                    per layanan dengan tombol panggil sendiri.
                  </p>
                </div>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="runningText">Running Text</Label>
          <Textarea
            id="runningText"
            value={form.runningText ?? ''}
            onChange={(e) =>
              setForm({ ...form, runningText: e.target.value })
            }
            placeholder="Pengumuman yang tampil di bagian bawah monitor display"
            rows={3}
          />
        </div>

        <Separator />

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center gap-2">
              <Youtube className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Media Display</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeVideoUrl" className="flex items-center gap-2">
                <Youtube className="size-4" />
                YouTube Video (Single)
              </Label>
              <Input
                id="youtubeVideoUrl"
                value={form.youtubeVideoUrl ?? ''}
                onChange={(e) =>
                  setForm({ ...form, youtubeVideoUrl: e.target.value })
                }
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubePlaylistUrl" className="flex items-center gap-2">
                <ListVideo className="size-4" />
                YouTube Playlist
              </Label>
              <Input
                id="youtubePlaylistUrl"
                value={form.youtubePlaylistUrl ?? ''}
                onChange={(e) =>
                  setForm({ ...form, youtubePlaylistUrl: e.target.value })
                }
                placeholder="https://www.youtube.com/playlist?list=..."
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Image className="size-4" />
                Gambar Slideshow
              </Label>
              {slideshowImages.length > 0 && (
                <div className="space-y-2">
                  {slideshowImages.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-muted font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                      <Input
                        value={url}
                        onChange={(e) => {
                          const updated = [...slideshowImages]
                          updated[i] = e.target.value
                          setSlideshowImages(updated)
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(i)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="URL gambar baru"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addImage()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addImage}>
                  <Plus className="size-4" />
                  Tambah
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slideshowInterval">Interval Slideshow (detik)</Label>
              <Input
                id="slideshowInterval"
                type="number"
                min={1}
                max={60}
                value={form.slideshowInterval}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slideshowInterval: Math.max(1, Number(e.target.value)),
                  })
                }
                className="w-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kegiatanInterval">Interval Jadwal Kegiatan (detik)</Label>
              <Input
                id="kegiatanInterval"
                type="number"
                min={3}
                max={120}
                value={form.kegiatanInterval}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kegiatanInterval: Math.max(3, Number(e.target.value)),
                  })
                }
                className="w-24"
              />
              <p className="text-xs text-muted-foreground">
                Durasi rotasi per card kegiatan di monitor (3-120 detik)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="size-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>
    </div>
  )
}