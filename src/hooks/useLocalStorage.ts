import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { readStored, writeStored } from '../utils/storage'

/**
 * A small localStorage-backed state hook. Values are written inside the
 * versioned envelope expected by the rest of the app, and updates from other
 * tabs are picked up automatically.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const initialRef = useRef(initialValue)
  const [value, setValue] = useState<T>(() => {
    const fallback =
      typeof initialRef.current === 'function'
        ? (initialRef.current as () => T)()
        : initialRef.current
    return readStored<T>(key, fallback)
  })
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    writeStored(key, value)
  }, [key, value])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return
      if (!event.newValue) {
        const fallback =
          typeof initialRef.current === 'function'
            ? (initialRef.current as () => T)()
            : initialRef.current
        valueRef.current = fallback
        setValue(fallback)
        return
      }
      try {
        const parsed: unknown = JSON.parse(event.newValue)
        const next =
          parsed !== null &&
          typeof parsed === 'object' &&
          'version' in parsed &&
          'data' in parsed
            ? (parsed as { data: T }).data
            : (parsed as T)
        valueRef.current = next
        setValue(next)
      } catch {
        // Ignore malformed values from other tabs.
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  const update = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      // Resolve and persist synchronously so a tap survives an immediate
      // reload, even before React has re-rendered.
      const resolved =
        typeof next === 'function' ? (next as (previous: T) => T)(valueRef.current) : next
      valueRef.current = resolved
      writeStored(key, resolved)
      setValue(resolved)
    },
    [key],
  )

  return [value, update]
}
