import { useEffect, useState } from 'react'
import { todayKey } from '../utils/dateUtils'

/** Keeps the app honest if it stays open across midnight. */
export function useToday(): string {
  const [today, setToday] = useState(todayKey)

  useEffect(() => {
    const tick = () => {
      const next = todayKey()
      setToday((current) => (current === next ? current : next))
    }
    const id = window.setInterval(tick, 30_000)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return today
}
