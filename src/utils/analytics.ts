import type {
  AppSettings,
  CategoryId,
  DailyLog,
  Habit,
  HabitCompletion,
  WeekSummary,
  WeightEntry,
} from '../types'
import {
  CATEGORIES,
  PRAYER_IDS,
} from '../data/defaults'
import {
  addDaysKey,
  diffDaysKey,
  formatShortDate,
  formatWeekday,
  getTotalDays,
  getWeekDays,
  getWeekStart,
  todayKey,
} from './dateUtils'

export const STREAK_THRESHOLD = 50

export function getEnabledHabits(habits: Habit[]): Habit[] {
  return habits.filter((h) => h.enabled).sort((a, b) => a.order - b.order)
}

export function getSalahHabit(habits: Habit[]): Habit | undefined {
  return habits.find((h) => h.kind === 'salah')
}

export function countPrayers(log?: DailyLog): number {
  if (!log) return 0
  return PRAYER_IDS.filter((id) => log.completedPrayers.includes(id)).length
}

export function isSalahComplete(log?: DailyLog): boolean {
  return countPrayers(log) === PRAYER_IDS.length
}

export function isHabitComplete(habit: Habit, log?: DailyLog): boolean {
  if (!log) return false
  if (habit.kind === 'salah') return isSalahComplete(log)
  return log.completedHabits.includes(habit.id)
}

export function getCompletion(log: DailyLog | undefined, habits: Habit[]): HabitCompletion {
  const enabled = getEnabledHabits(habits)
  const total = enabled.length
  const completed = enabled.filter((habit) => isHabitComplete(habit, log)).length
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    prayerCount: countPrayers(log),
  }
}

export function emptyLog(date: string): DailyLog {
  return {
    date,
    completedHabits: [],
    completedPrayers: [],
    notes: '',
    updatedAt: new Date().toISOString(),
  }
}

export function ensureLog(logs: Record<string, DailyLog>, date: string): DailyLog {
  return logs[date] ?? emptyLog(date)
}

function completionForDate(logs: Record<string, DailyLog>, habits: Habit[], date: string) {
  return getCompletion(logs[date], habits)
}

