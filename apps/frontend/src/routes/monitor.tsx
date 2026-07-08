import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MonitorPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 gap-4 p-4">
        <Card className="flex-1 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Nomor Antrean Aktif</CardTitle>
            <p className="text-sm text-primary-foreground/70">Per loket</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <p>Menunggu data antrean aktif...</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="flex-1 border-dashed">
          <CardContent className="p-0">
            <AspectRatio ratio={16 / 9} className="flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Media / Video YouTube</p>
            </AspectRatio>
          </CardContent>
        </Card>
      </div>
      <Separator />
      <footer className="flex h-16 items-center bg-primary px-4 text-primary-foreground">
        <p className="text-sm">Running Text: pengumuman akan tampil di sini</p>
      </footer>
    </div>
  )
}
