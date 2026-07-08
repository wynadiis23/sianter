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

interface Layanan {
  nama: string
  prefix: string
  aktif?: boolean
}

interface LayananWithId extends Layanan {
  id?: string
  createdAt?: string
  updatedAt?: string
}

const empty: Layanan = { nama: '', prefix: '', aktif: true }

export function LayananAdminPage() {
  const [items, setItems] = useState<LayananWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LayananWithId | null>(null)
  const [form, setForm] = useState<Layanan>(empty)
  const [saving, setSaving] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await server.api.admin.layanan.get()
    if (error) toast.error('Gagal memuat layanan')
    else setItems(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setDialogOpen(true)
  }

  const openEdit = (item: LayananWithId) => {
    setEditing(item)
    setForm({ nama: item.nama, prefix: item.prefix, aktif: item.aktif })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (editing?.id) {
      const { data, error } = await server.api.admin.layanan({
        id: editing.id,
      }).put(form)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) =>
          prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)),
        )
        toast.success('Layanan diperbarui')
        setDialogOpen(false)
      }
    } else {
      const { data, error } = await server.api.admin.layanan.post(form)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) => [...prev, data as LayananWithId])
        toast.success('Layanan dibuat')
        setDialogOpen(false)
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await server.api.admin.layanan({ id }).delete()
    if (error) {
      toast.error(error.value?.message ?? 'Gagal menghapus')
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Layanan dihapus')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Layanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola daftar layanan, prefix, dan status
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
              <TableHead>Nama</TableHead>
              <TableHead className="w-24">Prefix</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              : items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.prefix}</Badge>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Layanan' : 'Tambah Layanan'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Ubah detail layanan'
                : 'Buat layanan antrean baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Layanan</Label>
              <Input
                id="nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Pembuatan KTP"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                value={form.prefix}
                onChange={(e) =>
                  setForm({ ...form, prefix: e.target.value.toUpperCase() })
                }
                placeholder="A"
                maxLength={3}
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="aktif">Status Aktif</Label>
                <p className="text-sm text-muted-foreground">
                  Layanan nonaktif tidak muncul di kios tiket
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
