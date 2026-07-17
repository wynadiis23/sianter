import { useEffect, useState, useCallback, useRef } from 'react'
import { server } from '@/lib/eden'
import { useSession } from '@/lib/auth'
import { toast } from 'sonner'
import { MoreHorizontal, Pencil, Trash2, Upload, DownloadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminPageHeader } from '@/components/admin-page-header'
import { KegiatanFormDialog } from '@/routes/admin/kegiatan/kegiatan-form-dialog'
import { KegiatanImportDialog } from '@/routes/admin/kegiatan/kegiatan-import-dialog'
import { KegiatanTemplateDialog } from '@/routes/admin/kegiatan/kegiatan-template-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
      <AdminPageHeader
        title="Jadwal Kegiatan"
        description="Kelola jadwal kegiatan yang ditampilkan di monitor"
        onButtonClick={openCreate}
        extraActions={
          <>
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
          </>
        }
      />

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

      <KegiatanFormDialog
        open={dialogOpen}
        editing={!!editing}
        form={form}
        saving={saving}
        onOpenChange={setDialogOpen}
        onFormChange={setForm}
        onSave={handleSave}
      />

      <KegiatanImportDialog
        open={importDialogOpen}
        selectedFile={selectedFile}
        importing={importing}
        validation={importValidation}
        onOpenChange={(open) => { setImportDialogOpen(open); if (!open) setImportValidation(null) }}
        onFileSelect={handleFileSelect}
        onSubmit={handleImportSubmit}
        inputRef={importFileInputRef}
      />

      <KegiatanTemplateDialog
        open={templateDialogOpen}
        templateFile={templateFile}
        uploading={templateUploading}
        onOpenChange={(open) => { setTemplateDialogOpen(open); if (!open) setTemplateFile(null) }}
        onFileSelect={setTemplateFile}
        onUpload={handleTemplateUpload}
        inputRef={templateFileInputRef}
      />
    </div>
  )
}