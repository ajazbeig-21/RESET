import { useMemo, useState } from 'react'
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  MoonStar,
  NotebookPen,
  Percent,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useApp, type ReflectionInput } from '../store/AppStore'
import {
  buildInsights,
  buildWeekSummary,
  getWeekRate,
} from '../utils/analytics'
import {
  addDaysKey,
  diffDaysKey,
  formatMediumDate,
  formatWeekRangeFull,
  getWeekStart,
} from '../utils/dateUtils'
import type { WeekSummary, WeeklyReflection } from '../types'
import { Button } from '../components/Button'
import { Card, SectionHeader } from '../components/Card'
import { CategoryDonut } from '../components/CategoryDonut'
import { ConfirmDialog } from '../components/Modal'
import { Field, TextArea } from '../components/Form'
import { SegmentedControl } from '../components/SegmentedControl'
import { ShareModal } from '../components/ShareModal'
import { StatCard } from '../components/StatCard'
import { WeeklyChart } from '../components/WeeklyChart'
import { useToast } from '../components/Toast'
import { cn } from '../utils/cn'

type Tab = 'analytics' | 'review'

const reflectionFields: Array<{
  key: keyof ReflectionInput
  label: string
  placeholder: string
}> = [
  {
    key: 'wentWell',
    label: 'What went well this week?',
    placeholder: 'Wins, habits kept, moments you showed up…',
  },
  {
    key: 'distraction',
    label: 'What was my biggest distraction?',
    placeholder: 'Name it honestly. Scrolling, sleep, people, noise…',
  },
  {
    key: 'learned',
    label: 'What did I learn?',
    placeholder: 'About your faith, work, body, focus…',
  },
  {
    key: 'improvement',
    label: 'What needs improvement?',
    placeholder: 'One thing that would make next week stronger…',
  },
  {
    key: 'nextFocus',
    label: 'What is my primary focus for next week?',
    placeholder: 'One clear priority. Protect it.',
  },
]

const emptyReflection: ReflectionInput = {
  wentWell: '',
  distraction: '',
  learned: '',
  improvement: '',
  nextFocus: '',
}

