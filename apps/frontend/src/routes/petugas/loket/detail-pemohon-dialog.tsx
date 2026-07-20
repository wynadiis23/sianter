import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

interface DetailPemohonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: { nama: string; noHp: string } | null
}

export function DetailPemohonDialog({ open, onOpenChange, data }: DetailPemohonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detail Pemohon</DialogTitle>
          <DialogDescription>
            Informasi pemohon antrean
          </DialogDescription>
        </DialogHeader>
        {data && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama</p>
              <p className="text-base font-semibold">{data.nama}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                No. HP
              </p>
              <p className="text-base font-semibold">{data.noHp}</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}