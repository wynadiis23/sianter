import { useEffect, useState, useCallback } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { Save, Radio, Youtube } from 'lucide-react'
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
}

export function SettingsAdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Pengaturan>({
    modeAntrean: 'FIFO_GLOBAL',
    runningText: '',
    mediaUrl: '',
  })

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
      })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await server.api.admin.pengaturan.put({
      modeAntrean: form.modeAntrean,
      runningText: form.runningText || null,
      mediaUrl: form.mediaUrl || null,
    })
    setSaving(false)
    if (error) {
      toast.error('Gagal menyimpan pengaturan')
    } else if (data) {
      setForm({
        modeAntrean: data.modeAntrean,
        runningText: data.runningText ?? '',
        mediaUrl: data.mediaUrl ?? '',
      })
      toast.success('Pengaturan disimpan')
    }
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
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
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
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
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

        <div className="space-y-2">
          <Label htmlFor="mediaUrl" className="flex items-center gap-2">
            <Youtube className="size-4" />
            URL Media (YouTube / Video)
          </Label>
          <Input
            id="mediaUrl"
            value={form.mediaUrl ?? ''}
            onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

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
