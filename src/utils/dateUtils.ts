import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDayOfYear,
  parse,
  startOfMonth,
  startOfWeek,
  isWithinInterval,
} from 'date-fns'
import type { AppSettings } from '../types'

export const DATE_KEY_FORMAT = 'yyyy-MM-dd'

/** Parse a YYYY-MM-DD key as a local calendar date. */
export function parseDateKey(key: string): Date {
  return parse(key, DATE_KEY_FORMAT, new Date())
}

export function toDateKey(date: Date): string {
  return format(date, DATE_KEY_FORMAT)
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function addDaysKey(key: string, amount: number): string {
  return toDateKey(addDays(parseDateKey(key), amount))
}

export function diffDaysKey(a: string, b: string): number {
  return differenceInCalendarDays(parseDateKey(a), parseDateKey(b))
}

export function formatLongDate(key: string): string {
  return format(parseDateKey(key), 'EEEE, d MMMM yyyy')
}

export function formatMediumDate(key: string): string {
  return format(parseDateKey(key), 'd MMM yyyy')
}

export function formatShortDate(key: string): string {
  return format(parseDateKey(key), 'd MMM')
}

export function formatWeekday(key: string): string {
  return format(parseDateKey(key), 'EEE')
}

export function formatMonthYear(key: string): string {
  return format(parseDateKey(key), 'MMMM yyyy')
}

export function formatMonthShort(key: string): string {
  return format(parseDateKey(key), 'MMM')
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false
  const parsed = parseDateKey(key)
  return !Number.isNaN(parsed.getTime()) && toDateKey(parsed) === key
}

/**
 * The challenge's tracked days begin on the start date and end the day before
 * the configured end date. 18 Nov 2026 → 15 Jan 2027 gives exactly 58 days.
 */
export function getTotalDays(settings: AppSettings): number {
  if (!isValidDateKey(settings.challengeStart) || !isValidDateKey(settings.challengeEnd)) {
    return 58
  }
  const total = diffDaysKey(settings.challengeEnd, settings.challengeStart)
  return Math.min(366, Math.max(1, total))
}

export function getCurrentDay(settings: AppSettings, today = todayKey()): number {
  const total = getTotalDays(settings)
  const day = diffDaysKey(today, settings.challengeStart) + 1
  return Math.min(total, Math.max(1, day))
}

export function isBeforeChallenge(settings: AppSettings, today = todayKey()): boolean {
  return today < settings.challengeStart
}

export function isAfterChallenge(settings: AppSettings, today = todayKey()): boolean {
  return diffDaysKey(today, settings.challengeStart) + 1 > getTotalDays(settings)
}

export function getChallengeDateKeys(settings: AppSettings): string[] {
  const total = getTotalDays(settings)
  return Array.from({ length: total }, (_, i) => addDaysKey(settings.challengeStart, i))
}

export function getWeekStart(key: string): string {
  return toDateKey(startOfWeek(parseDateKey(key), { weekStartsOn: 1 }))
}

export function getWeekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysKey(weekStart, i))
}

export function formatWeekRange(weekStart: string): string {
  const start = parseDateKey(weekStart)
  const end = addDays(start, 6)
  const sameMonth = format(start, 'MMM') === format(end, 'MMM')
  if (sameMonth) {
    return `${format(start, 'd')} – ${format(end, 'd MMM')}`
  }
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`
}

export function formatWeekRangeFull(weekStart: string): string {
  return `${formatShortDate(weekStart)} – ${formatMediumDate(addDaysKey(weekStart, 6))}`
}

export function getQuoteIndex(key: string, quoteCount: number): number {
  return getDayOfYear(parseDateKey(key)) % quoteCount
}

export function getMonthSections(startKey: string, totalDays: number) {
  const start = parseDateKey(startKey)
  const end = addDays(start, totalDays - 1)
  const sections: Array<{
    label: string
    monthStart: string
    days: Array<{ date: string | null; dayNumber: number | null }>
  }> = []

  let cursor = startOfMonth(start)
  while (cursor <= end) {
    const monthStart = cursor
    const monthEnd = endOfMonth(monthStart)
    const intervalStart = monthStart < start ? start : monthStart
    const intervalEnd = monthEnd > end ? end : monthEnd
    const daysInMonth = eachDayOfInterval({ start: intervalStart, end: intervalEnd })
    const startOffset = (startOfWeek(intervalStart, { weekStartsOn: 1 }).getTime() === intervalStart.getTime()
      ? 0
      : (intervalStart.getDay() + 6) % 7)

    const cells: Array<{ date: string | null; dayNumber: number | null }> = Array.from(
      { length: startOffset },
      () => ({ date: null, dayNumber: null }),
    )
    for (const day of daysInMonth) {
      cells.push({ date: toDateKey(day), dayNumber: day.getDate() })
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, dayNumber: null })

    sections.push({ label: formatMonthYear(toDateKey(monthStart)), monthStart: toDateKey(monthStart), days: cells })
    cursor = addDays(monthEnd, 1)
  }

  return sections
}

export function getDaysInRange(startKey: string, endKey: string): string[] {
  if (endKey < startKey) return []
  return eachDayOfInterval({ start: parseDateKey(startKey), end: parseDateKey(endKey) }).map(toDateKey)
}

export function isDateInRange(key: string, startKey: string, endKey: string): boolean {
  if (!isValidDateKey(key) || !isValidDateKey(startKey) || !isValidDateKey(endKey)) return false
  return isWithinInterval(parseDateKey(key), {
    start: parseDateKey(startKey),
    end: parseDateKey(endKey),
  })
}

export function getGreetingPart(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Late night'
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}
