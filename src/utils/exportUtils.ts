import type {
  AppSettings,
  DailyLog,
  DevOpsStatus,
  GoalsState,
  Habit,
  JournalEntry,
  MoodId,
  PrayerId,
  UdemyStageId,
  WeeklyReflection,
  WeightEntry,
  YouTubeStageId,
  YouTubeVideo,
} from '../types'
import {
  CATEGORIES,
  DEFAULT_GOALS,
  DEFAULT_HABITS,
  DEFAULT_SETTINGS,
  DEVOPS_STATUSES,
  DEVOPS_TOPICS,
  MOODS,
  PRAYER_IDS,
  PRODUCT_ITEMS,
  UDEMY_STAGES,
  YOUTUBE_STAGES,
} from '../data/defaults'
import type { AppData } from './storage'
import { DATA_VERSION } from './storage'
import { isValidDateKey, addDaysKey, todayKey } from './dateUtils'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number * 100) / 100))
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function sanitizeSettings(value: unknown): AppSettings {
  const raw = isRecord(value) ? value : {}
  const start = isValidDateKey(asString(raw.challengeStart))
    ? asString(raw.challengeStart)
    : DEFAULT_SETTINGS.challengeStart
  let end = isValidDateKey(asString(raw.challengeEnd))
    ? asString(raw.challengeEnd)
    : DEFAULT_SETTINGS.challengeEnd
  if (end <= start) end = addDaysKey(start, 58)
  return {
    challengeName: asString(raw.challengeName, DEFAULT_SETTINGS.challengeName).slice(0, 80),
    challengeStart: start,
    challengeEnd: end,
    startingWeight: asNumber(raw.startingWeight, DEFAULT_SETTINGS.startingWeight, 20, 400),
    targetWeight: asNumber(raw.targetWeight, DEFAULT_SETTINGS.targetWeight, 20, 400),
    stepTarget: asNumber(raw.stepTarget, DEFAULT_SETTINGS.stepTarget, 1000, 100000),
    waterTarget: asNumber(raw.waterTarget, DEFAULT_SETTINGS.waterTarget, 0.5, 20),
  }
}

function sanitizeHabits(value: unknown): Habit[] {
  if (!Array.isArray(value)) return DEFAULT_HABITS
  const seen = new Set<string>()
  const habits: Habit[] = []
  value.forEach((item, index) => {
    if (!isRecord(item)) return
    const id = asString(item.id).trim()
    const name = asString(item.name).trim()
    if (!id || !name || seen.has(id)) return
    seen.add(id)
    const category = CATEGORIES.some((c) => c.id === item.category)
      ? (item.category as Habit['category'])
      : 'discipline'
    const kind = item.kind === 'salah' ? 'salah' : 'checkbox'
    habits.push({
      id,
      name: name.slice(0, 80),
      description: asString(item.description).slice(0, 160) || undefined,
      category,
      enabled: asBool(item.enabled, true),
      kind,
      targetLabel: asString(item.targetLabel).slice(0, 40) || undefined,
      order: Number.isFinite(item.order) ? Number(item.order) : index,
      createdAt: asString(item.createdAt, new Date().toISOString()),
    })
  })
  return habits
}

function sanitizePrayers(value: unknown): PrayerId[] {
  if (!Array.isArray(value)) return []
  return PRAYER_IDS.filter((id) => value.includes(id))
}

function sanitizeLogs(value: unknown): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {}
  const items = Array.isArray(value)
    ? value
    : isRecord(value)
      ? Object.values(value)
      : []
  items.forEach((item) => {
    if (!isRecord(item)) return
    const date = asString(item.date)
    if (!isValidDateKey(date)) return
    const completedHabits = Array.isArray(item.completedHabits)
      ? Array.from(new Set(item.completedHabits.filter((id): id is string => typeof id === 'string')))
      : []
    logs[date] = {
      date,
      completedHabits,
      completedPrayers: sanitizePrayers(item.completedPrayers),
      notes: asString(item.notes).slice(0, 2000),
      updatedAt: asString(item.updatedAt, new Date().toISOString()),
    }
  })
  return logs
}