function ReflectionForm({
  initial,
  onSave,
}: {
  initial?: WeeklyReflection
  onSave: (input: ReflectionInput) => void
}) {
  const [form, setForm] = useState<ReflectionInput>(() =>
    initial
      ? {
          wentWell: initial.wentWell,
          distraction: initial.distraction,
          learned: initial.learned,
          improvement: initial.improvement,
          nextFocus: initial.nextFocus,
        }
      : emptyReflection,
  )
  const [saved, setSaved] = useState(false)
  const isBlank = Object.values(form).every((value) => value.trim() === '')

  const handleSave = () => {
    onSave(form)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <NotebookPen size={15} />
          </span>
          <div>
            <h2 className="text-[14px] font-semibold text-white">
              {initial ? 'Update this reflection' : 'Reflect on this week'}
            </h2>
            <p className="text-[10.5px] text-faint">Private · stored on this device</p>
          </div>
        </div>
        {saved ? (
          <span className="flex items-center gap-1 text-[10.5px] font-medium text-accent">
            <CheckCircle2 size={12} /> Saved
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {reflectionFields.map((field) => (
          <Field key={field.key} label={field.label} htmlFor={`reflection-${field.key}`}>
            <TextArea
              id={`reflection-${field.key}`}
              value={form[field.key]}
              onChange={(event) =>
                setForm((current) => ({ ...current, [field.key]: event.target.value }))
              }
              placeholder={field.placeholder}
              rows={3}
              maxLength={4000}
            />
          </Field>
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        full
        className="mt-4"
        onClick={handleSave}
        disabled={isBlank}
      >
        Save reflection
      </Button>
      {isBlank ? (
        <p className="mt-2 text-center text-[10.5px] text-faint">
          Write at least one line to save.
        </p>
      ) : null}
    </Card>
  )
}

function HeatmapCell({ day }: { day: WeekSummary['days'][number] }) {
  const isInactive = day.isFuture || day.isOutside
  const style = isInactive
    ? { backgroundColor: 'rgba(255,255,255,0.022)', borderColor: 'rgba(36,38,44,0.7)', color: '#4f535b' }
    : day.percent === 0
      ? { backgroundColor: 'rgba(255,255,255,0.025)', borderColor: 'rgba(36,38,44,0.9)', color: '#62666f' }
      : day.percent <= 25
        ? { backgroundColor: 'rgba(52,211,153,0.10)', borderColor: 'rgba(52,211,153,0.16)', color: '#7ee8be' }
        : day.percent <= 50
          ? { backgroundColor: 'rgba(52,211,153,0.19)', borderColor: 'rgba(52,211,153,0.24)', color: '#a4f0d3' }
          : day.percent <= 75
            ? { backgroundColor: 'rgba(52,211,153,0.31)', borderColor: 'rgba(52,211,153,0.35)', color: '#d3fbeb' }
            : { backgroundColor: 'rgba(52,211,153,0.55)', borderColor: 'rgba(52,211,153,0.62)', color: '#04140e' }

  return (
    <div
      className={cn(
        'rounded-xl border px-1 py-2 text-center',
        day.isToday && 'ring-1 ring-accent/60',
      )}
      style={style}
    >
      <div className="text-[8.5px] font-medium uppercase tracking-[0.08em] opacity-80">
        {day.label}
      </div>
      <div className="mt-1 text-[11px] font-semibold tabular">
        {day.isOutside ? '—' : `${day.percent}%`}
      </div>
      <div className="mt-0.5 text-[8px] tabular opacity-70">
        {day.isOutside ? '—' : `${day.completed}/${day.total}`}
      </div>
    </div>
  )
}

export default function Weekly() {
  const {
    settings,
    habits,
    dailyLogs,
    reflections,
    today,
    saveReflection,
    deleteReflection,
  } = useApp()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('analytics')
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today))
  const [shareOpen, setShareOpen] = useState(false)
  const [expandedReflection, setExpandedReflection] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const currentWeekStart = getWeekStart(today)
  const minWeekStart = getWeekStart(settings.challengeStart)
  const isCurrentWeek = weekStart === currentWeekStart
  const canPrev = weekStart > minWeekStart
  const canNext = weekStart < currentWeekStart

  const summary = useMemo(
    () => buildWeekSummary(weekStart, habits, dailyLogs, today, settings.challengeStart),
    [dailyLogs, habits, settings.challengeStart, today, weekStart],
  )
  const insights = useMemo(
    () => buildInsights(summary),
    [summary],
  )
  const previousRate = useMemo(
    () =>
      getWeekRate(
        addDaysKey(weekStart, -7),
        habits,
        dailyLogs,
        today,
        settings.challengeStart,
      ),
    [dailyLogs, habits, settings.challengeStart, today, weekStart],
  )
  const existingReflection = reflections.find((item) => item.weekStart === weekStart)
  const weekNumber = Math.max(
    1,
    Math.round(diffDaysKey(weekStart, minWeekStart) / 7) + 1,
  )
  const avgPerDay =
    summary.daysElapsed === 0
      ? 0
      : Math.round((summary.completedHabits / summary.daysElapsed) * 10) / 10

  return (
    <div>
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-faint">
            Analytics & reflection
          </div>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">Weekly</h1>
          <p className="mt-1.5 text-[12px] text-muted">
            {formatWeekRangeFull(weekStart)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Share my week"
          onClick={() => setShareOpen(true)}
        >
          <Share2 size={17} />
        </Button>
      </header>

      <SegmentTabs tab={tab} onChange={setTab} />

      <div className="mt-3 flex items-center justify-between rounded-2xl border border-line/80 bg-card px-2 py-1.5">
        <button
          type="button"
          aria-label="Previous week"
          disabled={!canPrev}
          onClick={() => canPrev && setWeekStart(addDaysKey(weekStart, -7))}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors',
            canPrev ? 'hover:bg-white/5 hover:text-white' : 'opacity-30',
          )}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="text-[12.5px] font-medium text-white">
            {formatWeekRangeFull(weekStart)}
          </div>
          <div className="mt-0.5 text-[9.5px] uppercase tracking-[0.12em] text-faint">
            {isCurrentWeek ? 'This week' : `Week ${weekNumber}`} · {summary.daysElapsed}{' '}
            {summary.daysElapsed === 1 ? 'day' : 'days'} in
          </div>
        </div>
        <button
          type="button"
          aria-label="Next week"
          disabled={!canNext}
          onClick={() => canNext && setWeekStart(addDaysKey(weekStart, 7))}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors',
            canNext ? 'hover:bg-white/5 hover:text-white' : 'opacity-30',
          )}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {tab === 'analytics' ? (
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              label="Weekly score"
              value={`${summary.completionRate}%`}
              hint={`${summary.completedHabits}/${summary.totalHabits} check-ins`}
              icon={Percent}
              tone="accent"
            />
            <StatCard
              label="Avg / day"
              value={avgPerDay}
              hint="Habits completed"
              icon={Activity}
              tone="plain"
            />
            <StatCard
              label="Completed"
              value={summary.completedHabits}
              hint="This week"
              icon={CheckCircle2}
              tone="plain"
            />
            <StatCard
              label="Salah"
              value={`${summary.salahConsistency}%`}
              hint={`${summary.salahCompleted}/${summary.salahExpected} prayers`}
              icon={MoonStar}
              tone="accent"
            />
            <StatCard
              label="Gym sessions"
              value={summary.gymSessions}
              hint="Physical activity"
              icon={Dumbbell}
              tone="azure"
            />
            <StatCard
              label="DevOps study"
              value={summary.studySessions}
              hint="Interview & focus"
              icon={BookOpen}
              tone="azure"
            />
            <StatCard
              label="Content"
              value={summary.contentSessions}
              hint="Udemy · YouTube · kit"
              icon={Sparkles}
              tone="warm"
            />
            <StatCard
              label="Perfect days"
              value={summary.perfectDays}
              hint="100% completion"
              icon={Flame}
              tone="plain"
            />
          </div>

          <Card className="p-5">
            <div className="mb-1 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold tracking-tight text-white">
                  Daily consistency
                </h2>
                <p className="mt-0.5 text-[10.5px] text-faint">Habits completed each day</p>
              </div>
              <div className="text-right">
                <div className="text-[18px] font-semibold leading-none tabular text-accent">
                  {summary.completionRate}%
                </div>
                <div className="mt-1 text-[9.5px] text-faint">
                  {previousRate > 0 ? `last week ${previousRate}%` : 'week score'}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <WeeklyChart days={summary.days} />
            </div>
          </Card>

          <div>
            <SectionHeader
              title="Category breakdown"
              subtitle="Where your discipline showed up"
            />
            <Card className="p-5">
              <CategoryDonut
                categories={summary.categoryStats}
                overall={summary.completionRate}
              />
            </Card>
          </div>

          <div>
            <SectionHeader
              title="Consistency map"
              subtitle="Each day against your enabled habits"
            />
            <Card className="p-4">
              <div className="grid grid-cols-7 gap-1.5">
                {summary.days.map((day) => (
                  <HeatmapCell key={day.date} day={day} />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-3 text-[8px] text-faint">
                {[
                  { label: '0%', alpha: 0 },
                  { label: '1–25', alpha: 0.1 },
                  { label: '26–50', alpha: 0.19 },
                  { label: '51–75', alpha: 0.31 },
                  { label: '76–100', alpha: 0.55 },
                ].map((level) => (
                  <span key={level.label} className="flex items-center gap-1">
                    <span
                      className="h-2.5 w-2.5 rounded-[3px] border"
                      style={{
                        backgroundColor:
                          level.alpha === 0
                            ? 'rgba(255,255,255,0.025)'
                            : `rgba(52,211,153,${level.alpha})`,
                        borderColor: 'rgba(52,211,153,0.16)',
                      }}
                    />
                    {level.label}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <SectionHeader
              title="Weekly insights"
              subtitle="Generated from your own logs"
              action={<Sparkles size={15} className="text-accent/80" />}
            />
            <Card className="p-4">
              <ul className="space-y-3">
                {insights.map((insight) => (
                  <li key={insight} className="flex gap-2.5">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <p className="text-[12.5px] leading-5 text-white/75">{insight}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex w-full items-center gap-4 rounded-3xl border border-accent/20 bg-accent/[0.055] p-4 text-left transition-colors hover:bg-accent/[0.08]"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-white">Share my week</div>
              <div className="mt-0.5 text-[10.5px] leading-4 text-faint">
                Generate a premium report card · 1080px PNG
              </div>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-[#04140e]">
              <Share2 size={17} />
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          <div className="rounded-2xl border border-line/70 bg-white/[0.018] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                This week
              </span>
              <span className="text-[12px] font-semibold tabular text-accent">
                {summary.completionRate}% complete
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-muted">
              Close the week honestly. Reflection turns activity into direction.
            </p>
          </div>

          <ReflectionForm
            key={weekStart}
            initial={existingReflection}
            onSave={(input) => {
              saveReflection(weekStart, input)
              showToast('Weekly reflection saved.')
            }}
          />

          <div>
            <SectionHeader
              title="Previous reflections"
              subtitle={`${reflections.length} saved`}
            />
            {reflections.length === 0 ? (
              <Card className="p-5 text-center">
                <p className="text-[12.5px] font-medium text-white">No reflections yet</p>
                <p className="mt-1 text-[11px] leading-5 text-faint">
                  Save your first weekly review above. It will appear here as a timeline.
                </p>
              </Card>
            ) : (
              <div className="relative ml-1.5 space-y-3 border-l border-line/70 pl-4">
                {reflections.map((reflection) => {
                  const expanded = expandedReflection === reflection.id
                  return (
                    <div key={reflection.id} className="relative">
                      <span className="absolute -left-[22px] top-5 h-2 w-2 rounded-full border-2 border-ink bg-accent" />
                      <Card className="overflow-hidden p-0">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReflection(expanded ? null : reflection.id)
                          }
                          className="w-full p-4 text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-accent">
                                Week of {formatMediumDate(reflection.weekStart)}
                              </div>
                              <div className="mt-1 text-[10.5px] text-faint">
                                {formatWeekRangeFull(reflection.weekStart)}
                              </div>
                            </div>
                            <ChevronDown
                              size={16}
                              className={cn(
                                'mt-0.5 shrink-0 text-faint transition-transform',
                                expanded && 'rotate-180',
                              )}
                            />
                          </div>
                          {reflection.nextFocus ? (
                            <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-white/70">
                              Focus: {reflection.nextFocus}
                            </p>
                          ) : null}
                        </button>

                        {expanded ? (
                          <div className="space-y-3 border-t border-line/60 p-4">
                            {reflectionFields.map((field) => {
                              const value = reflection[field.key]
                              if (!value) return null
                              return (
                                <div key={field.key}>
                                  <div className="text-[9.5px] font-medium uppercase tracking-[0.1em] text-faint">
                                    {field.label}
                                  </div>
                                  <p className="mt-1 whitespace-pre-wrap text-[12px] leading-5 text-white/75">
                                    {value}
                                  </p>
                                </div>
                              )
                            })}
                            <div className="flex items-center justify-between border-t border-line/50 pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setWeekStart(reflection.weekStart)
                                  setTab('review')
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                className="text-[11px] font-medium text-accent"
                              >
                                Load this week
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(reflection.id)}
                                className="flex items-center gap-1 text-[10.5px] text-faint transition-colors hover:text-red-300"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </Card>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        weekStart={weekStart}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteReflection(deleteId)
            showToast('Reflection deleted.', 'info')
          }
        }}
        title="Delete this reflection?"
        message="This weekly reflection will be permanently removed from this device."
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}

function SegmentTabs({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <SegmentedControl
      className="mt-4"
      options={[
        { value: 'analytics', label: 'Analytics' },
        { value: 'review', label: 'Review' },
      ]}
      value={tab}
      onChange={(value) => onChange(value as Tab)}
    />
  )
}
