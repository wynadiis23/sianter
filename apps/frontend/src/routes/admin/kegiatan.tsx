import { useEffect, useState, useCallback, useRef } from 'react'
import { server } from '@/lib/eden'
import { useSession } from '@/lib/auth'
import { toast } from 'sonner'
import { Plus, MoreHorizontal, Pencil, Trash2, Upload, Download, FileSpreadsheet, DownloadCloud } from 'lucide-react'
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
  const { data: session } = useSession()
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const importFileInputRef = useRef<HTMLInputElement>(null)
  const [importValidation, setImportValidation] = useState<{
    message: string
    errors?: Array<{ row: number; column: string }>
    expected?: string[]
    found?: string[]
  } | null>(null)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [templateUploading, setTemplateUploading] = useState(false)
  const templateFileInputRef = useRef<HTMLInputElement>(null)

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

  const handleTemplateUpload = async () => {
    if (!templateFile) return
    setTemplateUploading(true)
    const { error } = await server.api.admin.kegiatan.template.post({ file: templateFile })
    setTemplateUploading(false)
    if (error) {
      toast.error(error.value?.message ?? 'Gagal mengupload template')
      return
    }
    toast.success('Template diperbarui')
    setTemplateDialogOpen(false)
    setTemplateFile(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    setImportValidation(null)
  }

  const handleImportSubmit = async () => {
    if (!selectedFile) return

    setImportValidation(null)
    setImporting(true)
    const { data, error } = await server.api.admin.kegiatan.import.post({
      file: selectedFile,
    })
    setImporting(false)

    if (error) {
      setImportValidation(error.value as typeof importValidation)
      return
    }

    toast.success(
      `${data.imported} kegiatan diimpor (${data.replaced} data lama diganti)`,
    )
    setImportDialogOpen(false)
    setSelectedFile(null)
    setImportValidation(null)
    if (importFileInputRef.current) importFileInputRef.current.value = ''
    fetch()
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
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="size-4" />
            Import Excel
          </Button>
          {session?.user.role === 'SUPER_ADMIN' && (
            <Button variant="outline" onClick={() => setTemplateDialogOpen(true)}>
              <DownloadCloud className="size-4" />
              Kelola Template
            </Button>
          )}
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
              <TableHead className="w-50">Hari/Tanggal/Waktu</TableHead>
              <TableHead>Kegiatan</TableHead>
              <TableHead className="w-25">Metode</TableHead>
              <TableHead className="w-37.5">Penyelenggara</TableHead>
              <TableHead className="w-32.5">Nomor Surat</TableHead>
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
                  <TableCell className="max-w-75 truncate">
                    {item.namaKegiatan}
                  </TableCell>
                  <TableCell>{item.metodeRapat}</TableCell>
                  <TableCell className="truncate">
                    {item.penyelenggara}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.nomorSurat}
                  </TableCell>
                  <TableCell className="max-w-50 truncate">
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

      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        setImportDialogOpen(open)
        if (!open) setImportValidation(null)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Jadwal Kegiatan</DialogTitle>
            <DialogDescription>
              Unggah file Excel untuk mengimpor jadwal kegiatan secara massal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <p className="text-sm font-medium">Petunjuk:</p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                <li>Download template Excel terlebih dahulu</li>
                <li>Isi template sesuai kolom yang tersedia (Hari/Tanggal/Waktu, Kegiatan, Metode Rapat, Penyelenggara, Nomor Surat, Keterangan)</li>
                <li>Simpan file dan unggah pada form di bawah</li>
              </ol>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href={`${import.meta.env.VITE_API_URL}/api/admin/kegiatan/template`} download>
                <Download className="size-4" />
                Download Template
              </a>
            </Button>
            {importValidation && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-2">
                <p className="text-sm font-medium text-destructive">{importValidation.message}</p>
                {importValidation.errors && importValidation.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto">
                    {importValidation.errors.slice(0, 10).map((e, i) => (
                      <p key={i} className="text-xs text-destructive/80">Baris {e.row}: kolom &quot;{e.column}&quot;</p>
                    ))}
                    {importValidation.errors.length > 10 && (
                      <p className="text-xs text-muted-foreground mt-1">...dan {importValidation.errors.length - 10} cell lainnya</p>
                    )}
                  </div>
                )}
                {importValidation.expected && (
                  <div className="text-xs text-destructive/80 space-y-0.5">
                    <p>Diharapkan: {importValidation.expected.join(', ')}</p>
                    {importValidation.found && <p>Ditemukan: {importValidation.found.join(', ')}</p>}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="import-file">File Excel</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => importFileInputRef.current?.click()}
                >
                  <FileSpreadsheet className="size-4" />
                  Pilih File
                </Button>
                <span className="text-sm text-muted-foreground truncate">
                  {selectedFile ? selectedFile.name : 'Belum ada file dipilih'}
                </span>
              </div>
              <input
                ref={importFileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false)
                setSelectedFile(null)
                setImportValidation(null)
                if (importFileInputRef.current) importFileInputRef.current.value = ''
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleImportSubmit}
              disabled={!selectedFile || importing}
            >
              {importing ? 'Mengimpor...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kelola Template</DialogTitle>
            <DialogDescription>
              Download atau upload template Excel untuk import jadwal kegiatan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <a href={`${import.meta.env.VITE_API_URL}/api/admin/kegiatan/template`} download>
                <Download className="size-4" />
                Download Template Saat Ini
              </a>
            </Button>
            <div className="space-y-2">
              <Label htmlFor="template-file">Upload Template Baru</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => templateFileInputRef.current?.click()}
                >
                  <FileSpreadsheet className="size-4" />
                  Pilih File
                </Button>
                <span className="text-sm text-muted-foreground truncate">
                  {templateFile ? templateFile.name : 'Belum ada file dipilih'}
                </span>
              </div>
              <input
                ref={templateFileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => setTemplateFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTemplateDialogOpen(false)
                setTemplateFile(null)
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleTemplateUpload}
              disabled={!templateFile || templateUploading}
            >
              {templateUploading ? 'Mengupload...' : 'Simpan Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}