function sanitizeWeights(value: unknown): WeightEntry[] {
  if (!Array.isArray(value)) return []
  const byDate = new Map<string, WeightEntry>()
  value.forEach((item, index) => {
    if (!isRecord(item)) return
    const date = asString(item.date)
    if (!isValidDateKey(date)) return
    const weight = asNumber(item.weight, 0, 20, 400)
    if (weight <= 0) return
    byDate.set(date, {
      id: asString(item.id, `weight-${date}-${index}`),
      date,
      weight,
      createdAt: asString(item.createdAt, new Date().toISOString()),
    })
  })
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

function sanitizeGoals(value: unknown): GoalsState {
  const raw = isRecord(value) ? value : {}
  const udemyRaw = isRecord(raw.udemy) ? raw.udemy : {}
  const udemyStages = isRecord(udemyRaw.stages) ? udemyRaw.stages : {}
  const videosRaw = isRecord(raw.youtube) && Array.isArray(raw.youtube.videos) ? raw.youtube.videos : []
  const videos: YouTubeVideo[] = []
  videosRaw.forEach((item, index) => {
    if (!isRecord(item)) return
    const weekStart = asString(item.weekStart)
    if (!isValidDateKey(weekStart)) return
    const stagesRaw = isRecord(item.stages) ? item.stages : {}
    const stages = Object.fromEntries(
      YOUTUBE_STAGES.map((stage) => [stage.id, asBool(stagesRaw[stage.id])]),
    ) as Record<YouTubeStageId, boolean>
    videos.push({
      id: asString(item.id, `video-${weekStart}-${index}`),
      weekStart,
      title: asString(item.title, 'Untitled video').slice(0, 120),
      stages,
      createdAt: asString(item.createdAt, new Date().toISOString()),
    })
  })
  const devopsRaw = isRecord(raw.devops) ? raw.devops : {}
  const devops = Object.fromEntries(
    DEVOPS_TOPICS.map((topic) => {
      const status = devopsRaw[topic.id]
      const valid = DEVOPS_STATUSES.some((s) => s.id === status)
      return [topic.id, valid ? (status as DevOpsStatus) : 'not-started']
    }),
  )
  const productRaw = isRecord(raw.product) ? raw.product : {}
  const product = Object.fromEntries(
    PRODUCT_ITEMS.map((item) => [item.id, asBool(productRaw[item.id])]),
  )
  return {
    udemy: {
      title: asString(udemyRaw.title, DEFAULT_GOALS.udemy.title).slice(0, 120),
      stages: Object.fromEntries(
        UDEMY_STAGES.map((stage) => [stage.id, asBool(udemyStages[stage.id])]),
      ) as Record<UdemyStageId, boolean>,
    },
    youtube: { videos },
    devops,
    product,
  }
}

function sanitizeReflections(value: unknown): WeeklyReflection[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const reflections: WeeklyReflection[] = []
  value.forEach((item, index) => {
    if (!isRecord(item)) return
    const weekStart = asString(item.weekStart)
    if (!isValidDateKey(weekStart) || seen.has(weekStart)) return
    seen.add(weekStart)
    reflections.push({
      id: asString(item.id, `reflection-${weekStart}-${index}`),
      weekStart,
      wentWell: asString(item.wentWell).slice(0, 4000),
      distraction: asString(item.distraction).slice(0, 4000),
      learned: asString(item.learned).slice(0, 4000),
      improvement: asString(item.improvement).slice(0, 4000),
      nextFocus: asString(item.nextFocus).slice(0, 4000),
      createdAt: asString(item.createdAt, new Date().toISOString()),
      updatedAt: asString(item.updatedAt, new Date().toISOString()),
    })
  })
  return reflections.sort((a, b) => b.weekStart.localeCompare(a.weekStart))
}

function sanitizeJournals(value: unknown): JournalEntry[] {
  if (!Array.isArray(value)) return []
  const moods = MOODS.map((m) => m.id)
  return value
    .filter((item): item is UnknownRecord => isRecord(item))
    .flatMap((item, index): JournalEntry[] => {
      const date = asString(item.date)
      if (!isValidDateKey(date)) return []
      const mood = moods.includes(item.mood as MoodId) ? (item.mood as MoodId) : 'peaceful'
      return [
        {
          id: asString(item.id, `journal-${date}-${index}`),
          date,
          mood,
          happened: asString(item.happened).slice(0, 5000),
          feeling: asString(item.feeling).slice(0, 5000),
          facts: asString(item.facts).slice(0, 5000),
          assumptions: asString(item.assumptions).slice(0, 5000),
          control: asString(item.control).slice(0, 5000),
          action: asString(item.action).slice(0, 5000),
          createdAt: asString(item.createdAt, new Date().toISOString()),
        },
      ]
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function sanitizeAppData(value: unknown): AppData {
  if (!isRecord(value)) {
    throw new Error('This file does not contain a valid RESET backup.')
  }
  const knownKeys = ['settings', 'habits', 'dailyLogs', 'weightLogs', 'goals', 'reflections', 'journals']
  if (!knownKeys.some((key) => key in value)) {
    throw new Error('This file does not contain RESET data.')
  }
  return {
    settings: sanitizeSettings(value.settings),
    habits: sanitizeHabits(value.habits),
    dailyLogs: sanitizeLogs(value.dailyLogs),
    weightLogs: sanitizeWeights(value.weightLogs),
    goals: sanitizeGoals(value.goals),
    reflections: sanitizeReflections(value.reflections),
    journals: sanitizeJournals(value.journals),
  }
}

export interface BackupFile {
  app: 'RESET'
  schemaVersion: number
  exportedAt: string
  data: AppData
}

export function buildBackup(data: AppData): BackupFile {
  return {
    app: 'RESET',
    schemaVersion: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
}

export interface ParsedBackup {
  data: AppData
  exportedAt?: string
  app?: string
}

export function parseBackupFile(text: string): ParsedBackup {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (!isRecord(parsed)) {
    throw new Error('This file does not contain a RESET backup.')
  }
  const dataCandidate = 'data' in parsed ? parsed.data : parsed
  const data = sanitizeAppData(dataCandidate)
  return {
    data,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : undefined,
    app: typeof parsed.app === 'string' ? parsed.app : undefined,
  }
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function getBackupFilename(): string {
  return `reset-backup-${todayKey()}.json`
}

export function getBackupSummary(data: AppData) {
  return {
    daysLogged: Object.keys(data.dailyLogs).length,
    habits: data.habits.length,
    weights: data.weightLogs.length,
    reflections: data.reflections.length,
    journals: data.journals.length,
  }
}
