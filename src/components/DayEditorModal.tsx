import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useApp } from '../store/AppStore'
import { getCompletion } from '../utils/analytics'
import { addDaysKey, formatLongDate, getTotalDays } from '../utils/dateUtils'
import { cn } from '../utils/cn'
import { Button } from './Button'
import { ConfirmDialog, Modal } from './Modal'
import { HabitChecklist } from './HabitChecklist'

interface DayEditorModalProps {
  date: string | null
  onClose: () => void
  onDateChange: (date: string) => void
}

export function DayEditorModal({ date, onClose, onDateChange }: DayEditorModalProps) {
  const {
    settings,
    habits,
    dailyLogs,
    today,
    toggleHabit,
    togglePrayer,
    setAllPrayers,
    setDailyNote,
    clearDay,
  } = useApp()
  const [confirmClear, setConfirmClear] = useState(false)

  if (!date) return null

  const log = dailyLogs[date]
  const completion = getCompletion(log, habits)
  const lastDay = addDaysKey(settings.challengeStart, Math.max(1, getTotalDays(settings)) - 1)
  const canGoPrev = date > settings.challengeStart
  const canGoNext = date < today && date < lastDay

  return (
    <>
      <Modal
        open={Boolean(date)}
        onClose={onClose}
        title="Edit day"
        description="Every change saves instantly. Past days are always editable."
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="md"
              className="text-red-300/80 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 size={15} />
              Clear
            </Button>
            <Button variant="primary" size="md" onClick={onClose} className="min-w-[104px]">
              Done
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pb-2">
          <div className="flex items-center gap-3 rounded-2xl border border-line/80 bg-[#0b0c0f] p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <CalendarDays size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-white">
                {formatLongDate(date)}
              </div>
              <div className="mt-0.5 text-[11px] text-faint">
                {completion.completed} of {completion.total} habits · {completion.percent}%
                {date === today ? ' · Today' : ''}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                aria-label="Previous day"
                disabled={!canGoPrev}
                onClick={() => canGoPrev && onDateChange(addDaysKey(date, -1))}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors',
                  canGoPrev ? 'hover:bg-white/5 hover:text-white' : 'opacity-35',
                )}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next day"
                disabled={!canGoNext}
                onClick={() => canGoNext && onDateChange(addDaysKey(date, 1))}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors',
                  canGoNext ? 'hover:bg-white/5 hover:text-white' : 'opacity-35',
                )}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${completion.percent}%` }}
            />
          </div>

          <HabitChecklist
            log={log}
            habits={habits}
            onToggleHabit={(habitId) => toggleHabit(date, habitId)}
            onTogglePrayer={(prayerId) => togglePrayer(date, prayerId)}
            onSetAllPrayers={(value) => setAllPrayers(date, value)}
          />

          <div>
            <label
              htmlFor="day-note"
              className="mb-1.5 block text-[12px] font-medium text-muted"
            >
              Daily note
            </label>
            <textarea
              id="day-note"
              value={log?.notes ?? ''}
              onChange={(event) => setDailyNote(date, event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What mattered about this day?"
              className="w-full resize-none rounded-xl border border-line bg-[#0b0c0f] px-3.5 py-3 text-[13px] leading-5 text-white outline-none placeholder:text-faint focus:border-accent/50"
            />
            <p className="mt-1.5 text-[10.5px] text-faint">Saved locally as you type.</p>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearDay(date)
          onClose()
        }}
        title="Clear this day?"
        message={`All habit checks, prayers and notes for ${formatLongDate(date)} will be removed. This cannot be undone.`}
        confirmLabel="Clear day"
        destructive
      />
    </>
  )
}
