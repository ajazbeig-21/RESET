import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookHeart,
  Check,
  ChevronRight,
  Flame,
  PenLine,
  Quote,
  Share2,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { QUOTES } from '../data/defaults'
import {
  buildChallengeStats,
  countPrayers,
  getCompletion,
  getEnabledHabits,
} from '../utils/analytics'
import { formatLongDate, formatMediumDate, getQuoteIndex } from '../utils/dateUtils'
import { BrandMark } from '../components/Brand'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { HabitChecklist } from '../components/HabitChecklist'
import { ProgressRing } from '../components/ProgressRing'
import { ShareModal } from '../components/ShareModal'
import { cn } from '../utils/cn'

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/60 bg-white/[0.02] px-2.5 py-2">
      <div className="text-[9px] font-medium uppercase tracking-[0.12em] text-faint">
        {label}
      </div>
      <div className="mt-0.5 text-[13px] font-semibold tabular text-white">{value}</div>
    </div>
  )
}

function DailyNote({
  date,
  notes,
  onSave,
}: {
  date: string
  notes: string
  onSave: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(notes)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setValue(notes)
  }, [date, notes])

  const handleSave = () => {
    onSave(value)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-line/80 px-4 py-3.5 text-left transition-colors hover:border-line hover:bg-white/[0.015]"
      >
        <PenLine size={15} className="shrink-0 text-faint" />
        <span className="min-w-0 flex-1 truncate text-[12.5px] text-muted">
          {notes ? notes : 'Add a note for today'}
        </span>
        <ChevronRight size={15} className="shrink-0 text-faint" />
      </button>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine size={14} className="text-accent" />
          <span className="text-[12px] font-medium text-white">Daily note</span>
          {saved ? (
            <span className="flex items-center gap-1 text-[10.5px] text-accent">
              <Check size={11} /> Saved
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            if (value !== notes) onSave(value)
            setOpen(false)
          }}
          className="text-[11px] font-medium text-faint transition-colors hover:text-white"
        >
          Close
        </button>
      </div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={handleSave}
        placeholder="One honest line about today. Stored only on this device."
        rows={3}
        maxLength={2000}
        className="mt-3 w-full resize-none rounded-xl border border-line bg-[#0b0c0f] px-3 py-2.5 text-[13px] leading-5 text-white outline-none placeholder:text-faint focus:border-accent/50"
      />
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[10px] text-faint">Private · saved locally</span>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            handleSave()
            setOpen(false)
          }}
        >
          Save note
        </Button>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const {
    settings,
    habits,
    dailyLogs,
    today,
    toggleHabit,
    togglePrayer,
    setAllPrayers,
    setDailyNote,
  } = useApp()
  const [shareOpen, setShareOpen] = useState(false)

  const log = dailyLogs[today]
  const completion = getCompletion(log, habits)
  const challenge = useMemo(
    () => buildChallengeStats(settings, habits, dailyLogs, today),
    [dailyLogs, habits, settings, today],
  )
  const enabledCount = getEnabledHabits(habits).length
  const quote = QUOTES[getQuoteIndex(today, QUOTES.length)]
  const remaining = Math.max(0, completion.total - completion.completed)
  const prayerCount = countPrayers(log)

  return (
    <div className="pb-2">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[9.5px] font-medium uppercase tracking-[0.2em] text-faint">
            <BrandMark size={20} />
            <span>RESET</span>
            <span className="h-0.5 w-0.5 rounded-full bg-faint" />
            <span className="text-accent">
              {challenge.isBeforeStart
                ? `Starts ${formatMediumDate(settings.challengeStart)}`
                : challenge.isComplete
                  ? 'Challenge complete'
                  : `Day ${challenge.currentDay} of ${challenge.totalDays}`}
            </span>
          </div>
          <h1 className="mt-4 text-[28px] font-semibold leading-none tracking-[-0.035em] text-white">
            Assalamu Alaikum
          </h1>
          <p className="mt-2 text-[12.5px] leading-5 text-muted">{formatLongDate(today)}</p>
        </div>

        <div className="flex shrink-0 gap-1.5">
          <Link
            to="/journal"
            aria-label="Open reset space"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line/80 bg-card text-muted transition-colors hover:text-white"
          >
            <BookHeart size={17} />
          </Link>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label="Share my week"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line/80 bg-card text-muted transition-colors hover:text-white"
          >
            <Share2 size={17} />
          </button>
        </div>
      </header>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line/60 bg-white/[0.018] px-4 py-3.5">
        <Quote size={14} className="mt-0.5 shrink-0 text-accent/80" />
        <div className="min-w-0">
          <p className="text-[12.5px] leading-[1.55] text-white/80">{quote.text}</p>
          {quote.source ? (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
              {quote.source}
            </p>
          ) : null}
        </div>
      </div>

      <Card className="mt-4 overflow-hidden p-0">
        <div className="flex items-center gap-4 p-5">
          <ProgressRing percent={completion.percent} size={116} stroke={9}>
            <span className="text-[24px] font-semibold leading-none tracking-tight tabular text-white">
              {completion.percent}%
            </span>
            <span className="mt-1 text-[8.5px] font-medium uppercase tracking-[0.16em] text-faint">
              complete
            </span>
          </ProgressRing>

          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-faint">
              Today
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-[22px] font-semibold leading-none tracking-tight tabular text-white">
                {completion.completed}
              </span>
              <span className="text-[12px] text-muted">of {completion.total} habits</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <MiniStat label="Salah" value={`${prayerCount}/5`} />
              <MiniStat label="Remaining" value={`${remaining}`} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line/60 bg-white/[0.012] px-5 py-3">
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <Flame size={13} className="text-accent" />
            <span className="font-semibold tabular text-white">{challenge.currentStreak}</span>
            day{challenge.currentStreak === 1 ? '' : 's'} streak
          </span>
          <span className="text-[10.5px] text-faint">
            best {challenge.bestStreak}
          </span>
          <span className="ml-auto text-[10.5px] tabular text-faint">
            {challenge.overallCompletion}% challenge avg
          </span>
        </div>
      </Card>

      <div className="mt-7 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-white">
            Today&apos;s checklist
          </h2>
          <p className="mt-0.5 text-[11.5px] text-faint">
            {completion.completed} done · {remaining} remaining
            {enabledCount === 0 ? ' · add habits in Settings' : ''}
          </p>
        </div>
        <Link
          to="/weekly"
          className="flex items-center gap-0.5 text-[11.5px] font-medium text-accent transition-opacity hover:opacity-80"
        >
          Weekly
          <ChevronRight size={13} />
        </Link>
      </div>

      <div className="mt-4">
        <HabitChecklist
          log={log}
          habits={habits}
          onToggleHabit={(habitId) => toggleHabit(today, habitId)}
          onTogglePrayer={(prayerId) => togglePrayer(today, prayerId)}
          onSetAllPrayers={(value) => setAllPrayers(today, value)}
        />
      </div>

      <div className="mt-4">
        <DailyNote date={today} notes={log?.notes ?? ''} onSave={(value) => setDailyNote(today, value)} />
      </div>

      <div
        className={cn(
          'mt-7 flex items-center justify-between border-t border-line/50 pt-5 text-[10.5px] text-faint',
        )}
      >
        <span className="tabular">
          {challenge.isComplete
            ? `Challenge complete · ${challenge.overallCompletion}% overall`
            : challenge.isBeforeStart
              ? `Starts ${formatMediumDate(settings.challengeStart)}`
              : `Day ${challenge.currentDay}/${challenge.totalDays} · ${
                  challenge.daysRemaining
                } ${challenge.daysRemaining === 1 ? 'day' : 'days'} left`}
        </span>
        <span>Consistency beats motivation.</span>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}
