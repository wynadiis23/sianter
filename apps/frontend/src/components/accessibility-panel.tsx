import { Accessibility, Contrast, Type, ZoomIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useA11y, type TextSize } from '@/hooks/use-a11y'

const textSizes: { value: TextSize; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Besar' },
  { value: 'extra-large', label: 'Sangat Besar' },
]

export function AccessibilityPanel() {
  const {
    textSize,
    contrast,
    dyslexicFont,
    setTextSize,
    setContrast,
    setDyslexicFont,
  } = useA11y()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
          aria-label="Pengaturan aksesibilitas"
        >
          <Accessibility className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        role="dialog"
        aria-label="Panel aksesibilitas"
        className="sm:max-w-md"
      >
        <DialogTitle className="sr-only">Panel Aksesibilitas</DialogTitle>

        <div className="flex flex-col gap-6">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              Ukuran Teks
            </h3>
            <div
              role="group"
              aria-label="Pilih ukuran teks"
              className="flex gap-2"
            >
              {textSizes.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={textSize === value ? 'default' : 'outline'}
                  aria-pressed={textSize === value}
                  onClick={() => setTextSize(value)}
                  className="flex-1"
                >
                  {label}
                </Button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Contrast className="h-4 w-4 text-muted-foreground" />
              Kontras
            </h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="a11y-contrast">Kontras tinggi</Label>
              <Switch
                id="a11y-contrast"
                checked={contrast === 'high'}
                onCheckedChange={(checked) =>
                  setContrast(checked ? 'high' : 'normal')
                }
              />
            </div>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Type className="h-4 w-4 text-muted-foreground" />
              Font Ramah Disleksia
            </h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="a11y-dyslexic">
                Aktifkan font ramah disleksia
              </Label>
              <Switch
                id="a11y-dyslexic"
                checked={dyslexicFont}
                onCheckedChange={setDyslexicFont}
              />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
