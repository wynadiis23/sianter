import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminPageHeaderProps {
  title: string
  description: string
  buttonLabel?: string
  onButtonClick?: () => void
  extraActions?: ReactNode
}

export function AdminPageHeader({
  title,
  description,
  buttonLabel = 'Tambah',
  onButtonClick,
  extraActions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {extraActions}
        {onButtonClick && (
          <Button onClick={onButtonClick}>
            <Plus className="size-4" />
            {buttonLabel}
          </Button>
        )}
      </div>
    </div>
  )
}