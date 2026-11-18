import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import type {
  AppSettings,
  CategoryId,
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
} from '../types'
import {
  DEFAULT_GOALS,
  DEFAULT_HABITS,
  DEFAULT_SETTINGS,
  PRAYER_IDS,
} from '../data/defaults'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useToday } from '../hooks/useToday'
import { STORAGE_KEYS, clearStoredData, writeStored, type AppData } from '../utils/storage'
import { countPrayers, emptyLog } from '../utils/analytics'
import { buildBackup, type BackupFile } from '../utils/exportUtils'
import { createId, slugify } from '../utils/id'

export interface HabitInput {
  name: string
  description?: string
  category: CategoryId
  targetLabel?: string
  enabled?: boolean
  kind?: Habit['kind']
}

export interface ReflectionInput {
  wentWell: string
  distraction: string
  learned: string
  improvement: string
  nextFocus: string
}

export interface JournalInput {
  date: string
  mood: MoodId
  happened: string
  feeling: string
  facts: string
  assumptions: string
  control: string
  action: string
}

interface AppStoreValue {
  settings: AppSettings
  habits: Habit[]
  dailyLogs: Record<string, DailyLog>
  weightLogs: WeightEntry[]
  goals: GoalsState
  reflections: WeeklyReflection[]
  journals: JournalEntry[]
  today: string
  toggleHabit: (date: string, habitId: string) => void
  togglePrayer: (date: string, prayerId: PrayerId) => void
  setAllPrayers: (date: string, value: boolean) => void
  setDailyNote: (date: string, notes: string) => void
  clearDay: (date: string) => void
  addHabit: (input: HabitInput) => void
  updateHabit: (id: string, input: HabitInput) => void
  deleteHabit: (id: string) => void
  addWeight: (date: string, weight: number) => void
  deleteWeight: (id: string) => void
  setUdemyStage: (stage: UdemyStageId, value: boolean) => void
  setUdemyTitle: (title: string) => void
  addYouTubeVideo: (title: string, weekStart: string) => string
  updateYouTubeVideo: (id: string, patch: { title?: string }) => void
  toggleYouTubeStage: (id: string, stage: YouTubeStageId) => void
  deleteYouTubeVideo: (id: string) => void
  setDevopsStatus: (topicId: string, status: DevOpsStatus) => void
  toggleProductItem: (itemId: string) => void
  saveReflection: (weekStart: string, input: ReflectionInput) => void
  deleteReflection: (id: string) => void
  addJournal: (input: JournalInput) => void
  deleteJournal: (id: string) => void
  updateSettings: (patch: Partial<AppSettings>) => void
  importData: (data: AppData) => void
  exportData: () => BackupFile
  resetAll: () => void
}

const AppStoreContext = createContext<AppStoreValue | null>(null)

function upsertLog(
  logs: Record<string, DailyLog>,
  date: string,
  updater: (log: DailyLog) => DailyLog,
): Record<string, DailyLog> {
  const current = logs[date] ?? emptyLog(date)
  const next = updater(current)
  return {
    ...logs,
    [date]: {
      ...next,
      date,
      updatedAt: new Date().toISOString(),
    },
  }
}

