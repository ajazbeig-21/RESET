import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { WeekSummary } from '../types'

export function CategoryDonut({
  categories,
  overall,
}: {
  categories: WeekSummary['categoryStats']
  overall: number
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[132px] w-[132px] shrink-0">
        <svg viewBox="0 0 132 132" className="absolute inset-0">
          <circle
            cx="66"
            cy="66"
            r="51"
            fill="none"
            stroke="rgba(255,255,255,0.055)"
            strokeWidth="14"
          />
        </svg>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="percent"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={43}
              outerRadius={60}
              paddingAngle={3}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              animationDuration={600}
            >
              {categories.map((category) => (
                <Cell key={category.id} fill={category.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[20px] font-semibold leading-none tabular text-white">
            {overall}%
          </span>
          <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.14em] text-faint">
            week
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-[9px]">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[11.5px] text-muted">
              {category.label}
            </span>
            <span className="text-[11px] font-semibold tabular text-white">
              {category.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
