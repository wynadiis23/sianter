import { useEffect, useState, useCallback } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

interface Sesi {
  nama: string
  jamMulai: string
  jamSelesai: string
  kuota?: number
  layananId: string
  aktif?: boolean
}

interface SesiWithId extends Sesi {
  id?: string
  namaLayanan?: string
  createdAt?: Date
  updatedAt?: Date
}

interface LayananOption {
  id: string
  nama: string
}

const empty: Sesi = { nama: '', jamMulai: '', jamSelesai: '', kuota: 0, layananId: '', aktif: true }

export function SesiAdminPage() {
  const [items, setItems] = useState<SesiWithId[]>([])
  const [layananOptions, setLayananOptions] = useState<LayananOption[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SesiWithId | null>(null)
  const [form, setForm] = useState<Sesi>(empty)
  const [saving, setSaving] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await server.api.admin.sesi.get()
    if (error) toast.error('Gagal memuat sesi')
    else setItems(data ?? [])
    setLoading(false)
  }, [])

  const fetchLayanan = useCallback(async () => {
    const { data, error } = await server.api.admin.layanan.get()
    if (!error && data) {
      setLayananOptions(data ?? [])
    }
  }, [])

  useEffect(() => {
    fetch()
    fetchLayanan()
  }, [fetch, fetchLayanan])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...empty, kuota: 0 })
    setDialogOpen(true)
  }

  const openEdit = (item: SesiWithId) => {
    setEditing(item)
    setForm({
      nama: item.nama,
      jamMulai: item.jamMulai.substring(0, 5),
      jamSelesai: item.jamSelesai.substring(0, 5),
      kuota: item.kuota,
      layananId: item.layananId,
      aktif: item.aktif,
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.layananId) {
      toast.error('Pilih layanan')
      return
    }
    setSaving(true)

    const payload = {
      ...form,
      jamMulai: form.jamMulai + ':00',
      jamSelesai: form.jamSelesai + ':00',
      kuota: form.kuota ?? 0,
    }

    if (editing?.id) {
      const { data, error } = await server.api.admin
        .sesi({ id: editing.id })
        .put(payload)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) =>
          prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)),
        )
        toast.success('Sesi diperbarui')
        setDialogOpen(false)
      }
    } else {
      const { data, error } = await server.api.admin.sesi.post(payload)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) => [...prev, data as SesiWithId])
        toast.success('Sesi dibuat')
        setDialogOpen(false)
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await server.api.admin.sesi({ id }).delete()
    if (error) {
      toast.error(error.value?.message ?? 'Gagal menghapus')
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Sesi dihapus')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sesi Antrean</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola sesi waktu antrean per layanan
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Tambah
        </Button>
      </div>

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Sesi</TableHead>
              <TableHead>Layanan</TableHead>
              <TableHead className="w-32">Jam</TableHead>
              <TableHead className="w-20">Kuota</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              : items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell className="text-muted-foreground">{item.namaLayanan}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.jamMulai?.substring(0, 5)} – {item.jamSelesai?.substring(0, 5)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.kuota != null && item.kuota > 0 ? item.kuota : <span className="text-muted-foreground">∞</span>}
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
                            onClick={() => item.id && handleDelete(item.id)}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Sesi' : 'Tambah Sesi'}
            </DialogTitle>
            <DialogDescription>
              {editing ? 'Ubah detail sesi antrean' : 'Buat sesi antrean baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="layanan">Layanan</Label>
              <Select
                value={form.layananId}
                onValueChange={(v) => setForm({ ...form, layananId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih layanan" />
                </SelectTrigger>
                <SelectContent>
                  {layananOptions.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Sesi</Label>
              <Input
                id="nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Pagi"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jamMulai">Jam Mulai</Label>
                <Input
                  id="jamMulai"
                  type="time"
                  value={form.jamMulai}
                  onChange={(e) => setForm({ ...form, jamMulai: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jamSelesai">Jam Selesai</Label>
                <Input
                  id="jamSelesai"
                  type="time"
                  value={form.jamSelesai}
                  onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kuota">Kuota (0 = tidak terbatas)</Label>
              <Input
                id="kuota"
                type="number"
                min={0}
                value={form.kuota ?? 0}
                onChange={(e) => setForm({ ...form, kuota: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="aktif">Status Aktif</Label>
                <p className="text-sm text-muted-foreground">
                  Sesi nonaktif tidak muncul di pemesanan online
                </p>
              </div>
              <Switch
                id="aktif"
                checked={form.aktif}
                onCheckedChange={(v) => setForm({ ...form, aktif: v })}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
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
