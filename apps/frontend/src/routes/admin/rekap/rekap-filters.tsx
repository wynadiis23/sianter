import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

type Mode = 'tanggal' | 'bulan' | 'tahun'

interface LayananOption {
  id: string
  nama: string
  prefix: string
}

interface LoketOption {
  id: string
  nomor: number
  nama: string | null
}

const STATUS_LABEL: Record<string, string> = {
  reserved: 'Dipesan',
  waiting: 'Menunggu',
  called: 'Dipanggil',
  recalled: 'Dipanggil Ulang',
  skipped: 'Dilewati',
  finished: 'Selesai',
  expired: 'Kedaluwarsa',
}

interface RekapFiltersProps {
  mode: Mode
  onModeChange: (v: Mode) => void
  tanggal: string
  onTanggalChange: (v: string) => void
  bulan: string
  onBulanChange: (v: string) => void
  tahun: string
  onTahunChange: (v: string) => void
  layananId: string
  onLayananIdChange: (v: string) => void
  layananList: LayananOption[]
  loketId: string
  onLoketIdChange: (v: string) => void
  loketList: LoketOption[]
  status: string
  onStatusChange: (v: string) => void
  sumber: string
  onSumberChange: (v: string) => void
  onSearch: () => void
}

export function RekapFilters({
  mode,
  onModeChange,
  tanggal,
  onTanggalChange,
  bulan,
  onBulanChange,
  tahun,
  onTahunChange,
  layananId,
  onLayananIdChange,
  layananList,
  loketId,
  onLoketIdChange,
  loketList,
  status,
  onStatusChange,
  sumber,
  onSumberChange,
  onSearch,
}: RekapFiltersProps) {
  return (
    <div className="mt-6 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2.5">
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(v: Mode) => onModeChange(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tanggal">Tanggal</SelectItem>
              <SelectItem value="bulan">Bulan</SelectItem>
              <SelectItem value="tahun">Tahun</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label>
            {mode === 'tanggal' ? 'Tanggal' : mode === 'bulan' ? 'Bulan' : 'Tahun'}
          </Label>
          {mode === 'tanggal' && (
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => onTanggalChange(e.target.value)}
              className="w-44"
            />
          )}
          {mode === 'bulan' && (
            <Input
              type="month"
              value={bulan}
              onChange={(e) => onBulanChange(e.target.value)}
              className="w-44"
            />
          )}
          {mode === 'tahun' && (
            <Input
              type="number"
              value={tahun}
              onChange={(e) => onTahunChange(e.target.value)}
              className="w-32"
              min={2020}
              max={2099}
            />
          )}
        </div>

        <div className="space-y-2.5">
          <Label>Layanan</Label>
          <Select value={layananId} onValueChange={onLayananIdChange}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Semua layanan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua layanan</SelectItem>
              {layananList.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.nama} ({l.prefix})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label>Loket</Label>
          <Select value={loketId} onValueChange={onLoketIdChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semua loket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua loket</SelectItem>
              {loketList.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  Loket {l.nomor}{l.nama ? ` - ${l.nama}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua status</SelectItem>
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <SelectItem key={key} value={key.toUpperCase()}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <Label>Sumber</Label>
          <Select value={sumber} onValueChange={onSumberChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua</SelectItem>
              <SelectItem value="KIOS">Kios</SelectItem>
              <SelectItem value="ONLINE">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onSearch}>
          <Search className="size-4" />
          Cari
        </Button>
      </div>
    </div>
  )
}