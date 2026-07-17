interface MonitorFooterProps {
  runningText: string | null
}

export function MonitorFooter({ runningText }: MonitorFooterProps) {
  return (
    <footer className="flex shrink-0 items-center overflow-hidden border-t border-border bg-card/80 px-4 py-3 shadow-sm">
      <div className="animate-marquee whitespace-nowrap text-sm text-muted-foreground">
        {runningText
          ? `${runningText} \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0 ${runningText}`
          : 'Selamat datang di Sistem Antrean'}
      </div>
    </footer>
  )
}