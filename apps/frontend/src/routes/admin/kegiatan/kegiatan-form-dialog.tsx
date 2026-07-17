import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface KegiatanForm {
  tanggalWaktu: string
  namaKegiatan: string
  metodeRapat: string
  penyelenggara: string
  nomorSurat: string
  keterangan: string
}

interface KegiatanFormDialogProps {
  open: boolean
  editing: boolean
  form: KegiatanForm
  saving: boolean
  onOpenChange: (open: boolean) => void
  onFormChange: (form: KegiatanForm) => void
  onSave: (e: React.FormEvent) => void
}

export function KegiatanFormDialog({
  open,
  editing,
  form,
  saving,
  onOpenChange,
  onFormChange,
  onSave,
}: KegiatanFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        <form onSubmit={onSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tanggalWaktu">Hari/Tanggal/Waktu</Label>
            <Input
              id="tanggalWaktu"
              value={form.tanggalWaktu}
              onChange={(e) =>
                onFormChange({ ...form, tanggalWaktu: e.target.value })
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
                onFormChange({ ...form, namaKegiatan: e.target.value })
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
                  onFormChange({ ...form, metodeRapat: e.target.value })
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
                  onFormChange({ ...form, penyelenggara: e.target.value })
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
                onFormChange({ ...form, nomorSurat: e.target.value })
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
                onFormChange({ ...form, keterangan: e.target.value })
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
              onClick={() => onOpenChange(false)}
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
  )
}