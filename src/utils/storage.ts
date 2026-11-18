import type {
  AppSettings,
  DailyLog,
  GoalsState,
  Habit,
  JournalEntry,
  WeeklyReflection,
  WeightEntry,
} from '../types'

export const DATA_VERSION = 1

export const STORAGE_KEYS = {
  settings: 'reset_app_settings',
  habits: 'reset_habits',
  dailyLogs: 'reset_daily_logs',
  weightLogs: 'reset_weight_logs',
  goals: 'reset_goals',
  reflections: 'reset_weekly_reflections',
  journals: 'reset_journals',
} as const

export interface Envelope<T> {
  version: number
  data: T
}

export interface AppData {
  settings: AppSettings
  habits: Habit[]
  dailyLogs: Record<string, DailyLog>
  weightLogs: WeightEntry[]
  goals: GoalsState
  reflections: WeeklyReflection[]
  journals: JournalEntry[]
}

export function isEnvelope(value: unknown): value is Envelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    'data' in value
  )
}

export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (isEnvelope(parsed)) {
      return parsed.data as T
    }
    // Legacy raw values are accepted and upgraded on the next write.
    return parsed as T
  } catch {
    return fallback
  }
}

export function writeStored<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    const envelope: Envelope<T> = { version: DATA_VERSION, data }
    window.localStorage.setItem(key, JSON.stringify(envelope))
  } catch (error) {
    console.error(`Could not save ${key} to localStorage`, error)
  }
}

export function readEnvelope(raw: string | null): unknown {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return isEnvelope(parsed) ? parsed.data : parsed
  } catch {
    return null
  }
}

export function clearStoredData(): void {
  if (typeof window === 'undefined') return
  Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key))
}
