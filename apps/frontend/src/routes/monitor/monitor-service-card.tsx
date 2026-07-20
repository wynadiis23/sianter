interface TicketItem {
  kode: string | null
  nomorUrut: number | null
}

interface Dipanggil {
  kode: string | null
  nomorUrut: number | null
  status: string
  loketNama: string | null
}

interface MonitorServiceCardProps {
  nama: string
  warna?: string | null
  dipanggil: Dipanggil | null
  menunggu: TicketItem[]
  dilewati: TicketItem[]
  isAnimating: boolean
}

export function MonitorServiceCard({
  nama,
  warna,
  dipanggil,
  menunggu,
  dilewati,
  isAnimating,
}: MonitorServiceCardProps) {
  return (
    <div
      className={`flex flex-col rounded-lg border bg-card shadow-sm transition-[transform,box-shadow] duration-400 ease-on-screen ${isAnimating ? 'ring-2 ring-primary/30 scale-[1.02]' : ''}`}
      style={
        warna
          ? { borderTopColor: warna, borderTopWidth: 4 }
          : undefined
      }
    >
      <div className="px-5 py-3">
        <h2 className="font-wordmark text-base font-semibold text-card-foreground">
          {nama}
        </h2>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-6">
        {dipanggil ? (
          <>
            <p className="text-5xl font-bold font-mono tabular-nums text-primary drop-shadow-[0_0_6px_var(--color-primary)]">
              {dipanggil.kode}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dipanggil.loketNama
                ? `Loket ${dipanggil.loketNama}`
                : 'Sedang Dilayani'}
            </p>
          </>
        ) : (
          <p className="text-5xl font-bold font-mono tabular-nums text-muted-foreground/40">
            ---
          </p>
        )}
      </div>
      <div className="border-t px-5 py-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              MENUNGGU
            </p>
            {menunggu.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {menunggu.map((t) => (
                  <span
                    key={t.kode}
                    className={`rounded px-2 py-0.5 font-mono text-sm tabular-nums ${warna ? '' : 'bg-muted text-muted-foreground'}`}
                    style={
                      warna
                        ? { backgroundColor: `${warna}20`, color: warna }
                        : undefined
                    }
                  >
                    {t.kode}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/50">
                Tidak ada
              </p>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-destructive">
              DILEWATI
            </p>
            {dilewati.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dilewati.map((t) => (
                  <span
                    key={t.kode}
                    className="rounded px-2 py-0.5 font-mono text-sm tabular-nums bg-destructive/10 text-destructive"
                  >
                    {t.kode}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/50">
                Tidak ada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}