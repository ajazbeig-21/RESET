import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WeekSummary } from '../types'
import { formatShortDate } from '../utils/dateUtils'

type Day = WeekSummary['days'][number]

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: Day }>
}) {
  if (!active || !payload?.length) return null
  const day = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-elevated px-3 py-2 shadow-2xl">
      <div className="text-[11px] font-semibold text-white">
        {formatShortDate(day.date)} · {day.label}
      </div>
      {day.isOutside ? (
        <div className="mt-1 text-[10px] text-faint">Before the challenge</div>
      ) : (
        <>
          <div className="mt-1 text-[15px] font-semibold tabular text-accent">{day.percent}%</div>
          <div className="text-[10px] text-faint">
            {day.completed} of {day.total} habits
          </div>
        </>
      )}
    </div>
  )
}

export function WeeklyChart({ days }: { days: WeekSummary['days'] }) {
  return (
    <div className="h-[210px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={days} margin={{ top: 8, right: 2, left: -6, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#62666f', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tick={{ fill: '#4f535b', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.035)' }}
          />
          <Bar dataKey="percent" radius={[5, 5, 5, 5]} maxBarSize={28} minPointSize={3}>
            {days.map((day) => (
              <Cell
                key={day.date}
                fill={
                  day.isFuture || day.isOutside
                    ? '#202329'
                    : day.isToday
                      ? '#6EE7B7'
                      : day.percent >= 75
                        ? '#34D399'
                        : '#2BB98A'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
