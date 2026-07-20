import { useEffect, useState, useCallback, useRef } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { MoreHorizontal, Pencil, Trash2, Upload, X } from 'lucide-react'
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

const WARNA_PALETTE = [
  { label: 'Merah', value: '#E53935' },
  { label: 'Biru', value: '#1E88E5' },
  { label: 'Hijau', value: '#43A047' },
  { label: 'Oranye', value: '#FB8C00' },
  { label: 'Ungu', value: '#8E24AA' },
  { label: 'Toska', value: '#00ACC1' },
  { label: 'Indigo', value: '#3949AB' },
  { label: 'Lime', value: '#C0CA33' },
  { label: 'Pink', value: '#D81B60' },
  { label: 'Coklat', value: '#6D4C41' },
] as const

interface Layanan {
  nama: string
  prefix: string
  deskripsi?: string | null
  gambar?: string | null
  warna?: string | null
  aktif?: boolean
}

interface LayananWithId extends Layanan {
  id?: string
  createdAt?: Date
  updatedAt?: Date
}

const empty: Layanan = { nama: '', prefix: '', deskripsi: '', gambar: '', warna: '', aktif: true }

export function LayananAdminPage() {
  const [items, setItems] = useState<LayananWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LayananWithId | null>(null)
  const [form, setForm] = useState<Layanan>(empty)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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
    setForm({
      nama: item.nama,
      prefix: item.prefix,
      deskripsi: item.deskripsi ?? '',
      gambar: item.gambar ?? '',
      warna: item.warna ?? '',
      aktif: item.aktif,
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      deskripsi: form.deskripsi || undefined,
      gambar: form.gambar || undefined,
      warna: form.warna || undefined,
    }

    if (editing?.id) {
      const { data, error } = await server.api.admin
        .layanan({ id: editing.id })
        .put(payload)
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
      const { data, error } = await server.api.admin.layanan.post(payload)
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm({ ...form, gambar: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setForm({ ...form, gambar: '' })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Layanan"
        description="Kelola daftar layanan, prefix, deskripsi, dan ikon"
        onButtonClick={openCreate}
      />

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="w-24">Prefix</TableHead>
              <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="size-8 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
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
                  <TableCell>
                    {item.gambar ? (
                      <img
                        src={item.gambar}
                        alt=""
                        className="size-8 rounded object-cover"
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground">
                        {item.prefix}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={
                        item.warna
                          ? {
                            borderColor: item.warna,
                            color: item.warna,
                          }
                          : undefined
                      }
                    >
                      {item.prefix}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate text-sm text-muted-foreground md:table-cell">
                    {item.deskripsi || '—'}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Layanan' : 'Tambah Layanan'}
            </DialogTitle>
            <DialogDescription>
              {editing ? 'Ubah detail layanan' : 'Buat layanan antrean baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
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
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={form.deskripsi ?? ''}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                placeholder="Deskripsi singkat layanan, muncul di kios tiket"
                rows={2}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label>Ikon / Gambar</Label>
              <div className="flex items-start gap-4">
                {form.gambar ? (
                  <div className="relative size-20 shrink-0">
                    <img
                      src={form.gambar}
                      alt="Preview"
                      className="size-20 rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-transform duration-150 ease-enter active:scale-[0.85]"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                    <Upload className="size-6" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    {form.gambar ? 'Ganti Gambar' : 'Pilih Gambar'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Format PNG/JPG, maks 500KB. Ikon akan tampil di kios tiket.
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Warna (opsional)</Label>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, warna: '' })}
                  className={`flex size-8 items-center justify-center rounded-full border-2 text-[10px] font-bold text-muted-foreground transition-transform duration-150 ease-enter active:scale-[0.90] hover:ring-2 hover:ring-ring ${!form.warna ? 'border-foreground' : 'border-muted-foreground/30'
                  }`}
                  title="Default"
                >
                  ∅
                </button>
                {WARNA_PALETTE.map((c) => {
                  const selected = form.warna === c.value
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          warna: selected ? '' : c.value,
                        })
                      }
                      className={`size-8 rounded-full border-2 transition-transform duration-150 ease-enter active:scale-[0.90] hover:ring-2 hover:ring-ring ${selected ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    >
                      {selected && (
                        <span className="flex items-center justify-center text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            <AktifSwitch
              checked={form.aktif ?? false}
              onCheckedChange={(v) => setForm({ ...form, aktif: v })}
              helperText="Layanan nonaktif tidak muncul di kios tiket"
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
    </div>
  )
}