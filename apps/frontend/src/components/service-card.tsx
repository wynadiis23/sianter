import type { ReactNode } from 'react'

interface ServiceCardProps {
  prefix: string
  nama: string
  warna?: string | null
  deskripsi?: string | null
  gambar?: string | null
  onClick: () => void
  rightElement?: ReactNode
  variant?: 'grid' | 'list'
}

export function ServiceCard({
  prefix,
  nama,
  warna,
  deskripsi,
  gambar,
  onClick,
  rightElement,
  variant = 'grid',
}: ServiceCardProps) {
  if (variant === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
      >
        {gambar ? (
          <img
            src={gambar}
            alt=""
            className="size-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-lg text-xl font-bold"
            style={{
              backgroundColor: warna ? `${warna}15` : 'var(--color-primary)',
              color: warna ?? 'var(--color-primary)',
            }}
          >
            {prefix}
          </span>
        )}
        <div className="flex-1">
          <p className="font-medium text-foreground">{nama}</p>
          {deskripsi && (
            <p className="mt-0.5 text-sm text-muted-foreground">{deskripsi}</p>
          )}
        </div>
        {rightElement}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-45 flex-col items-center justify-center gap-2 rounded-xl border bg-card p-5 text-center shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.97] active:bg-primary active:border-primary active:text-primary-foreground ${warna ? 'border-t-4' : 'border-border'
        }`}
      style={
        warna
          ? ({
              backgroundColor: `${warna}15`,
              borderColor: `${warna}40`,
              borderTopColor: warna,
            } as React.CSSProperties)
          : undefined
      }
    >
      {gambar ? (
        <img src={gambar} alt="" className="size-16 rounded-lg object-cover" />
      ) : (
        <span className="kiosk-font-wordmark text-5xl leading-none text-inherit">
          {prefix}
        </span>
      )}
      <span className="font-body text-base font-medium text-inherit">
        {nama}
      </span>
    </button>
  )
}