import { useState, useEffect } from 'react'
import { wita } from '@/lib/dayjs'

export function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const time = wita(now).format('HH:mm:ss')
  const date = wita(now).format('dddd, D MMMM YYYY')

  return { time, date }
}