function countDaysWithAny(
  ids: string[],
  dates: string[],
  logs: Record<string, DailyLog>,
): number {
  return dates.filter((date) => {
    const log = logs[date]
    return log ? ids.some((id) => log.completedHabits.includes(id)) : false
  }).length
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function getWeekRate(
  weekStart: string,
  habits: Habit[],
  logs: Record<string, DailyLog>,
  today = todayKey(),
  challengeStart?: string,
): number {
  const enabled = getEnabledHabits(habits)
  const weekEnd = addDaysKey(weekStart, 6)
  const rangeStart = challengeStart && challengeStart > weekStart ? challengeStart : weekStart
  const lastRelevant = weekEnd > today ? today : weekEnd
  if (lastRelevant < rangeStart || enabled.length === 0) return 0
  const days = getWeekDays(weekStart).filter(
    (date) => date >= rangeStart && date <= lastRelevant,
  )
  if (days.length === 0) return 0
  const completed = days.reduce((sum, date) => sum + getCompletion(logs[date], habits).completed, 0)
  return clampPercent((completed / (enabled.length * days.length)) * 100)
}

export function buildWeekSummary(
  weekStart: string,
  habits: Habit[],
  logs: Record<string, DailyLog>,
  today = todayKey(),
  challengeStart?: string,
): WeekSummary {
  const enabled = getEnabledHabits(habits)
  const weekEnd = addDaysKey(weekStart, 6)
  const days = getWeekDays(weekStart)
  const rangeStart = challengeStart && challengeStart > weekStart ? challengeStart : weekStart
  const lastRelevant = weekEnd > today ? today : weekEnd
  const daysElapsed =
    lastRelevant < rangeStart ? 0 : diffDaysKey(lastRelevant, rangeStart) + 1

  const dayData = days.map((date) => {
    const completion = completionForDate(logs, habits, date)
    const isFuture = date > today
    return {
      date,
      label: formatWeekday(date).slice(0, 3),
      percent: isFuture ? 0 : completion.percent,
      completed: isFuture ? 0 : completion.completed,
      total: completion.total,
      isFuture,
      isOutside: Boolean(challengeStart && date < challengeStart),
      isToday: date === today,
    }
  })

  const relevantDays = days.filter(
    (date) => date >= rangeStart && date <= lastRelevant,
  )
  const completedHabits = relevantDays.reduce(
    (sum, date) => sum + getCompletion(logs[date], habits).completed,
    0,
  )
  const totalHabits = enabled.length * daysElapsed
  const completionRate = totalHabits === 0 ? 0 : clampPercent((completedHabits / totalHabits) * 100)

  const prayersInWeek = relevantDays.reduce((sum, date) => sum + countPrayers(logs[date]), 0)
  const salahExpected = daysElapsed * 5
  const salahCompleted = Math.min(prayersInWeek, salahExpected)
  const salahConsistency =
    salahExpected === 0 ? 0 : clampPercent((salahCompleted / salahExpected) * 100)

  const categoryStats = CATEGORIES.map((category) => {
    const catHabits = enabled.filter((h) => h.category === category.id)
    const completed = relevantDays.reduce(
      (sum, date) =>
        sum +
        catHabits.filter((habit) => isHabitComplete(habit, logs[date])).length,
      0,
    )
    const total = catHabits.length * daysElapsed
    return {
      id: category.id,
      label: category.label,
      color: category.color,
      completed,
      total,
      percent: total === 0 ? 0 : clampPercent((completed / total) * 100),
    }
  })

  const daysWithPercent = dayData.filter(
    (day) => !day.isFuture && day.date >= rangeStart,
  )
  const best = daysWithPercent.reduce<null | (typeof daysWithPercent)[number]>(
    (bestDay, day) => (bestDay === null || day.percent > bestDay.percent ? day : bestDay),
    null,
  )

  const gymSessions = countDaysWithAny(['gym'], relevantDays, logs)
  const studySessions = countDaysWithAny(
    ['devops-interview', 'focused-study'],
    relevantDays,
    logs,
  )
  const contentSessions = countDaysWithAny(
    ['udemy', 'youtube', 'digital-product'],
    relevantDays,
    logs,
  )
  const perfectDays = relevantDays.filter((date) => {
    const completion = getCompletion(logs[date], habits)
    return completion.total > 0 && completion.completed === completion.total
  }).length

  const previousWeekStart = addDaysKey(weekStart, -7)
  const previousWeekRate = getWeekRate(
    previousWeekStart,
    habits,
    logs,
    today,
    challengeStart,
  )

  return {
    weekStart,
    weekEnd,
    daysElapsed,
    totalHabits,
    completedHabits,
    completionRate,
    salahCompleted,
    salahExpected,
    salahConsistency,
    gymSessions,
    studySessions,
    contentSessions,
    perfectDays,
    categoryStats,
    days: dayData,
    bestDay:
      best && best.percent > 0
        ? {
            date: best.date,
            label: formatWeekday(best.date),
            percent: best.percent,
          }
        : null,
    previousWeekRate,
  }
}

export function buildInsights(summary: WeekSummary): string[] {
  const insights: string[] = []
  if (summary.daysElapsed === 0) {
    return ['This week has not started yet. A fresh page is waiting for you.']
  }

  const activeDays = summary.days.filter((d) => !d.isFuture && d.completed > 0).length
  if (activeDays === 0) {
    return [
      'No habits logged this week yet. One checked box is enough to begin.',
      'Momentum starts with a single, honest day.',
    ]
  }

  const ranked = [...summary.categoryStats]
    .filter((category) => category.total > 0)
    .sort((a, b) => b.percent - a.percent)

  const strongest = ranked[0]
  if (strongest && strongest.percent > 0) {
    insights.push(
      `You were most consistent with ${strongest.label} this week at ${strongest.percent}%.`,
    )
  }

  if (summary.gymSessions > 0) {
    insights.push(
      `You completed ${summary.gymSessions} gym session${summary.gymSessions === 1 ? '' : 's'} this week.`,
    )
  }

  if (summary.previousWeekRate !== null && summary.previousWeekRate > 0) {
    const diff = summary.completionRate - summary.previousWeekRate
    if (diff >= 5) {
      insights.push(`Your productivity improved by ${diff}% compared with last week.`)
    } else if (diff <= -5) {
      insights.push(`Your productivity dropped by ${Math.abs(diff)}% compared with last week.`)
    } else {
      insights.push('Your consistency held steady compared with last week.')
    }
  }

  const weakest = ranked[ranked.length - 1]
  if (weakest && weakest.percent < 70 && ranked.length > 1) {
    insights.push(
      `${weakest.label} was your weakest category at ${weakest.percent}%. Small attention there goes a long way.`,
    )
  }

  if (summary.bestDay) {
    insights.push(
      `Your best day was ${summary.bestDay.label} at ${summary.bestDay.percent}% completion.`,
    )
  }

  if (summary.salahConsistency >= 80) {
    insights.push(`Salah consistency was ${summary.salahConsistency}%. Protect that first.`)
  } else if (summary.salahConsistency > 0) {
    insights.push(`You tracked ${summary.salahCompleted} of ${summary.salahExpected} prayers this week.`)
  }

  if (summary.perfectDays > 0) {
    insights.push(
      `${summary.perfectDays} perfect day${summary.perfectDays === 1 ? '' : 's'} this week. That is the standard.`,
    )
  }

  return insights.slice(0, 4)
}

export interface StreakResult {
  current: number
  best: number
}

export function calculateStreaks(
  settings: AppSettings,
  habits: Habit[],
  logs: Record<string, DailyLog>,
  today = todayKey(),
): StreakResult {
  const total = getTotalDays(settings)
  if (today < settings.challengeStart) return { current: 0, best: 0 }

  const lastChallengeDay = addDaysKey(settings.challengeStart, total - 1)
  const lastRelevant = today < lastChallengeDay ? today : lastChallengeDay
  const daysElapsed = Math.min(total, diffDaysKey(lastRelevant, settings.challengeStart) + 1)
  if (daysElapsed <= 0) return { current: 0, best: 0 }

  const qualifies = (date: string) => {
    const completion = getCompletion(logs[date], habits)
    return completion.total > 0 && completion.percent >= STREAK_THRESHOLD
  }

  let best = 0
  let run = 0
  for (let i = 0; i < daysElapsed; i += 1) {
    const date = addDaysKey(settings.challengeStart, i)
    if (qualifies(date)) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }

  let current = 0
  let cursorIndex = daysElapsed - 1
  if (cursorIndex >= 0 && today === lastRelevant && !qualifies(lastRelevant)) {
    // An unfinished today should not erase yesterday's streak.
    cursorIndex -= 1
  }
  while (cursorIndex >= 0) {
    const date = addDaysKey(settings.challengeStart, cursorIndex)
    if (!qualifies(date)) break
    current += 1
    cursorIndex -= 1
  }

  return { current, best: Math.max(best, current) }
}

export function buildChallengeStats(
  settings: AppSettings,
  habits: Habit[],
  logs: Record<string, DailyLog>,
  today = todayKey(),
) {
  const totalDays = getTotalDays(settings)
  const rawDay = diffDaysKey(today, settings.challengeStart) + 1
  const isBeforeStart = rawDay < 1
  const isComplete = rawDay > totalDays
  const currentDay = Math.min(totalDays, Math.max(1, rawDay))
  const daysElapsed = Math.max(0, Math.min(totalDays, rawDay))
  const daysRemaining = isBeforeStart ? totalDays : Math.max(0, totalDays - currentDay)
  const timeProgress = clampPercent((daysElapsed / totalDays) * 100)

  const enabled = getEnabledHabits(habits)
  const dateKeys = Array.from({ length: daysElapsed }, (_, i) =>
    addDaysKey(settings.challengeStart, i),
  )
  const completedSum = dateKeys.reduce(
    (sum, date) => sum + getCompletion(logs[date], habits).completed,
    0,
  )
  const overallCompletion =
    enabled.length === 0 || daysElapsed === 0
      ? 0
      : clampPercent((completedSum / (enabled.length * daysElapsed)) * 100)

  const activeDays = dateKeys.filter((date) => {
    const completion = getCompletion(logs[date], habits)
    return completion.completed > 0
  }).length
  const perfectDays = dateKeys.filter((date) => {
    const completion = getCompletion(logs[date], habits)
    return completion.total > 0 && completion.completed === completion.total
  }).length

  const totalWorkouts = countDaysWithAny(['gym'], dateKeys, logs)
  const totalStudySessions = countDaysWithAny(['devops-interview', 'focused-study'], dateKeys, logs)
  const totalYoutubeSessions = countDaysWithAny(['youtube'], dateKeys, logs)
  const totalUdemySessions = countDaysWithAny(['udemy'], dateKeys, logs)
  const totalPrayers = dateKeys.reduce((sum, date) => sum + countPrayers(logs[date]), 0)

  const streaks = calculateStreaks(settings, habits, logs, today)

  return {
    totalDays,
    currentDay,
    isBeforeStart,
    isComplete,
    daysElapsed,
    daysRemaining,
    timeProgress,
    overallCompletion,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    activeDays,
    perfectDays,
    totalWorkouts,
    totalStudySessions,
    totalYoutubeSessions,
    totalUdemySessions,
    totalPrayers,
  }
}

export function getCategoryProgress(habits: Habit[], logs: Record<string, DailyLog>, dates: string[]) {
  const enabled = getEnabledHabits(habits)
  return CATEGORIES.map((category) => {
    const catHabits = enabled.filter((h) => h.category === category.id)
    const completed = dates.reduce(
      (sum, date) => sum + catHabits.filter((h) => isHabitComplete(h, logs[date])).length,
      0,
    )
    const total = catHabits.length * dates.length
    return {
      id: category.id as CategoryId,
      label: category.label,
      color: category.color,
      completed,
      total,
      percent: total === 0 ? 0 : clampPercent((completed / total) * 100),
    }
  })
}

export function getWeightStats(entries: WeightEntry[], settings: AppSettings) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const latest = sorted[sorted.length - 1]
  const current = latest ? latest.weight : settings.startingWeight
  const lost = Math.round((settings.startingWeight - current) * 10) / 10
  const remaining = Math.max(0, Math.round((current - settings.targetWeight) * 10) / 10)
  const totalToLose = settings.startingWeight - settings.targetWeight
  const progress =
    totalToLose <= 0
      ? 0
      : clampPercent(((settings.startingWeight - current) / totalToLose) * 100)
  return {
    current,
    latest,
    lost,
    remaining,
    progress,
    sorted,
  }
}

export function getShareLine(completionRate: number, streak: number): string {
  if (completionRate >= 90) return 'A near-perfect week. This is what standards look like.'
  if (completionRate >= 75) return 'One week stronger. Keep showing up.'
  if (completionRate >= 50) return 'Consistency beats motivation. Keep building.'
  if (streak > 0) return 'Momentum is fragile. Protect it tomorrow.'
  return 'The reset begins with one honest day.'
}

export function weekLabel(weekStart: string): string {
  return `${formatShortDate(getWeekStart(weekStart))}`
}
