import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { onLog, type LogEntry } from '@/lib/thermal-printer'

interface BluetoothLogProps {
  maxHeight?: string
  className?: string
}

const LEVEL_CLASS: Record<LogEntry['level'], string> = {
  info: 'text-slate-300',
  warn: 'text-amber-400',
  error: 'text-red-400',
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour12: false })
}

export function BluetoothLog({ maxHeight = '160px', className }: BluetoothLogProps) {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return onLog((entry) => {
      setEntries((prev) => [...prev, entry])
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [entries])

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      className={cn(
        'rounded-md bg-slate-900 p-3 font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap',
        className,
      )}
      style={{ maxHeight }}
    >
      {entries.length === 0 ? (
        <span className="text-slate-500">Sistem siap...</span>
      ) : (
        entries.map((entry, i) => (
          <div key={i} className={LEVEL_CLASS[entry.level]}>
            <span className="text-slate-500">[{formatTime(entry.timestamp)}]</span> {entry.message}
          </div>
        ))
      )}
    </div>
  )
}
