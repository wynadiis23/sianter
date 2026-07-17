import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, FileSpreadsheet } from 'lucide-react'

interface KegiatanImportDialogProps {
  open: boolean
  selectedFile: File | null
  importing: boolean
  validation: {
    message: string
    errors?: Array<{ row: number; column: string }>
    expected?: string[]
    found?: string[]
  } | null
  onOpenChange: (open: boolean) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function KegiatanImportDialog({
  open,
  selectedFile,
  importing,
  validation,
  onOpenChange,
  onFileSelect,
  onSubmit,
  inputRef,
}: KegiatanImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open: boolean) => { onOpenChange(open); if (!open) {/* validation reset handled by parent */} }}>
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
          {validation && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-2">
              <p className="text-sm font-medium text-destructive">{validation.message}</p>
              {validation.errors && validation.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto">
                  {validation.errors.slice(0, 10).map((e, i) => (
                    <p key={i} className="text-xs text-destructive/80">Baris {e.row}: kolom &quot;{e.column}&quot;</p>
                  ))}
                  {validation.errors.length > 10 && (
                    <p className="text-xs text-muted-foreground mt-1">...dan {validation.errors.length - 10} cell lainnya</p>
                  )}
                </div>
              )}
              {validation.expected && (
                <div className="text-xs text-destructive/80 space-y-0.5">
                  <p>Diharapkan: {validation.expected.join(', ')}</p>
                  {validation.found && <p>Ditemukan: {validation.found.join(', ')}</p>}
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
                onClick={() => inputRef.current?.click()}
              >
                <FileSpreadsheet className="size-4" />
                Pilih File
              </Button>
              <span className="text-sm text-muted-foreground truncate">
                {selectedFile ? selectedFile.name : 'Belum ada file dipilih'}
              </span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={onFileSelect}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => { onOpenChange(false) }}
          >
            Batal
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!selectedFile || importing}
          >
            {importing ? 'Mengimpor...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}