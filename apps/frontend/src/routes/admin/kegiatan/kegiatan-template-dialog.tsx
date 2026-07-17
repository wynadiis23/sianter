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

interface KegiatanTemplateDialogProps {
  open: boolean
  templateFile: File | null
  uploading: boolean
  onOpenChange: (open: boolean) => void
  onFileSelect: (file: File | null) => void
  onUpload: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function KegiatanTemplateDialog({
  open,
  templateFile,
  uploading,
  onOpenChange,
  onFileSelect,
  onUpload,
  inputRef,
}: KegiatanTemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onClick={() => inputRef.current?.click()}
              >
                <FileSpreadsheet className="size-4" />
                Pilih File
              </Button>
              <span className="text-sm text-muted-foreground truncate">
                {templateFile ? templateFile.name : 'Belum ada file dipilih'}
              </span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
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
            onClick={onUpload}
            disabled={!templateFile || uploading}
          >
            {uploading ? 'Mengupload...' : 'Simpan Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}