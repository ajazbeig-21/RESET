import type { AppSettings, DailyLog, Habit } from '../types'
import { getCompletion } from '../utils/analytics'
import { getMonthSections, getTotalDays } from '../utils/dateUtils'
import { cn } from '../utils/cn'

interface ChallengeCalendarProps {
  settings: AppSettings
  habits: Habit[]
  dailyLogs: Record<string, DailyLog>
  today: string
  onSelectDate: (date: string) => void
}

function intensityStyle(percent: number) {
  if (percent === 0) {
    return {
      backgroundColor: 'rgba(255,255,255,0.025)',
      borderColor: 'rgba(36,38,44,0.9)',
      color: '#62666f',
    }
  }
  if (percent <= 25) {
    return {
      backgroundColor: 'rgba(52,211,153,0.10)',
      borderColor: 'rgba(52,211,153,0.16)',
      color: '#7ee8be',
    }
  }
  if (percent <= 50) {
    return {
      backgroundColor: 'rgba(52,211,153,0.19)',
      borderColor: 'rgba(52,211,153,0.24)',
      color: '#a4f0d3',
    }
  }
  if (percent <= 75) {
    return {
      backgroundColor: 'rgba(52,211,153,0.31)',
      borderColor: 'rgba(52,211,153,0.35)',
      color: '#d3fbeb',
    }
  }
  return {
    backgroundColor: 'rgba(52,211,153,0.55)',
    borderColor: 'rgba(52,211,153,0.62)',
    color: '#04140e',
  }
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function ChallengeCalendar({
  settings,
  habits,
  dailyLogs,
  today,
  onSelectDate,
}: ChallengeCalendarProps) {
  const totalDays = getTotalDays(settings)
  const sections = getMonthSections(settings.challengeStart, totalDays)

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.monthStart}>
          <div className="mb-2.5 flex items-center justify-between px-1">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.13em] text-muted">
              {section.label}
            </h3>
            <span className="text-[10px] uppercase tracking-[0.1em] text-faint">
              {section.days.filter((day) => day.date).length} days
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="pb-1 text-center text-[9px] font-medium uppercase tracking-wide text-faint"
              >
                {label}
              </span>
            ))}

            {section.days.map((cell, index) => {
              if (!cell.date) {
                return <span key={`empty-${index}`} className="aspect-square" />
              }
              const date = cell.date
              const percent = getCompletion(dailyLogs[date], habits).percent
              const isFuture = date > today
              const isToday = date === today
              return (
                <button
                  key={date}
                  type="button"
                  disabled={isFuture}
                  onClick={() => onSelectDate(date)}
                  aria-label={`${date}, ${percent}% complete`}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-[10px] border text-[11px] font-medium transition-all duration-150',
                    isFuture
                      ? 'cursor-not-allowed border-line/40 bg-white/[0.012] text-white/15'
                      : 'hover:scale-[1.04] hover:brightness-125 active:scale-95',
                    isToday && 'ring-1 ring-accent/70 ring-offset-1 ring-offset-card',
                  )}
                  style={isFuture ? undefined : intensityStyle(percent)}
                >
                  {cell.dayNumber}
                  {percent === 100 ? (
                    <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-[#04140e]/70" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between border-t border-line/50 pt-4">
        <span className="text-[10px] uppercase tracking-[0.12em] text-faint">Less</span>
        <div className="flex items-center gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((level) => (
            <span
              key={level}
              className="h-3 w-3 rounded-[3px] border"
              style={{
                backgroundColor: level === 0 ? 'rgba(255,255,255,0.025)' : `rgba(52,211,153,${0.1 + level * 0.45})`,
                borderColor: 'rgba(52,211,153,0.16)',
              }}
            />
          ))}
        </div>
        <span className="text-[10px] uppercase tracking-[0.12em] text-faint">More</span>
      </div>
    </div>
  )
}
