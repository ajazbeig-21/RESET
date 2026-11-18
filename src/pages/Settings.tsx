import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  BookHeart,
  ChevronRight,
  Download,
  HardDrive,
  Pencil,
  Plus,
  RotateCcw,
  Share,
  Smartphone,
  Trash2,
  Upload,
  WifiOff,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { CATEGORIES } from '../data/defaults'
import type { CategoryId, Habit } from '../types'
import {
  downloadJson,
  getBackupFilename,
  getBackupSummary,
  parseBackupFile,
  type ParsedBackup,
} from '../utils/exportUtils'
import { diffDaysKey, formatMediumDate, isValidDateKey } from '../utils/dateUtils'
import {
  clearInstallPrompt,
  getInstallPrompt,
  isStandalone,
  subscribeInstallPrompt,
} from '../utils/installPrompt'
import { Button } from '../components/Button'
import { Card, SectionHeader } from '../components/Card'
import { ConfirmDialog, Modal } from '../components/Modal'
import { Field, Select, TextArea, TextInput, inputClass } from '../components/Form'
import { useToast } from '../components/Toast'
import { cn } from '../utils/cn'

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative h-6 w-10 shrink-0 rounded-full border transition-colors duration-200',
        checked ? 'border-accent/40 bg-accent' : 'border-line bg-white/[0.06]',
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all duration-200',
          checked ? 'left-[21px]' : 'left-[3px]',
        )}
      />
    </button>
  )
}

function HabitFormModal({
  open,
  habit,
  onClose,
  onSave,
}: {
  open: boolean
  habit: Habit | null
  onClose: () => void
  onSave: (input: {
    name: string
    description?: string
    category: CategoryId
    targetLabel?: string
    enabled: boolean
  }) => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<CategoryId>('discipline')
  const [targetLabel, setTargetLabel] = useState('')
  const [description, setDescription] = useState('')
  const [enabled, setEnabled] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    if (!open) return
    setName(habit?.name ?? '')
    setCategory(habit?.category ?? 'discipline')
    setTargetLabel(habit?.targetLabel ?? '')
    setDescription(habit?.description ?? '')
    setEnabled(habit?.enabled ?? true)
  }, [open, habit])

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Give the habit a name first.', 'error')
      return
    }
    onSave({
      name,
      description,
      category,
      targetLabel,
      enabled,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={habit ? 'Edit habit' : 'Add habit'}
      description={
        habit?.kind === 'salah'
          ? 'This habit tracks the five daily prayers individually.'
          : 'Custom habits are simple daily checkboxes.'
      }
      footer={
        <Button variant="primary" size="lg" full onClick={handleSave}>
          {habit ? 'Save habit' : 'Add habit'}
        </Button>
      }
    >
      <div className="space-y-4 pb-2">
        <Field label="Name" htmlFor="habit-name">
          <TextInput
            id="habit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Morning walk"
            maxLength={80}
          />
        </Field>
        <Field label="Category" htmlFor="habit-category">
          <Select
            id="habit-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as CategoryId)}
          >
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Target label"
          htmlFor="habit-target"
          hint="Optional. Shown under the habit, e.g. 45 min or 8,000 steps."
        >
          <TextInput
            id="habit-target"
            value={targetLabel}
            onChange={(event) => setTargetLabel(event.target.value)}
            placeholder="Optional"
            maxLength={40}
          />
        </Field>
        <Field label="Description" htmlFor="habit-description" hint="Optional context.">
          <TextArea
            id="habit-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            maxLength={160}
          />
        </Field>
        <div className="flex items-center justify-between rounded-xl border border-line/70 bg-white/[0.02] px-3.5 py-3">
          <div>
            <div className="text-[12px] font-medium text-white">Enabled</div>
            <div className="mt-0.5 text-[10px] text-faint">
              Disabled habits are hidden from scoring.
            </div>
          </div>
          <Switch
            checked={enabled}
            onChange={() => setEnabled((value) => !value)}
            label="Toggle habit"
          />
        </div>
      </div>
    </Modal>
  )
}

