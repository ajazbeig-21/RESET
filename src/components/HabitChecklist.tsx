import type { LucideIcon } from 'lucide-react'
import {
  BriefcaseBusiness,
  Check,
  Dumbbell,
  MoonStar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import type { CategoryId, DailyLog, Habit, PrayerId } from '../types'
import { CATEGORIES, PRAYERS } from '../data/defaults'
import { countPrayers, getEnabledHabits, isHabitComplete } from '../utils/analytics'
import { cn } from '../utils/cn'
import { CheckboxMark } from './HabitCheckbox'

const categoryIcons: Record<CategoryId, LucideIcon> = {
  deen: MoonStar,
  fitness: Dumbbell,
  career: BriefcaseBusiness,
  creator: Sparkles,
  discipline: ShieldCheck,
}

interface HabitChecklistProps {
  log?: DailyLog
  habits: Habit[]
  onToggleHabit: (habitId: string) => void
  onTogglePrayer: (prayerId: PrayerId) => void
  onSetAllPrayers: (value: boolean) => void
  className?: string
}

export function HabitChecklist({
  log,
  habits,
  onToggleHabit,
  onTogglePrayer,
  onSetAllPrayers,
  className,
}: HabitChecklistProps) {
  const enabled = getEnabledHabits(habits)

  if (enabled.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-card/50 p-6 text-center">
        <p className="text-sm font-medium text-white">No active habits</p>
        <p className="mt-1 text-xs leading-5 text-faint">
          Add or enable habits in Settings to start tracking.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {CATEGORIES.map((category) => {
        const categoryHabits = enabled.filter((habit) => habit.category === category.id)
        if (categoryHabits.length === 0) return null
        const completed = categoryHabits.filter((habit) => isHabitComplete(habit, log)).length
        const Icon = categoryIcons[category.id]
        return (
          <section key={category.id}>
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06]"
                  style={{ backgroundColor: `${category.color}12`, color: category.color }}
                >
                  <Icon size={13} />
                </span>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {category.label}
                </h3>
              </div>
              <span className="text-[11px] font-medium tabular text-faint">
                {completed}/{categoryHabits.length}
              </span>
            </div>

            <div className="overflow-hidden rounded-3xl border border-line/80 bg-card hairline">
              <div className="divide-y divide-line-soft">
                {categoryHabits.map((habit) => {
                  const done = isHabitComplete(habit, log)
                  const prayerCount = countPrayers(log)
                  return (
                    <div key={habit.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={done}
                        onClick={() => {
                          if (habit.kind === 'salah') onSetAllPrayers(!done)
                          else onToggleHabit(habit.id)
                        }}
                        className="flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-white/[0.02] active:bg-white/[0.035]"
                      >
                        <CheckboxMark checked={done} />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'block text-[14px] font-medium leading-5 transition-colors',
                              done ? 'text-white/60' : 'text-white',
                            )}
                          >
                            {habit.name}
                          </span>
                          {habit.targetLabel ? (
                            <span className="mt-0.5 block truncate text-[11.5px] leading-4 text-faint">
                              {habit.targetLabel}
                            </span>
                          ) : null}
                        </span>
                        {habit.kind === 'salah' ? (
                          <span
                            className={cn(
                              'rounded-full border px-2 py-1 text-[10.5px] font-semibold tabular',
                              done
                                ? 'border-accent/25 bg-accent/10 text-accent'
                                : 'border-line bg-white/[0.03] text-muted',
                            )}
                          >
                            {prayerCount}/5
                          </span>
                        ) : null}
                      </button>

                      {habit.kind === 'salah' ? (
                        <div className="grid grid-cols-5 gap-1.5 px-3 pb-3.5">
                          {PRAYERS.map((prayer) => {
                            const isDone = Boolean(log?.completedPrayers.includes(prayer.id))
                            return (
                              <button
                                key={prayer.id}
                                type="button"
                                aria-pressed={isDone}
                                aria-label={`${prayer.label} prayer`}
                                onClick={() => onTogglePrayer(prayer.id)}
                                className={cn(
                                  'flex h-14 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-medium transition-all duration-150 active:scale-[0.96]',
                                  isDone
                                    ? 'border-accent/30 bg-accent/[0.10] text-accent'
                                    : 'border-line bg-[#0c0d10] text-faint hover:border-line hover:text-muted',
                                )}
                              >
                                <span
                                  className={cn(
                                    'flex h-[18px] w-[18px] items-center justify-center rounded-md border transition-colors',
                                    isDone
                                      ? 'border-accent bg-accent text-[#04140e]'
                                      : 'border-line text-transparent',
                                  )}
                                >
                                  <Check size={11} strokeWidth={3.5} />
                                </span>
                                {prayer.label}
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
