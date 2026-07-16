import { useEffect, useState, useCallback } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { MoreHorizontal, Pencil, Trash2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
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

interface Loket {
  nomor: number
  nama: string | null
  aktif?: boolean
}

interface LoketWithId extends Loket {
  id?: string
  createdAt?: string
  updatedAt?: string
}

interface LayananItem {
  id: string
  nama: string
  prefix: string
  assigned: boolean
}

const empty: Loket = { nomor: 1, nama: '', aktif: true }

export function LoketAdminPage() {
  const [items, setItems] = useState<LoketWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LoketWithId | null>(null)
  const [form, setForm] = useState<Loket>(empty)
  const [saving, setSaving] = useState(false)
  const [layananDialogOpen, setLayananDialogOpen] = useState(false)
  const [layananForLoket, setLayananForLoket] = useState<LayananItem[]>([])
  const [selectedLayanan, setSelectedLayanan] = useState<Set<string>>(new Set())
  const [layananDialogLoketId, setLayananDialogLoketId] = useState<string | null>(null)
  const [savingLayanan, setSavingLayanan] = useState(false)
  const [layananLoading, setLayananLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await server.api.admin.loket.get()
    if (error) toast.error('Gagal memuat loket')
    else setItems(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const openCreate = () => {
    const nextNomor = items.length > 0 ? Math.max(...items.map((i) => i.nomor)) + 1 : 1
    setEditing(null)
    setForm({ ...empty, nomor: nextNomor })
    setDialogOpen(true)
  }

  const openEdit = (item: LoketWithId) => {
    setEditing(item)
    setForm({ nomor: item.nomor, nama: item.nama ?? '', aktif: item.aktif })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const body = { ...form, nama: form.nama || null }

    if (editing?.id) {
      const { data, error } = await server.api.admin.loket({
        id: editing.id,
      }).put(body)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) =>
          prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)),
        )
        toast.success('Loket diperbarui')
        setDialogOpen(false)
      }
    } else {
      const { data, error } = await server.api.admin.loket.post(body)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) => [...prev, data as LoketWithId])
        toast.success('Loket dibuat')
        setDialogOpen(false)
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await server.api.admin.loket({ id }).delete()
    if (error) {
      toast.error(error.value?.message ?? 'Gagal menghapus')
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Loket dihapus')
    }
  }

  const openAturLayanan = async (id: string) => {
    setLayananDialogLoketId(id)
    setLayananForLoket([])
    setSelectedLayanan(new Set())
    setLayananLoading(true)
    setLayananDialogOpen(true)

    const { data, error } = await server.api.admin.loket({ id }).layanan.get()
    setLayananLoading(false)
    if (error) {
      toast.error('Gagal memuat data layanan')
      return
    }
    setLayananForLoket(data ?? [])
    setSelectedLayanan(new Set((data ?? []).filter((l) => l.assigned).map((l) => l.id)))
  }

  const toggleLayanan = (layananId: string) => {
    setSelectedLayanan((prev) => {
      const next = new Set(prev)
      if (next.has(layananId)) next.delete(layananId)
      else next.add(layananId)
      return next
    })
  }

  const handleSaveLayanan = async () => {
    if (!layananDialogLoketId) return
    setSavingLayanan(true)
    const { error } = await server.api.admin.loket({ id: layananDialogLoketId }).layanan.put({
      layananIds: Array.from(selectedLayanan),
    })
    setSavingLayanan(false)
    if (error) {
      toast.error(error.value?.message ?? 'Gagal menyimpan')
      return
    }
    toast.success('Layanan diperbarui')
    setLayananDialogOpen(false)
    setLayananForLoket([])
  }

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Loket"
        description="Kelola nomor loket dan status aktif"
        onButtonClick={openCreate}
      />

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Nomor</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
              : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-bold">
                    {item.nomor}
                  </TableCell>
                  <TableCell>{item.nama ?? '-'}</TableCell>
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
                        <DropdownMenuItem onClick={() => item.id && openAturLayanan(item.id)}>
                          <Layers className="size-4" />
                          Atur Layanan
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
              {editing ? 'Edit Loket' : 'Tambah Loket'}
            </DialogTitle>
            <DialogDescription>
              {editing ? 'Ubah detail loket' : 'Buat loket baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomor">Nomor Loket</Label>
              <Input
                id="nomor"
                type="number"
                min={1}
                value={form.nomor}
                onChange={(e) =>
                  setForm({ ...form, nomor: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama (opsional)</Label>
              <Input
                id="nama"
                value={form.nama ?? ''}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Loket A"
              />
            </div>
            <AktifSwitch
              checked={form.aktif ?? false}
              onCheckedChange={(v) => setForm({ ...form, aktif: v })}
              helperText="Loket nonaktif tidak bisa dipilih petugas"
            />
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

      <Dialog open={layananDialogOpen} onOpenChange={(v) => {
        setLayananDialogOpen(v)
        if (!v) setLayananForLoket([])
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atur Layanan</DialogTitle>
            <DialogDescription>
              Pilih layanan yang tersedia untuk loket ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {layananLoading ? (
              <div className="flex justify-center py-8">
                <span className="text-sm text-muted-foreground">Memuat layanan...</span>
              </div>
            ) : layananForLoket.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada layanan aktif</p>
            ) : (
              layananForLoket.map((layanan) => (
                <label
                  key={layanan.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-data-[state=checked]:border-primary"
                >
                  <Checkbox
                    checked={selectedLayanan.has(layanan.id)}
                    onCheckedChange={() => toggleLayanan(layanan.id)}
                  />
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-muted-foreground" />
                    <span className="font-medium">{layanan.nama}</span>
                    <span className="text-xs text-muted-foreground">
                      ({layanan.prefix})
                    </span>
                  </div>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLayananDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveLayanan} disabled={savingLayanan || layananLoading}>
              {savingLayanan ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
