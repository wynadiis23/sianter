import { useEffect, useState, useCallback } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminPageHeader } from '@/components/admin-page-header'
import { AktifSwitch } from '@/components/aktif-switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Kuesioner {
  id: string
  layananId: string
  link: string
  caption: string
  aktif: boolean
}

interface LayananItem {
  id: string
  nama: string
  prefix: string
}

const empty = { layananId: '', link: '', caption: '', aktif: true }

export function KuesionerAdminPage() {
  const [items, setItems] = useState<Kuesioner[]>([])
  const [layananList, setLayananList] = useState<LayananItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Kuesioner | null>(null)
  const [form, setForm] = useState<{ layananId: string; link: string; caption: string; aktif: boolean }>(empty)
  const [saving, setSaving] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const [kuesionerRes, layananRes] = await Promise.all([
      server.api.admin.kuesioner.get(),
      server.api.admin.layanan.get(),
    ])
    if (kuesionerRes.error) toast.error('Gagal memuat kuesioner')
    else setItems(kuesionerRes.data ?? [])
    if (layananRes.error) toast.error('Gagal memuat layanan')
    else setLayananList(layananRes.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setDialogOpen(true)
  }

  const openEdit = (item: Kuesioner) => {
    setEditing(item)
    setForm({
      layananId: item.layananId,
      link: item.link,
      caption: item.caption,
      aktif: item.aktif,
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.layananId) { toast.error('Pilih layanan'); return }
    setSaving(true)

    const payload = { ...form }

    if (editing?.id) {
      const { data, error } = await server.api.admin
        .kuesioner({ id: editing.id })
        .put(payload)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) =>
          prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)),
        )
        toast.success('Kuesioner diperbarui')
        setDialogOpen(false)
      }
    } else {
      const { data, error } = await server.api.admin.kuesioner.post(payload)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) => [...prev, data])
        toast.success('Kuesioner dibuat')
        setDialogOpen(false)
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await server.api.admin.kuesioner({ id }).delete()
    if (error) {
      toast.error(error.value?.message ?? 'Gagal menghapus')
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Kuesioner dihapus')
    }
  }

  const getNamaLayanan = (layananId: string) =>
    layananList.find((l) => l.id === layananId)?.nama ?? layananId

  const usedLayananIds = items.map((i) => i.layananId)
  const availableLayanan = editing
    ? layananList
    : layananList.filter((l) => !usedLayananIds.includes(l.id))

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Kuesioner"
        description="Kelola link kuesioner untuk setiap layanan"
        onButtonClick={openCreate}
      />

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Layanan</TableHead>
              <TableHead className="hidden md:table-cell">Link</TableHead>
              <TableHead>Caption</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
              : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {getNamaLayanan(item.layananId)}
                  </TableCell>
                  <TableCell className="hidden max-w-[250px] truncate md:table-cell">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.link}
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {item.caption}
                  </TableCell>
                  <TableCell>
                    {item.aktif ? (
                      <Badge>Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(item)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="size-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Kuesioner' : 'Tambah Kuesioner'}
            </DialogTitle>
            <DialogDescription>
              {editing ? 'Ubah link kuesioner layanan' : 'Tambahkan link kuesioner ke layanan'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="layanan">Layanan</Label>
              <Select
                value={form.layananId}
                onValueChange={(v) => setForm({ ...form, layananId: v })}
                disabled={!!editing}
              >
                <SelectTrigger id="layanan">
                  <SelectValue placeholder="Pilih layanan..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLayanan.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.nama} ({l.prefix})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link Kuesioner</Label>
              <Input
                id="link"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://forms.google.com/..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                placeholder="Beri penilaian setelah mendapatkan layanan"
                rows={2}
                maxLength={200}
                required
              />
            </div>
            <AktifSwitch
              checked={form.aktif}
              onCheckedChange={(v) => setForm({ ...form, aktif: v })}
              helperText="Nonaktifkan agar tidak tampil di tiket cetak"
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
