import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { server } from '@/lib/eden'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Building2, Ticket } from 'lucide-react'

interface AvailableLoket {
  id: string
  nomor: number
  nama: string | null
}

interface LayananItem {
  id: string
  nama: string
  prefix: string
}

export function PilihLoketPage() {
  const navigate = useNavigate()
  const [lokets, setLokets] = useState<AvailableLoket[]>([])
  const [loading, setLoading] = useState(true)
  const [layananLoading, setLayananLoading] = useState(false)
  const [selectedLoketId, setSelectedLoketId] = useState<string | null>(null)
  const [layananList, setLayananList] = useState<LayananItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await server.api.loket.get()
      if (error) {
        toast.error('Gagal memuat data loket')
      } else {
        setLokets(data ?? [])
      }
      setLoading(false)
    }
    fetch()
  }, [])

  const selectedLoket = lokets.find((l) => l.id === selectedLoketId)

  const handleLoketChange = async (id: string) => {
    setSelectedLoketId(id)
    setLayananList([])
    setLayananLoading(true)
    const { data, error } = await server.api.loket({ id }).layanan.get()
    setLayananLoading(false)
    if (error) {
      toast.error('Gagal memuat layanan')
    } else {
      setLayananList(data ?? [])
    }
  }

  const handleMulai = () => {
    if (!selectedLoketId || layananList.length === 0) {
      toast.error('Pilih loket yang memiliki layanan')
      return
    }

    setSaving(true)
    localStorage.setItem(
      'petugasSession',
      JSON.stringify({
        loketId: selectedLoketId,
        nomorLoket: selectedLoket?.nomor,
        layanan: layananList.map((l) => ({
          id: l.id,
          nama: l.nama,
          prefix: l.prefix,
        })),
      }),
    )
    navigate('/petugas/dashboard', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pilih Loket</h1>
          <p className="text-sm text-muted-foreground">
            Pilih loket dan layanan yang akan ditangani
          </p>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">Loket Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedLoketId ?? ''}
            onValueChange={handleLoketChange}
          >
            {lokets.map((loket) => (
              <div key={loket.id}>
                <label
                  htmlFor={`loket-${loket.id}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem
                    value={loket.id}
                    id={`loket-${loket.id}`}
                  />
                  <div>
                    <p className="font-medium">
                      Loket {loket.nomor}
                      {loket.nama ? ` — ${loket.nama}` : ''}
                    </p>
                  </div>
                </label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {selectedLoket && (
        <Card className="mt-4 w-full">
          <CardHeader>
            <CardTitle className="text-base">
              Layanan — Loket {selectedLoket.nomor}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {layananLoading ? (
              <div className="flex justify-center py-4">
                <Spinner className="size-6" />
              </div>
            ) : layananList.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Loket ini belum memiliki layanan
              </p>
            ) : (
              layananList.map((layanan) => (
                <div
                  key={layanan.id}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <Ticket className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{layanan.nama}</span>
                    <span className="text-xs text-muted-foreground">
                      ({layanan.prefix})
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      <Button
        className="mt-6 w-full"
        size="lg"
        disabled={!selectedLoketId || layananList.length === 0 || saving}
        onClick={handleMulai}
      >
        {saving ? 'Memproses...' : 'Mulai Bertugas'}
      </Button>
    </div>
  )
}
