import { useEffect, useState, useCallback, useRef } from 'react'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Pencil, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface Kegiatan {
  id: string
  tanggalWaktu: string
  namaKegiatan: string
  metodeRapat: string
  penyelenggara: string
  nomorSurat: string
  keterangan: string
  createdAt?: Date
  updatedAt?: Date
}

interface KegiatanForm {
  tanggalWaktu: string
  namaKegiatan: string
  metodeRapat: string
  penyelenggara: string
  nomorSurat: string
  keterangan: string
}

const empty: KegiatanForm = {
  tanggalWaktu: '',
  namaKegiatan: '',
  metodeRapat: '',
  penyelenggara: '',
  nomorSurat: '',
  keterangan: '',
}

export function KegiatanAdminPage() {
  const [items, setItems] = useState<Kegiatan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Kegiatan | null>(null)
  const [form, setForm] = useState<KegiatanForm>(empty)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await server.api.admin.kegiatan.get()
    if (error) toast.error('Gagal memuat kegiatan')
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

  const openEdit = (item: Kegiatan) => {
    setEditing(item)
    setForm({
      tanggalWaktu: item.tanggalWaktu,
      namaKegiatan: item.namaKegiatan,
      metodeRapat: item.metodeRapat,
      penyelenggara: item.penyelenggara,
      nomorSurat: item.nomorSurat,
      keterangan: item.keterangan,
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (editing?.id) {
      const { data, error } = await server.api.admin
        .kegiatan({ id: editing.id })
        .put(form)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) =>
          prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)),
        )
        toast.success('Kegiatan diperbarui')
        setDialogOpen(false)
      }
    } else {
      const { data, error } = await server.api.admin.kegiatan.post(form)
      if (error) {
        toast.error(error.value?.message ?? 'Gagal menyimpan')
      } else if (data) {
        setItems((prev) => [...prev, data as Kegiatan])
        toast.success('Kegiatan dibuat')
        setDialogOpen(false)
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await server.api.admin.kegiatan({ id }).delete()
    if (error) {
      toast.error(error.value?.message ?? 'Gagal menghapus')
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Kegiatan dihapus')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    const { data, error } = await server.api.admin.kegiatan.import.post({
      file,
    })
    if (error) {
      toast.error(
        error.value?.message ??
          'Gagal mengimpor file',
      )
    } else if (data) {
      toast.success(
        `${data.imported} kegiatan diimpor (${data.replaced} data lama diganti)`,
      )
      fetch()
    }
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Jadwal Kegiatan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola jadwal kegiatan yang ditampilkan di monitor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            <Upload className="size-4" />
            {importing ? 'Mengimpor...' : 'Import Excel'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Tambah
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Hari/Tanggal/Waktu</TableHead>
              <TableHead>Kegiatan</TableHead>
              <TableHead className="w-[100px]">Metode</TableHead>
              <TableHead className="w-[150px]">Penyelenggara</TableHead>
              <TableHead className="w-[130px]">Nomor Surat</TableHead>
              <TableHead>Keterangan</TableHead>
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
                      <Skeleton className="h-5 w-60" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              : items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {item.tanggalWaktu}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {item.namaKegiatan}
                    </TableCell>
                    <TableCell>{item.metodeRapat}</TableCell>
                    <TableCell className="truncate">
                      {item.penyelenggara}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.nomorSurat}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {item.keterangan}
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
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Belum ada data kegiatan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Ubah detail kegiatan'
                : 'Buat data kegiatan baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tanggalWaktu">Hari/Tanggal/Waktu</Label>
              <Input
                id="tanggalWaktu"
                value={form.tanggalWaktu}
                onChange={(e) =>
                  setForm({ ...form, tanggalWaktu: e.target.value })
                }
                placeholder="Contoh: Selasa, 14 Juli 2026 Pukul 08.00 WITA"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namaKegiatan">Kegiatan</Label>
              <Textarea
                id="namaKegiatan"
                value={form.namaKegiatan}
                onChange={(e) =>
                  setForm({ ...form, namaKegiatan: e.target.value })
                }
                placeholder="Nama/deskripsi kegiatan"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metodeRapat">Metode Rapat</Label>
                <Input
                  id="metodeRapat"
                  value={form.metodeRapat}
                  onChange={(e) =>
                    setForm({ ...form, metodeRapat: e.target.value })
                  }
                  placeholder="Luring / Daring"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="penyelenggara">Penyelenggara</Label>
                <Input
                  id="penyelenggara"
                  value={form.penyelenggara}
                  onChange={(e) =>
                    setForm({ ...form, penyelenggara: e.target.value })
                  }
                  placeholder="Nama instansi"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nomorSurat">Nomor Surat</Label>
              <Input
                id="nomorSurat"
                value={form.nomorSurat}
                onChange={(e) =>
                  setForm({ ...form, nomorSurat: e.target.value })
                }
                placeholder="Contoh: 165/B.M/VI/2026"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                value={form.keterangan}
                onChange={(e) =>
                  setForm({ ...form, keterangan: e.target.value })
                }
                placeholder="Keterangan tambahan"
                rows={2}
                required
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