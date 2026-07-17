import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface IdentityFormProps {
  nama: string
  noHp: string
  onNamaChange: (value: string) => void
  onNoHpChange: (value: string) => void
  error: string | null
  onSubmit: () => void
  onBack: () => void
  submitLabel?: string
}

export function IdentityForm({
  nama,
  noHp,
  onNamaChange,
  onNoHpChange,
  error,
  onSubmit,
  onBack,
  submitLabel = 'Lanjut',
}: IdentityFormProps) {
  const id = useId()

  return (
    <div className="w-full max-w-sm">
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor={`${id}-nama`} className="font-body text-sm font-medium text-foreground">
            Nama Lengkap <span className="text-destructive">*</span>
          </label>
          <Input
            id={`${id}-nama`}
            value={nama}
            onChange={(e) => onNamaChange(e.target.value)}
            placeholder="Nama sesuai KTP"
            className="h-13"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-nohp`} className="font-body text-sm font-medium text-foreground">
            Nomor HP <span className="text-destructive">*</span>
          </label>
          <Input
            id={`${id}-nohp`}
            type="tel"
            inputMode="tel"
            value={noHp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '')
              onNoHpChange(val)
            }}
            placeholder="08xxxxxxxxxx"
            maxLength={15}
            className="h-13"
          />
        </div>
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3">
            <p className="font-body text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <Button
          onClick={onSubmit}
          disabled={!nama.trim() || !noHp.trim()}
          className="h-14 w-full text-lg font-body"
        >
          {submitLabel}
        </Button>
        <Button
          onClick={onBack}
          variant="ghost"
          className="h-14 w-full text-base font-normal"
        >
          Kembali
        </Button>
      </div>
    </div>
  )
}