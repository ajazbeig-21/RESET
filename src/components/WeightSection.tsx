import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Plus, Scale, Trash2, TrendingDown } from 'lucide-react'
import { useApp } from '../store/AppStore'
import { getWeightStats } from '../utils/analytics'
import { formatMediumDate, todayKey } from '../utils/dateUtils'
import { Button } from './Button'
import { Card } from './Card'
import { ConfirmDialog, Modal } from './Modal'
import { Field, TextInput, inputClass } from './Form'
import { useToast } from './Toast'

export function WeightSection({ list = true }: { list?: boolean }) {
  const { settings, weightLogs, addWeight, deleteWeight } = useApp()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(todayKey())
  const [weight, setWeight] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const stats = useMemo(() => getWeightStats(weightLogs, settings), [settings, weightLogs])

  const chartData = useMemo(
    () =>
      stats.sorted.map((entry) => ({
        date: entry.date,
        weight: entry.weight,
      })),
    [stats.sorted],
  )

  const domain = useMemo((): [number, number] => {
    const values = [
      settings.startingWeight,
      settings.targetWeight,
      ...chartData.map((entry) => entry.weight),
      stats.current,
    ]
    const min = Math.min(...values)
    const max = Math.max(...values)
    return [Math.floor(min - 1), Math.ceil(max + 1)]
  }, [chartData, settings.startingWeight, settings.targetWeight, stats.current])

  useEffect(() => {
    if (!open) return
    const existing = weightLogs.find((entry) => entry.date === date)
    setWeight(existing ? String(existing.weight) : '')
  }, [date, open, weightLogs])

  const openAdd = () => {
    setDate(todayKey())
    setWeight('')
    setOpen(true)
  }

  const handleSave = () => {
    const value = Number(weight)
    if (!weight || !Number.isFinite(value) || value < 20 || value > 400) {
      showToast('Enter a weight between 20 and 400 kg.', 'error')
      return
    }
    if (date > todayKey()) {
      showToast('You cannot log a future date.', 'error')
      return
    }
    addWeight(date, value)
    setOpen(false)
    showToast('Weight saved.')
  }

  const sortedDesc = [...stats.sorted].reverse()
  const weightEntries = list ? sortedDesc.slice(0, 8) : []

  return (
    <>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.15em] text-faint">
              <Scale size={11} className="text-accent" />
              Current weight
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[34px] font-semibold leading-none tracking-tight tabular text-white">
                {stats.current}
              </span>
              <span className="text-[13px] text-muted">kg</span>
            </div>
          </div>
          <Button size="sm" variant="subtle" onClick={openAdd}>
            <Plus size={14} />
            Log weight
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
            <div className="text-[9px] uppercase tracking-[0.1em] text-faint">Start</div>
            <div className="mt-1 text-[13px] font-semibold tabular text-white">
              {settings.startingWeight} kg
            </div>
          </div>
          <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
            <div className="text-[9px] uppercase tracking-[0.1em] text-faint">Lost</div>
            <div className="mt-1 flex items-center gap-1 text-[13px] font-semibold tabular text-accent">
              {stats.lost > 0 ? <TrendingDown size={12} /> : null}
              {Math.abs(stats.lost).toFixed(1)} kg
            </div>
          </div>
          <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
            <div className="text-[9px] uppercase tracking-[0.1em] text-faint">To go</div>
            <div className="mt-1 text-[13px] font-semibold tabular text-azure">
              {stats.remaining.toFixed(1)} kg
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-faint">
            <span className="tabular">{settings.startingWeight} kg</span>
            <span className="tabular text-muted">{stats.progress}% to goal</span>
            <span className="tabular">{settings.targetWeight} kg</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-strong to-accent transition-[width] duration-700"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 h-[210px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value: string) => formatMediumDate(value)}
                  tick={{ fill: '#62666f', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                />
                <YAxis
                  domain={domain}
                  tick={{ fill: '#62666f', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                  tickFormatter={(value: number) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#17191d',
                    border: '1px solid #2a2d33',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#fff',
                  }}
                  labelFormatter={(value) => formatMediumDate(String(value))}
                  formatter={(value) => [`${value} kg`, 'Weight']}
                />
                <ReferenceLine
                  y={settings.targetWeight}
                  stroke="#60A5FA"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#34D399"
                  strokeWidth={2.5}
                  fill="url(#weightFill)"
                  dot={{ r: 3, fill: '#08090B', stroke: '#34D399', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#34D399', stroke: '#08090B', strokeWidth: 2 }}
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line/80 bg-white/[0.012] text-center">
              <Scale size={22} className="text-faint" />
              <p className="text-[12px] font-medium text-muted">No weight entries yet</p>
              <p className="max-w-[240px] text-[10.5px] leading-4 text-faint">
                Log your weight whenever you want. The trend uses only the entries you make.
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-accent" /> Weight
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 border-t border-dashed border-azure" /> Target{' '}
            {settings.targetWeight} kg
          </span>
          <span>{weightLogs.length} entries</span>
        </div>
      </Card>

      {list && weightEntries.length > 0 ? (
        <Card className="mt-3 p-2">
          <div className="px-3 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-[0.13em] text-faint">
            Recent entries
          </div>
          <div className="divide-y divide-line-soft">
            {weightEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <div>
                  <div className="text-[12.5px] font-medium text-white">
                    {formatMediumDate(entry.date)}
                  </div>
                  <div className="text-[10px] text-faint">{entry.date}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold tabular text-white">
                    {entry.weight} kg
                  </span>
                  <button
                    type="button"
                    aria-label={`Delete weight for ${entry.date}`}
                    onClick={() => setDeleteId(entry.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={weightLogs.some((entry) => entry.date === date) ? 'Update weight' : 'Log weight'}
        description="Weight is tracked separately from habits. It is never assumed."
        footer={
          <Button variant="primary" size="lg" full onClick={handleSave}>
            Save weight
          </Button>
        }
      >
        <div className="space-y-4 pb-2">
          <Field label="Date" htmlFor="weight-date">
            <input
              id="weight-date"
              type="date"
              value={date}
              max={todayKey()}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Weight (kg)" htmlFor="weight-value" hint="One decimal place is enough.">
            <TextInput
              id="weight-value"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="20"
              max="400"
              placeholder="e.g. 83.4"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </Field>
          <div className="rounded-xl border border-line/70 bg-white/[0.02] px-3.5 py-3 text-[11px] leading-5 text-muted">
            Starting weight {settings.startingWeight} kg · Target {settings.targetWeight} kg. Progress
            is calculated only from logged entries.
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteWeight(deleteId)
          showToast('Weight entry removed.', 'info')
        }}
        title="Delete weight entry?"
        message="This entry will be removed from your weight history. Other data is unaffected."
        confirmLabel="Delete"
        destructive
      />
    </>
  )
}
