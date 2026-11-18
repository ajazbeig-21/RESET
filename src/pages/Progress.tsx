import { useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Dumbbell,
  Flame,
  GraduationCap,
  MoonStar,
  Target,
  Trophy,
  Youtube,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { buildChallengeStats } from '../utils/analytics'
import { formatMediumDate } from '../utils/dateUtils'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ChallengeCalendar } from '../components/ChallengeCalendar'
import { DayEditorModal } from '../components/DayEditorModal'
import { ProgressRing } from '../components/ProgressRing'
import { StatCard } from '../components/StatCard'
import { WeightSection } from '../components/WeightSection'

export default function Progress() {
  const { settings, habits, dailyLogs, today } = useApp()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const stats = useMemo(
    () => buildChallengeStats(settings, habits, dailyLogs, today),
    [dailyLogs, habits, settings, today],
  )

  const dayText = stats.isBeforeStart
    ? 'Not started'
    : stats.isComplete
      ? 'Complete'
      : `Day ${stats.currentDay}`

  return (
    <div>
      <header className="mb-5">
        <div className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-faint">
          Challenge overview
        </div>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">Progress</h1>
        <p className="mt-1.5 text-[12px] text-muted">
          {formatMediumDate(settings.challengeStart)} → {formatMediumDate(settings.challengeEnd)}
        </p>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[9.5px] font-medium uppercase tracking-[0.15em] text-faint">
                Challenge
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-white">
                  {dayText}
                </span>
                {!stats.isBeforeStart && !stats.isComplete ? (
                  <span className="text-[13px] text-muted">of {stats.totalDays}</span>
                ) : null}
              </div>
              <div className="mt-2 text-[11px] text-faint">
                {stats.daysElapsed} {stats.daysElapsed === 1 ? 'day' : 'days'} done ·{' '}
                {stats.daysRemaining} {stats.daysRemaining === 1 ? 'day' : 'days'} left
              </div>
            </div>
            <ProgressRing percent={stats.timeProgress} size={70} stroke={6}>
              <span className="text-[13px] font-semibold tabular text-white">
                {stats.timeProgress}%
              </span>
              <span className="text-[7.5px] uppercase tracking-[0.12em] text-faint">time</span>
            </ProgressRing>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-strong to-accent transition-[width] duration-700"
              style={{ width: `${stats.timeProgress}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
              <div className="text-[9px] uppercase tracking-[0.1em] text-faint">Completed</div>
              <div className="mt-1 text-[15px] font-semibold tabular text-white">
                {stats.overallCompletion}%
              </div>
            </div>
            <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
              <div className="text-[9px] uppercase tracking-[0.1em] text-faint">Active</div>
              <div className="mt-1 text-[15px] font-semibold tabular text-white">
                {stats.activeDays}
              </div>
            </div>
            <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
              <div className="text-[9px] uppercase tracking-[0.1em] text-faint">Perfect</div>
              <div className="mt-1 text-[15px] font-semibold tabular text-white">
                {stats.perfectDays}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-line/60 bg-white/[0.012] px-5 py-3">
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <Flame size={13} className="text-accent" />
            <span className="font-semibold tabular text-white">{stats.currentStreak}</span>
            day{stats.currentStreak === 1 ? '' : 's'} streak
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <Trophy size={13} className="text-warning" />
            best <span className="font-semibold tabular text-white">{stats.bestStreak}</span>
          </span>
          <span className="ml-auto text-[10px] text-faint">50%+ = streak day</span>
        </div>
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <StatCard
          label="Overall rate"
          value={`${stats.overallCompletion}%`}
          hint="All challenge habits"
          icon={Target}
          tone="accent"
        />
        <StatCard
          label="Workouts"
          value={stats.totalWorkouts}
          hint="Gym or activity"
          icon={Dumbbell}
          tone="azure"
        />
        <StatCard
          label="Study sessions"
          value={stats.totalStudySessions}
          hint="DevOps & focus"
          icon={BookOpen}
          tone="accent"
        />
        <StatCard
          label="Prayers"
          value={stats.totalPrayers}
          hint={`${stats.totalPrayers} tracked overall`}
          icon={MoonStar}
          tone="plain"
        />
        <StatCard
          label="YouTube"
          value={stats.totalYoutubeSessions}
          hint="Content sessions"
          icon={Youtube}
          tone="warm"
        />
        <StatCard
          label="Udemy"
          value={stats.totalUdemySessions}
          hint="Course sessions"
          icon={GraduationCap}
          tone="azure"
        />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              Challenge calendar
            </h2>
            <p className="mt-0.5 text-[11.5px] text-faint">
              Tap any past day to view or edit it.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setSelectedDate(today)}>
            <CalendarDays size={14} />
            Today
          </Button>
        </div>
        <Card className="p-4">
          <ChallengeCalendar
            settings={settings}
            habits={habits}
            dailyLogs={dailyLogs}
            today={today}
            onSelectDate={setSelectedDate}
          />
        </Card>
      </div>

      <div className="mb-3 mt-7 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-white">Weight tracking</h2>
          <p className="mt-0.5 text-[11.5px] text-faint">
            {settings.startingWeight} kg → {settings.targetWeight} kg by{' '}
            {formatMediumDate(settings.challengeEnd)}
          </p>
        </div>
        <Clock3 size={16} className="mb-1 text-faint" />
      </div>
      <WeightSection />

      <DayEditorModal
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
        onDateChange={setSelectedDate}
      />
    </div>
  )
}
