import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface AktifSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  helperText: string
}

export function AktifSwitch({ checked, onCheckedChange, helperText }: AktifSwitchProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <Label htmlFor="aktif">Status Aktif</Label>
        <p className="text-sm text-muted-foreground">{helperText}</p>
      </div>
      <Switch
        id="aktif"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}