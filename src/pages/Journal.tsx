import { useEffect, useMemo, useState } from 'react'
import {
  BookHeart,
  Check,
  ChevronDown,
  Lock,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Wind,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { MOODS } from '../data/defaults'
import type { JournalEntry, MoodId } from '../types'
import { formatLongDate } from '../utils/dateUtils'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/Modal'
import { Field, TextArea } from '../components/Form'
import { SegmentedControl } from '../components/SegmentedControl'
import { useToast } from '../components/Toast'
import { cn } from '../utils/cn'

type Tab = 'journal' | 'breathe'

const prompts: Array<{ key: keyof JournalDraft; label: string; placeholder: string }> = [
  {
    key: 'happened',
    label: 'What happened?',
    placeholder: 'Just the events, without judgement.',
  },
  {
    key: 'feeling',
    label: 'What am I feeling?',
    placeholder: 'Name the emotion. Where do you feel it in your body?',
  },
  {
    key: 'facts',
    label: 'What facts do I know?',
    placeholder: 'Only what is verifiably true.',
  },
  {
    key: 'assumptions',
    label: 'What assumptions am I making?',
    placeholder: 'What is my mind adding that may not be true?',
  },
  {
    key: 'control',
    label: 'What is within my control?',
    placeholder: 'Your response, your effort, your next action.',
  },
  {
    key: 'action',
    label: 'What action should I take?',
    placeholder: 'One small, concrete next step.',
  },
]

type JournalDraft = Pick<
  JournalEntry,
  'happened' | 'feeling' | 'facts' | 'assumptions' | 'control' | 'action'
>

const emptyDraft: JournalDraft = {
  happened: '',
  feeling: '',
  facts: '',
  assumptions: '',
  control: '',
  action: '',
}

function MoodPicker({
  value,
  onChange,
}: {
  value: MoodId | null
  onChange: (mood: MoodId) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {MOODS.map((mood) => {
        const selected = value === mood.id
        return (
          <button
            key={mood.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(mood.id)}
            className={cn(
              'flex h-[58px] flex-col items-center justify-center gap-1 rounded-xl border text-[9px] font-medium transition-all duration-150 active:scale-[0.97]',
              selected ? 'text-white' : 'border-line bg-white/[0.015] text-faint hover:text-muted',
            )}
            style={{
              flex: '0 0 calc(25% - 4.5px)',
              ...(selected
                ? {
                    borderColor: `${mood.color}55`,
                    backgroundColor: `${mood.color}18`,
                    color: mood.color,
                  }
                : {}),
            }}
          >
            <span className="text-[17px] leading-none">{mood.emoji}</span>
            {mood.label}
          </button>
        )
      })}
    </div>
  )
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale'

const phaseMeta: Record<Phase, { label: string; hint: string }> = {
  idle: { label: 'Ready', hint: 'Sit comfortably. Let your shoulders drop.' },
  inhale: { label: 'Breathe in', hint: 'Slowly through your nose.' },
  hold: { label: 'Hold', hint: 'Stay soft. Do not strain.' },
  exhale: { label: 'Breathe out', hint: 'Slowly through your mouth.' },
}

function BreathingExercise() {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [seconds, setSeconds] = useState(4)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    if (!running) return
    setPhase('inhale')
    setSeconds(4)
    let currentPhase: Phase = 'inhale'
    let remaining = 4
    const id = window.setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        if (currentPhase === 'inhale') currentPhase = 'hold'
        else if (currentPhase === 'hold') currentPhase = 'exhale'
        else {
          currentPhase = 'inhale'
          setCycles((value) => value + 1)
        }
        remaining = 4
        setPhase(currentPhase)
      }
      setSeconds(remaining)
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const stop = () => {
    setRunning(false)
    setPhase('idle')
    setSeconds(4)
  }

  const scale = phase === 'inhale' || phase === 'hold' ? 1.22 : phase === 'exhale' ? 0.88 : 1
  const transition =
    phase === 'inhale' || phase === 'exhale' ? 'transform 4s linear' : 'transform 0.4s ease'

  return (
    <div className="mt-4 space-y-3">
      <Card className="overflow-hidden p-5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.15em] text-faint">
          <Wind size={12} className="text-accent" />
          4 · 4 · 4 breathing
        </div>

        <div className="relative mx-auto mt-6 flex h-[272px] w-[272px] items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-accent/[0.06]" />
          <div className="absolute inset-5 rounded-full border border-accent/[0.08]" />
          <div className="absolute inset-10 rounded-full border border-accent/[0.1]" />
          <div
            className="flex h-[168px] w-[168px] flex-col items-center justify-center rounded-full border border-accent/25"
            style={{
              transform: `scale(${scale})`,
              transition,
              background:
                'radial-gradient(circle at 50% 32%, rgba(52,211,153,0.26), rgba(52,211,153,0.07) 58%, rgba(8,9,11,0.15) 78%)',
              boxShadow: '0 0 70px -12px rgba(52,211,153,0.35)',
            }}
          >
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-accent">
              {phaseMeta[phase].label}
            </span>
            <span className="mt-1 text-[40px] font-semibold leading-none tabular text-white">
              {running ? seconds : 4}
            </span>
          </div>
        </div>

        <p className="mx-auto mt-2 max-w-[240px] text-[11px] leading-5 text-muted">
          {phaseMeta[phase].hint}
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <Button
            variant={running ? 'secondary' : 'primary'}
            size="lg"
            onClick={running ? stop : () => setRunning(true)}
            className="min-w-[132px]"
          >
            {running ? <Square size={14} /> : <Play size={14} />}
            {running ? 'Stop' : 'Begin'}
          </Button>
          <button
            type="button"
            aria-label="Reset breathing cycle count"
            onClick={() => {
              stop()
              setCycles(0)
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line text-faint transition-colors hover:text-white"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="mt-4 border-t border-line/50 pt-3 text-[10px] text-faint">
          {cycles} cycle{cycles === 1 ? '' : 's'} completed
          {running ? ' · in session' : ''}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-[10px] font-medium uppercase tracking-[0.13em] text-faint">
          How to use it
        </div>
        <div className="mt-2.5 space-y-2">
          {[
            'Inhale for 4 seconds.',
            'Hold gently for 4 seconds.',
            'Exhale for 4 seconds.',
            'Repeat until your body feels quieter.',
          ].map((line, index) => (
            <div key={line} className="flex gap-2.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[8px] font-semibold text-muted">
                {index + 1}
              </span>
              <span className="text-[10.5px] leading-4 text-faint">{line}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function JournalEntryCard({
  entry,
  onDelete,
}: {
  entry: JournalEntry
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const mood = MOODS.find((item) => item.id === entry.mood) ?? MOODS[0]
  const preview =
    entry.feeling || entry.happened || entry.control || entry.action || 'A quiet entry.'

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[16px]"
              style={{
                backgroundColor: `${mood.color}12`,
                borderColor: `${mood.color}26`,
              }}
            >
              {mood.emoji}
            </span>
            <div className="min-w-0">
              <div className="text-[11.5px] font-medium" style={{ color: mood.color }}>
                {mood.label}
              </div>
              <div className="mt-0.5 text-[9.5px] text-faint">
                {formatLongDate(entry.date)}
              </div>
            </div>
          </div>
          <ChevronDown
            size={15}
            className={cn('mt-1 shrink-0 text-faint transition-transform', open && 'rotate-180')}
          />
        </div>
        <p className="mt-2 line-clamp-2 text-[11.5px] leading-5 text-white/65">{preview}</p>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-line/60 p-4">
          {prompts.map((prompt) => {
            const value = entry[prompt.key]
            if (!value) return null
            return (
              <div key={prompt.key}>
                <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-faint">
                  {prompt.label}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[12px] leading-5 text-white/75">
                  {value}
                </p>
              </div>
            )
          })}
          <div className="flex items-center justify-between border-t border-line/50 pt-3">
            <span className="text-[9px] text-faint">
              {new Date(entry.createdAt).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 text-[10px] text-faint transition-colors hover:text-red-300"
            >
              <Trash2 size={11} /> Delete entry
            </button>
          </div>
        </div>
      ) : null}
    </Card>
  )
}

export default function Journal() {
  const { today, journals, addJournal, deleteJournal } = useApp()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('journal')
  const [mood, setMood] = useState<MoodId | null>(null)
  const [draft, setDraft] = useState<JournalDraft>(emptyDraft)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  const sortedJournals = useMemo(
    () => [...journals].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [journals],
  )

  const handleSave = () => {
    if (!mood) {
      showToast('Choose a mood first.', 'error')
      return
    }
    addJournal({
      date: today,
      mood,
      ...draft,
    })
    setMood(null)
    setDraft(emptyDraft)
    showToast('Reflection saved privately.')
  }

  return (
    <div>
      <header>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-faint">
              Private & on-device
            </div>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
              Reset space
            </h1>
            <p className="mt-1.5 text-[12px] leading-5 text-muted">
              Put the noise down. Separate facts from feelings.
            </p>
          </div>
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-card text-faint">
            <Lock size={15} />
          </span>
        </div>
      </header>

      <SegmentedControl
        className="mt-4"
        options={[
          { value: 'journal', label: 'Journal' },
          { value: 'breathe', label: 'Breathe' },
        ]}
        value={tab}
        onChange={(value) => setTab(value as Tab)}
      />

      {tab === 'journal' ? (
        <div className="mt-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <BookHeart size={15} />
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-white">
                    How are you feeling?
                  </div>
                  <div className="text-[10px] text-faint">{formatLongDate(today)}</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <MoodPicker value={mood} onChange={setMood} />
            </div>

            <div className="mt-5 space-y-4">
              {prompts.map((prompt, index) => (
                <Field
                  key={prompt.key}
                  label={`${index + 1}. ${prompt.label}`}
                  htmlFor={`journal-${prompt.key}`}
                >
                  <TextArea
                    id={`journal-${prompt.key}`}
                    value={draft[prompt.key]}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [prompt.key]: event.target.value,
                      }))
                    }
                    placeholder={prompt.placeholder}
                    rows={2}
                    maxLength={5000}
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
              disabled={!mood}
            >
              Save reflection
            </Button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-faint">
              <Lock size={10} /> Saved locally · never uploaded
            </p>
          </Card>

          <div className="mb-3 mt-7 flex items-end justify-between">
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-white">
                Previous entries
              </h2>
              <p className="mt-0.5 text-[11px] text-faint">
                {sortedJournals.length} private reflection
                {sortedJournals.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {sortedJournals.length === 0 ? (
            <Card className="p-6 text-center">
              <BookHeart size={20} className="mx-auto text-faint" />
              <p className="mt-2 text-[12px] font-medium text-white">Nothing here yet</p>
              <p className="mx-auto mt-1 max-w-[260px] text-[10.5px] leading-5 text-faint">
                Save your first emotional reset above. Only you can see it.
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {sortedJournals.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={() => setEntryToDelete(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <BreathingExercise />
      )}

      <ConfirmDialog
        open={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (entryToDelete) {
            deleteJournal(entryToDelete)
            showToast('Journal entry deleted.', 'info')
          }
        }}
        title="Delete this entry?"
        message="This private reflection will be permanently removed from this device."
        confirmLabel="Delete entry"
        destructive
      />

      <div className="mt-7 flex items-center justify-between border-t border-line/50 pt-5 text-[10px] text-faint">
        <span className="flex items-center gap-1.5">
          <Check size={11} className="text-accent" /> Stored only on this device
        </span>
        <span>Only visible on this device.</span>
      </div>
    </div>
  )
}
