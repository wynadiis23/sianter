import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <label
      data-slot="checkbox"
      className={cn(
        'inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-input shadow-xs outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-enter active:scale-[0.95] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        checked && 'border-primary bg-primary text-primary-foreground',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="sr-only"
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      {checked && <Check className="size-3" />}
    </label>
  )
}

export { Checkbox }
