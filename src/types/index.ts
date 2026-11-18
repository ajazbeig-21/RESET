export type CategoryId = 'deen' | 'fitness' | 'career' | 'creator' | 'discipline'

export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export type HabitKind = 'checkbox' | 'salah'

export interface Habit {
  id: string
  name: string
  description?: string
  category: CategoryId
  enabled: boolean
  kind: HabitKind
  /** A short label shown under the habit, e.g. "8,000 steps". */
  targetLabel?: string
  order: number
  createdAt: string
}

export interface DailyLog {
  date: string
  completedHabits: string[]
  completedPrayers: PrayerId[]
  notes: string
  updatedAt: string
}

export interface WeightEntry {
  id: string
  date: string
  weight: number
  createdAt: string
}

export interface AppSettings {
  challengeName: string
  challengeStart: string
  challengeEnd: string
  startingWeight: number
  targetWeight: number
  stepTarget: number
  waterTarget: number
}

export type UdemyStageId =
  | 'planning'
  | 'outline'
  | 'recording'
  | 'editing'
  | 'uploading'
  | 'published'

export interface UdemyGoal {
  title: string
  stages: Record<UdemyStageId, boolean>
}

export type YouTubeStageId =
  | 'idea'
  | 'script'
  | 'recording'
  | 'editing'
  | 'thumbnail'
  | 'published'

export type YouTubeStages = Record<YouTubeStageId, boolean>

export interface YouTubeVideo {
  id: string
  weekStart: string
  title: string
  stages: YouTubeStages
  createdAt: string
}

export type DevOpsStatus = 'not-started' | 'learning' | 'practiced' | 'interview-ready'

export type ProductItemId =
  | 'linux'
  | 'aws'
  | 'docker'
  | 'jenkins'
  | 'kubernetes'
  | 'terraform'
  | 'monitoring'
  | 'scenarios'
  | 'formatting'
  | 'launch'

export interface GoalsState {
  udemy: UdemyGoal
  youtube: {
    videos: YouTubeVideo[]
  }
  devops: Record<string, DevOpsStatus>
  product: Record<string, boolean>
}

export interface WeeklyReflection {
  id: string
  weekStart: string
  wentWell: string
  distraction: string
  learned: string
  improvement: string
  nextFocus: string
  createdAt: string
  updatedAt: string
}

export type MoodId = 'peaceful' | 'happy' | 'focused' | 'anxious' | 'sad' | 'angry' | 'exhausted'

export interface JournalEntry {
  id: string
  date: string
  mood: MoodId
  happened: string
  feeling: string
  facts: string
  assumptions: string
  control: string
  action: string
  createdAt: string
}

export interface Quote {
  text: string
  source?: string
}

export interface CategoryMeta {
  id: CategoryId
  label: string
  color: string
}

export interface HabitCompletion {
  completed: number
  total: number
  percent: number
  prayerCount: number
}

export interface WeekSummary {
  weekStart: string
  weekEnd: string
  daysElapsed: number
  totalHabits: number
  completedHabits: number
  completionRate: number
  salahCompleted: number
  salahExpected: number
  salahConsistency: number
  gymSessions: number
  studySessions: number
  contentSessions: number
  perfectDays: number
  categoryStats: Array<{
    id: CategoryId
    label: string
    color: string
    completed: number
    total: number
    percent: number
  }>
  days: Array<{
    date: string
    label: string
    percent: number
    completed: number
    total: number
    isFuture: boolean
    isOutside: boolean
    isToday: boolean
  }>
  bestDay: { date: string; label: string; percent: number } | null
  previousWeekRate: number | null
}

export interface ChallengeStats {
  totalDays: number
  currentDay: number
  isBeforeStart: boolean
  isComplete: boolean
  daysElapsed: number
  daysRemaining: number
  timeProgress: number
  overallCompletion: number
  currentStreak: number
  bestStreak: number
  activeDays: number
  perfectDays: number
  totalWorkouts: number
  totalStudySessions: number
  totalYoutubeSessions: number
  totalUdemySessions: number
  totalPrayers: number
}