function uniqueHabitId(base: string, habits: Habit[]): string {
  const cleaned = slugify(base) || 'habit'
  if (!habits.some((habit) => habit.id === cleaned)) return cleaned
  let suffix = 2
  while (habits.some((habit) => habit.id === `${cleaned}-${suffix}`)) suffix += 1
  return `${cleaned}-${suffix}`
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
  )
  const [habits, setHabits] = useLocalStorage<Habit[]>(STORAGE_KEYS.habits, DEFAULT_HABITS)
  const [dailyLogs, setDailyLogs] = useLocalStorage<Record<string, DailyLog>>(
    STORAGE_KEYS.dailyLogs,
    {},
  )
  const [weightLogs, setWeightLogs] = useLocalStorage<WeightEntry[]>(
    STORAGE_KEYS.weightLogs,
    [],
  )
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.goals, DEFAULT_GOALS)
  const [reflections, setReflections] = useLocalStorage<WeeklyReflection[]>(
    STORAGE_KEYS.reflections,
    [],
  )
  const [journals, setJournals] = useLocalStorage<JournalEntry[]>(STORAGE_KEYS.journals, [])
  const today = useToday()

  const toggleHabit = useCallback(
    (date: string, habitId: string) => {
      const habit = habits.find((item) => item.id === habitId)
      if (!habit) return
      setDailyLogs((prev) =>
        upsertLog(prev, date, (log) => {
          if (habit.kind === 'salah') {
            const allDone = countPrayers(log) === PRAYER_IDS.length
            return {
              ...log,
              completedPrayers: allDone ? [] : [...PRAYER_IDS],
            }
          }
          const completed = new Set(log.completedHabits)
          if (completed.has(habitId)) completed.delete(habitId)
          else completed.add(habitId)
          return { ...log, completedHabits: Array.from(completed) }
        }),
      )
    },
    [habits, setDailyLogs],
  )

  const togglePrayer = useCallback(
    (date: string, prayerId: PrayerId) => {
      setDailyLogs((prev) =>
        upsertLog(prev, date, (log) => {
          const prayers = new Set(log.completedPrayers)
          if (prayers.has(prayerId)) prayers.delete(prayerId)
          else prayers.add(prayerId)
          return { ...log, completedPrayers: PRAYER_IDS.filter((id) => prayers.has(id)) }
        }),
      )
    },
    [setDailyLogs],
  )

  const setAllPrayers = useCallback(
    (date: string, value: boolean) => {
      setDailyLogs((prev) =>
        upsertLog(prev, date, (log) => ({
          ...log,
          completedPrayers: value ? [...PRAYER_IDS] : [],
        })),
      )
    },
    [setDailyLogs],
  )

  const setDailyNote = useCallback(
    (date: string, notes: string) => {
      setDailyLogs((prev) =>
        upsertLog(prev, date, (log) => ({ ...log, notes: notes.slice(0, 2000) })),
      )
    },
    [setDailyLogs],
  )

  const clearDay = useCallback(
    (date: string) => {
      setDailyLogs((prev) => {
        const next = { ...prev }
        delete next[date]
        return next
      })
    },
    [setDailyLogs],
  )

  const addHabit = useCallback(
    (input: HabitInput) => {
      setHabits((prev) => {
        const kind = input.kind === 'salah' && !prev.some((h) => h.kind === 'salah') ? 'salah' : 'checkbox'
        const habit: Habit = {
          id: uniqueHabitId(input.name, prev),
          name: input.name.trim().slice(0, 80),
          description: input.description?.trim().slice(0, 160) || undefined,
          category: input.category,
          enabled: input.enabled ?? true,
          kind,
          targetLabel: input.targetLabel?.trim().slice(0, 40) || undefined,
          order: prev.length === 0 ? 0 : Math.max(...prev.map((h) => h.order)) + 1,
          createdAt: new Date().toISOString(),
        }
        return [...prev, habit]
      })
    },
    [setHabits],
  )

  const updateHabit = useCallback(
    (id: string, input: HabitInput) => {
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === id
            ? {
                ...habit,
                name: input.name.trim().slice(0, 80),
                description: input.description?.trim().slice(0, 160) || undefined,
                category: input.category,
                enabled: input.enabled ?? habit.enabled,
                targetLabel: input.targetLabel?.trim().slice(0, 40) || undefined,
              }
            : habit,
        ),
      )
    },
    [setHabits],
  )

  const deleteHabit = useCallback(
    (id: string) => {
      const deletedHabit = habits.find((habit) => habit.id === id)
      setHabits((prev) => prev.filter((habit) => habit.id !== id))
      setDailyLogs((prev) => {
        const next: Record<string, DailyLog> = {}
        Object.entries(prev).forEach(([date, log]) => {
          next[date] = {
            ...log,
            completedHabits: log.completedHabits.filter((habitId) => habitId !== id),
            completedPrayers:
              deletedHabit?.kind === 'salah' ? [] : log.completedPrayers,
          }
        })
        return next
      })
    },
    [habits, setDailyLogs, setHabits],
  )

  const addWeight = useCallback(
    (date: string, weight: number) => {
      setWeightLogs((prev) => {
        const existing = prev.find((entry) => entry.date === date)
        const entry: WeightEntry = {
          id: existing?.id ?? createId('weight'),
          date,
          weight: Math.round(weight * 10) / 10,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
        }
        return [...prev.filter((item) => item.date !== date), entry].sort((a, b) =>
          a.date.localeCompare(b.date),
        )
      })
    },
    [setWeightLogs],
  )

  const deleteWeight = useCallback(
    (id: string) => {
      setWeightLogs((prev) => prev.filter((entry) => entry.id !== id))
    },
    [setWeightLogs],
  )

  const setUdemyStage = useCallback(
    (stage: UdemyStageId, value: boolean) => {
      setGoals((prev) => ({
        ...prev,
        udemy: { ...prev.udemy, stages: { ...prev.udemy.stages, [stage]: value } },
      }))
    },
    [setGoals],
  )

  const setUdemyTitle = useCallback(
    (title: string) => {
      setGoals((prev) => ({
        ...prev,
        udemy: { ...prev.udemy, title: title.slice(0, 120) },
      }))
    },
    [setGoals],
  )

  const addYouTubeVideo = useCallback(
    (title: string, weekStart: string) => {
      const id = createId('video')
      setGoals((prev) => ({
        ...prev,
        youtube: {
          videos: [
            ...prev.youtube.videos,
            {
              id,
              weekStart,
              title: title.trim().slice(0, 120) || 'Untitled video',
              stages: {
                idea: false,
                script: false,
                recording: false,
                editing: false,
                thumbnail: false,
                published: false,
              },
              createdAt: new Date().toISOString(),
            },
          ],
        },
      }))
      return id
    },
    [setGoals],
  )

  const updateYouTubeVideo = useCallback(
    (id: string, patch: { title?: string }) => {
      setGoals((prev) => ({
        ...prev,
        youtube: {
          videos: prev.youtube.videos.map((video) =>
            video.id === id
              ? {
                  ...video,
                  ...(patch.title !== undefined
                    ? { title: patch.title.slice(0, 120) }
                    : {}),
                }
              : video,
          ),
        },
      }))
    },
    [setGoals],
  )

  const toggleYouTubeStage = useCallback(
    (id: string, stage: YouTubeStageId) => {
      setGoals((prev) => ({
        ...prev,
        youtube: {
          videos: prev.youtube.videos.map((video) =>
            video.id === id
              ? {
                  ...video,
                  stages: { ...video.stages, [stage]: !video.stages[stage] },
                }
              : video,
          ),
        },
      }))
    },
    [setGoals],
  )

  const deleteYouTubeVideo = useCallback(
    (id: string) => {
      setGoals((prev) => ({
        ...prev,
        youtube: {
          videos: prev.youtube.videos.filter((video) => video.id !== id),
        },
      }))
    },
    [setGoals],
  )

  const setDevopsStatus = useCallback(
    (topicId: string, status: DevOpsStatus) => {
      setGoals((prev) => ({
        ...prev,
        devops: { ...prev.devops, [topicId]: status },
      }))
    },
    [setGoals],
  )

  const toggleProductItem = useCallback(
    (itemId: string) => {
      setGoals((prev) => ({
        ...prev,
        product: { ...prev.product, [itemId]: !prev.product[itemId] },
      }))
    },
    [setGoals],
  )

  const saveReflection = useCallback(
    (weekStart: string, input: ReflectionInput) => {
      setReflections((prev) => {
        const existing = prev.find((item) => item.weekStart === weekStart)
        const now = new Date().toISOString()
        const entry: WeeklyReflection = {
          id: existing?.id ?? createId('reflection'),
          weekStart,
          ...input,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        }
        return [entry, ...prev.filter((item) => item.id !== entry.id)].sort((a, b) =>
          b.weekStart.localeCompare(a.weekStart),
        )
      })
    },
    [setReflections],
  )

  const deleteReflection = useCallback(
    (id: string) => {
      setReflections((prev) => prev.filter((item) => item.id !== id))
    },
    [setReflections],
  )

  const addJournal = useCallback(
    (input: JournalInput) => {
      setJournals((prev) => [
        ...prev,
        {
          ...input,
          id: createId('journal'),
          createdAt: new Date().toISOString(),
        },
      ])
    },
    [setJournals],
  )

  const deleteJournal = useCallback(
    (id: string) => {
      setJournals((prev) => prev.filter((entry) => entry.id !== id))
    },
    [setJournals],
  )

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }))
      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id === 'steps' && patch.stepTarget !== undefined) {
            return {
              ...habit,
              targetLabel: `${patch.stepTarget.toLocaleString('en-US')} steps`,
            }
          }
          if (habit.id === 'water' && patch.waterTarget !== undefined) {
            return { ...habit, targetLabel: `${patch.waterTarget} L` }
          }
          return habit
        }),
      )
    },
    [setHabits, setSettings],
  )

  const importData = useCallback(
    (data: AppData) => {
      setSettings(data.settings)
      setHabits(data.habits)
      setDailyLogs(data.dailyLogs)
      setWeightLogs(data.weightLogs)
      setGoals(data.goals)
      setReflections(data.reflections)
      setJournals(data.journals)
    },
    [setDailyLogs, setGoals, setHabits, setJournals, setReflections, setSettings, setWeightLogs],
  )

  const exportData = useCallback((): BackupFile => {
    return buildBackup({
      settings,
      habits,
      dailyLogs,
      weightLogs,
      goals,
      reflections,
      journals,
    })
  }, [dailyLogs, goals, habits, journals, reflections, settings, weightLogs])

  const resetAll = useCallback(() => {
    clearStoredData()
    writeStored(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
    writeStored(STORAGE_KEYS.habits, DEFAULT_HABITS)
    writeStored(STORAGE_KEYS.dailyLogs, {})
    writeStored(STORAGE_KEYS.weightLogs, [])
    writeStored(STORAGE_KEYS.goals, DEFAULT_GOALS)
    writeStored(STORAGE_KEYS.reflections, [])
    writeStored(STORAGE_KEYS.journals, [])
    setSettings(DEFAULT_SETTINGS)
    setHabits(DEFAULT_HABITS)
    setDailyLogs({})
    setWeightLogs([])
    setGoals(DEFAULT_GOALS)
    setReflections([])
    setJournals([])
  }, [
    setDailyLogs,
    setGoals,
    setHabits,
    setJournals,
    setReflections,
    setSettings,
    setWeightLogs,
  ])

  const value = useMemo<AppStoreValue>(
    () => ({
      settings,
      habits,
      dailyLogs,
      weightLogs,
      goals,
      reflections,
      journals,
      today,
      toggleHabit,
      togglePrayer,
      setAllPrayers,
      setDailyNote,
      clearDay,
      addHabit,
      updateHabit,
      deleteHabit,
      addWeight,
      deleteWeight,
      setUdemyStage,
      setUdemyTitle,
      addYouTubeVideo,
      updateYouTubeVideo,
      toggleYouTubeStage,
      deleteYouTubeVideo,
      setDevopsStatus,
      toggleProductItem,
      saveReflection,
      deleteReflection,
      addJournal,
      deleteJournal,
      updateSettings,
      importData,
      exportData,
      resetAll,
    }),
    [
      addHabit,
      addJournal,
      addWeight,
      addYouTubeVideo,
      clearDay,
      dailyLogs,
      deleteHabit,
      deleteJournal,
      deleteReflection,
      deleteWeight,
      deleteYouTubeVideo,
      exportData,
      goals,
      habits,
      importData,
      journals,
      reflections,
      resetAll,
      saveReflection,
      setAllPrayers,
      setDailyNote,
      setDevopsStatus,
      setUdemyStage,
      setUdemyTitle,
      settings,
      toggleHabit,
      togglePrayer,
      toggleProductItem,
      toggleYouTubeStage,
      updateHabit,
      updateSettings,
      updateYouTubeVideo,
      weightLogs,
      today,
    ],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useApp(): AppStoreValue {
  const context = useContext(AppStoreContext)
  if (!context) throw new Error('useApp must be used inside AppStoreProvider')
  return context
}