function InstallCard() {
  const { showToast } = useToast()
  const [installEvent, setInstallEvent] = useState(() => getInstallPrompt())
  const [installed, setInstalled] = useState(() => isStandalone())
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    )
    return subscribeInstallPrompt(() => {
      setInstallEvent(getInstallPrompt())
      setInstalled(isStandalone())
    })
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice
      clearInstallPrompt()
      setInstallEvent(null)
      if (choice.outcome === 'accepted') {
        showToast('RESET is being installed.')
      } else {
        showToast('Installation dismissed.', 'info')
      }
    } catch {
      showToast('Could not open the install prompt.', 'error')
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-accent/10 text-accent">
          <Smartphone size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-white">Install RESET</h3>
            {installed ? (
              <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide text-accent">
                Installed
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            Run it full screen from your home screen. Works offline after the first load.
          </p>
        </div>
      </div>

      {installEvent && !installed ? (
        <Button variant="primary" size="md" full className="mt-4" onClick={handleInstall}>
          <Download size={15} />
          Install app
        </Button>
      ) : null}

      <div className="mt-4 space-y-2.5">
        <div className="flex gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-[9.5px] font-semibold text-muted">
            1
          </span>
          <p className="text-[10.5px] leading-4 text-faint">
            {isIOS
              ? 'iPhone / iPad: open this page in Safari, tap Share, then Add to Home Screen.'
              : 'iPhone / iPad: open in Safari → Share → Add to Home Screen.'}
          </p>
        </div>
        <div className="flex gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-[9.5px] font-semibold text-muted">
            2
          </span>
          <p className="text-[10.5px] leading-4 text-faint">
            Android: Chrome menu (⋮) → Install app or Add to Home screen.
          </p>
        </div>
        <div className="flex gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-[9.5px] font-semibold text-muted">
            3
          </span>
          <p className="text-[10.5px] leading-4 text-faint">
            Desktop: use the install icon in the address bar.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-line/60 bg-white/[0.02] px-3 py-2.5">
        <WifiOff size={13} className="text-accent" />
        <span className="text-[10px] leading-4 text-faint">
          Offline-ready. No cloud, no account, no tracking.
        </span>
      </div>
    </Card>
  )
}

export default function Settings() {
  const {
    settings,
    habits,
    dailyLogs,
    weightLogs,
    reflections,
    journals,
    updateSettings,
    updateHabit,
    addHabit,
    deleteHabit,
    exportData,
    importData,
    resetAll,
  } = useApp()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    challengeStart: settings.challengeStart,
    challengeEnd: settings.challengeEnd,
    startingWeight: String(settings.startingWeight),
    targetWeight: String(settings.targetWeight),
    stepTarget: String(settings.stepTarget),
    waterTarget: String(settings.waterTarget),
  })
  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<ParsedBackup | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm({
      challengeStart: settings.challengeStart,
      challengeEnd: settings.challengeEnd,
      startingWeight: String(settings.startingWeight),
      targetWeight: String(settings.targetWeight),
      stepTarget: String(settings.stepTarget),
      waterTarget: String(settings.waterTarget),
    })
  }, [settings])

  const trackedDays =
    isValidDateKey(form.challengeStart) && isValidDateKey(form.challengeEnd)
      ? Math.max(0, diffDaysKey(form.challengeEnd, form.challengeStart))
      : 0

  const summary = {
    days: Object.keys(dailyLogs).length,
    habits: habits.length,
    weights: weightLogs.length,
    reflections: reflections.length,
    journals: journals.length,
  }

  const handleSaveSettings = () => {
    const startingWeight = Number(form.startingWeight)
    const targetWeight = Number(form.targetWeight)
    const stepTarget = Number(form.stepTarget)
    const waterTarget = Number(form.waterTarget)

    if (!isValidDateKey(form.challengeStart) || !isValidDateKey(form.challengeEnd)) {
      showToast('Choose valid challenge dates.', 'error')
      return
    }
    if (trackedDays < 1) {
      showToast('The end date must be after the start date.', 'error')
      return
    }
    if (
      !Number.isFinite(startingWeight) ||
      startingWeight < 20 ||
      startingWeight > 400 ||
      !Number.isFinite(targetWeight) ||
      targetWeight < 20 ||
      targetWeight > 400
    ) {
      showToast('Weights must be between 20 and 400 kg.', 'error')
      return
    }
    if (targetWeight >= startingWeight) {
      showToast('Target weight should be below your starting weight.', 'error')
      return
    }
    if (!Number.isFinite(stepTarget) || stepTarget < 1000 || stepTarget > 100000) {
      showToast('Step target must be between 1,000 and 100,000.', 'error')
      return
    }
    if (!Number.isFinite(waterTarget) || waterTarget < 0.5 || waterTarget > 20) {
      showToast('Water target must be between 0.5 and 20 litres.', 'error')
      return
    }

    updateSettings({
      challengeStart: form.challengeStart,
      challengeEnd: form.challengeEnd,
      startingWeight,
      targetWeight,
      stepTarget,
      waterTarget,
    })
    showToast(`Challenge saved · ${trackedDays} tracked days.`)
  }

  const handleExport = () => {
    downloadJson(exportData(), getBackupFilename())
    showToast('Backup exported.')
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const parsed = parseBackupFile(text)
      setPendingImport(parsed)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'That backup could not be read.',
        'error',
      )
    }
  }

  const pendingSummary = pendingImport ? getBackupSummary(pendingImport.data) : null

  return (
    <div>
      <header>
        <div className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-faint">
          Your system
        </div>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">Settings</h1>
        <p className="mt-1.5 text-[12px] leading-5 text-muted">
          Tune the challenge. Everything stays on this device.
        </p>
      </header>

      <div className="mt-7">
        <SectionHeader
          title="Challenge"
          subtitle="Dates, targets and measurements"
        />
        <Card className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" htmlFor="challenge-start">
              <input
                id="challenge-start"
                type="date"
                value={form.challengeStart}
                onChange={(event) =>
                  setForm((current) => ({ ...current, challengeStart: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="End date" htmlFor="challenge-end">
              <input
                id="challenge-end"
                type="date"
                value={form.challengeEnd}
                onChange={(event) =>
                  setForm((current) => ({ ...current, challengeEnd: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-line/60 bg-white/[0.02] px-3.5 py-2.5">
            <span className="text-[10.5px] text-faint">
              Tracked days from start to the day before the end date
            </span>
            <span className="text-[12px] font-semibold tabular text-accent">{trackedDays}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Starting weight (kg)" htmlFor="starting-weight">
              <TextInput
                id="starting-weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={form.startingWeight}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startingWeight: event.target.value }))
                }
              />
            </Field>
            <Field label="Target weight (kg)" htmlFor="target-weight">
              <TextInput
                id="target-weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={form.targetWeight}
                onChange={(event) =>
                  setForm((current) => ({ ...current, targetWeight: event.target.value }))
                }
              />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Step target" htmlFor="step-target">
              <TextInput
                id="step-target"
                type="number"
                inputMode="numeric"
                step="500"
                value={form.stepTarget}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stepTarget: event.target.value }))
                }
              />
            </Field>
            <Field label="Water target (L)" htmlFor="water-target">
              <TextInput
                id="water-target"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={form.waterTarget}
                onChange={(event) =>
                  setForm((current) => ({ ...current, waterTarget: event.target.value }))
                }
              />
            </Field>
          </div>

          <Button variant="primary" size="lg" full className="mt-4" onClick={handleSaveSettings}>
            Save challenge settings
          </Button>
          <p className="mt-2 text-center text-[10px] leading-4 text-faint">
            Changing dates recalculates your challenge day. Existing logs are never deleted.
          </p>
        </Card>
      </div>

      <div className="mt-7">
        <SectionHeader
          title="Habits"
          subtitle={`${habits.filter((habit) => habit.enabled).length} active · ${
            habits.length
          } total`}
          action={
            <Button
              size="sm"
              variant="subtle"
              onClick={() => {
                setEditingHabit(null)
                setHabitModalOpen(true)
              }}
            >
              <Plus size={14} />
              Add
            </Button>
          }
        />
        <Card className="overflow-hidden p-0">
          {habits.length === 0 ? (
            <div className="p-5 text-center text-[11px] text-faint">
              No habits yet. Add one to get started.
            </div>
          ) : (
            <div className="divide-y divide-line-soft">
              {[...habits]
                .sort((a, b) => a.order - b.order)
                .map((habit) => {
                  const category = CATEGORIES.find((item) => item.id === habit.category)
                  return (
                    <div key={habit.id} className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: category?.color ?? '#62666f' }}
                        />
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <span
                            className={cn(
                              'truncate text-[12.5px] font-medium',
                              habit.enabled ? 'text-white' : 'text-white/45',
                            )}
                          >
                            {habit.name}
                          </span>
                          {habit.kind === 'salah' ? (
                            <span className="shrink-0 rounded border border-accent/20 bg-accent/[0.07] px-1 py-0.5 text-[7.5px] font-semibold uppercase tracking-wide text-accent">
                              5 prayers
                            </span>
                          ) : null}
                        </div>
                        <Switch
                          checked={habit.enabled}
                          onChange={() =>
                            updateHabit(habit.id, {
                              name: habit.name,
                              description: habit.description,
                              category: habit.category,
                              targetLabel: habit.targetLabel,
                              enabled: !habit.enabled,
                            })
                          }
                          label={`Toggle ${habit.name}`}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2 pl-4">
                        <div className="min-w-0 truncate text-[9.5px] text-faint">
                          {category?.label}
                          {habit.targetLabel ? ` · ${habit.targetLabel}` : ''}
                          {!habit.enabled ? ' · paused' : ''}
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            aria-label={`Edit ${habit.name}`}
                            onClick={() => {
                              setEditingHabit(habit)
                              setHabitModalOpen(true)
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-faint transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${habit.name}`}
                            onClick={() => setHabitToDelete(habit)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-faint transition-colors hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </Card>
        <p className="mt-2 px-1 text-[10px] leading-4 text-faint">
          Disabled habits are excluded from the daily score, weekly analytics and streaks.
        </p>
      </div>

      <div className="mt-7">
        <SectionHeader title="Private space" />
        <Link
          to="/journal"
          className="flex items-center gap-3 rounded-2xl border border-line/80 bg-card p-4 transition-colors hover:bg-white/[0.02]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <BookHeart size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-medium text-white">Reset space</div>
            <div className="mt-0.5 text-[10.5px] text-faint">
              Emotional journal & 4-4-4 breathing
            </div>
          </div>
          <ChevronRight size={16} className="text-faint" />
        </Link>
      </div>

      <div className="mt-7">
        <SectionHeader
          title="Data & backup"
          subtitle="Local-first. Export before clearing browser data."
        />
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-4 divide-x divide-line-soft border-b border-line-soft">
            <div className="px-2 py-2.5 text-center">
              <div className="text-[14px] font-semibold tabular text-white">{summary.days}</div>
              <div className="mt-0.5 text-[8px] uppercase tracking-wide text-faint">Days</div>
            </div>
            <div className="px-2 py-2.5 text-center">
              <div className="text-[14px] font-semibold tabular text-white">{summary.habits}</div>
              <div className="mt-0.5 text-[8px] uppercase tracking-wide text-faint">Habits</div>
            </div>
            <div className="px-2 py-2.5 text-center">
              <div className="text-[14px] font-semibold tabular text-white">{summary.weights}</div>
              <div className="mt-0.5 text-[8px] uppercase tracking-wide text-faint">Weights</div>
            </div>
            <div className="px-2 py-2.5 text-center">
              <div className="text-[14px] font-semibold tabular text-white">
                {summary.journals}
              </div>
              <div className="mt-0.5 text-[8px] uppercase tracking-wide text-faint">Journals</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="flex w-full items-center gap-3 border-b border-line-soft p-4 text-left transition-colors hover:bg-white/[0.02]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted">
              <Download size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-medium text-white">Export all data</span>
              <span className="mt-0.5 block text-[10px] text-faint">
                JSON backup of logs, habits, goals and journals
              </span>
            </span>
            <ChevronRight size={15} className="text-faint" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 border-b border-line-soft p-4 text-left transition-colors hover:bg-white/[0.02]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted">
              <Upload size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-medium text-white">Import a backup</span>
              <span className="mt-0.5 block text-[10px] text-faint">
                Restore a previously exported RESET JSON file
              </span>
            </span>
            <ChevronRight size={15} className="text-faint" />
          </button>

          <div className="flex items-center gap-3 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted">
              <HardDrive size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-white">Stored on this device</div>
              <div className="mt-0.5 text-[10px] leading-4 text-faint">
                {summary.reflections} reflections · version 1 schema · no cloud copy
              </div>
            </div>
          </div>
        </Card>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          className="hidden"
        />

        <Card className="mt-3 border-red-500/15 bg-red-500/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-red-200">
                <RotateCcw size={13} /> Reset application
              </div>
              <p className="mt-1 text-[10px] leading-4 text-faint">
                Deletes all local data and restores the default challenge.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setResetOpen(true)}>
              Reset
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-7">
        <SectionHeader title="Install app" subtitle="Full screen, offline, no account" />
        <InstallCard />
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-line/50 pt-5 text-[10px] text-faint">
        <span className="flex items-center gap-1.5">
          <Share size={11} /> RESET v1.0.0
        </span>
        <span>Private by design.</span>
      </div>

      <HabitFormModal
        open={habitModalOpen}
        habit={editingHabit}
        onClose={() => {
          setHabitModalOpen(false)
          setEditingHabit(null)
        }}
        onSave={(input) => {
          if (editingHabit) {
            updateHabit(editingHabit.id, input)
            showToast('Habit updated.')
          } else {
            addHabit(input)
            showToast('Habit added.')
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(habitToDelete)}
        onClose={() => setHabitToDelete(null)}
        onConfirm={() => {
          if (habitToDelete) {
            deleteHabit(habitToDelete.id)
            showToast('Habit deleted.', 'info')
          }
        }}
        title="Delete this habit?"
        message={
          habitToDelete?.kind === 'salah'
            ? 'Deleting the Salah habit also removes all logged prayer checks from your history. You may prefer to pause it instead.'
            : `"${habitToDelete?.name ?? 'This habit'}" and its history will be removed from every day. You may prefer to pause it instead.`
        }
        confirmLabel="Delete habit"
        destructive
      />

      <ConfirmDialog
        open={Boolean(pendingImport)}
        onClose={() => setPendingImport(null)}
        onConfirm={() => {
          if (!pendingImport) return
          importData(pendingImport.data)
          showToast('Backup imported.')
        }}
        title="Replace data with this backup?"
        message={
          pendingImport && pendingSummary ? (
            <div className="space-y-2">
              <p>
                Importing replaces everything currently stored on this device with the backup.
              </p>
              <div className="rounded-xl border border-line/70 bg-white/[0.02] px-3 py-2.5 text-[11px] leading-5 text-muted">
                {pendingSummary.daysLogged} days logged · {pendingSummary.habits} habits ·{' '}
                {pendingSummary.weights} weights · {pendingSummary.reflections} reflections ·{' '}
                {pendingSummary.journals} journals
                {pendingImport.exportedAt &&
                isValidDateKey(pendingImport.exportedAt.slice(0, 10)) ? (
                  <span className="mt-1 block text-[10px] text-faint">
                    Exported {formatMediumDate(pendingImport.exportedAt.slice(0, 10))}
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            'Importing replaces all data on this device.'
          )
        }
        confirmLabel="Import backup"
      />

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetAll()
          showToast('RESET restored to defaults.', 'info')
        }}
        title="Reset everything?"
        message="This permanently deletes every habit log, weight entry, goal, weekly reflection and journal on this device. Export a backup first if you may need it."
        confirmLabel="Reset all data"
        destructive
      />
    </div>
  )
}
