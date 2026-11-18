import type { LucideIcon } from 'lucide-react'
import { cn } from '../utils/cn'

type Tone = 'accent' | 'azure' | 'warm' | 'plain'

const toneStyles: Record<Tone, { icon: string; value: string; iconBg: string }> = {
  accent: {
    icon: 'text-accent',
    value: 'text-white',
    iconBg: 'bg-accent/10 border-accent/15',
  },
  azure: {
    icon: 'text-azure',
    value: 'text-white',
    iconBg: 'bg-azure/10 border-azure/15',
  },
  warm: {
    icon: 'text-warning',
    value: 'text-white',
    iconBg: 'bg-warning/10 border-warning/15',
  },
  plain: {
    icon: 'text-muted',
    value: 'text-white',
    iconBg: 'bg-white/5 border-white/5',
  },
}

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  tone?: Tone
  className?: string
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'plain',
  className,
}: StatCardProps) {
  const styles = toneStyles[tone]
  return (
    <div
      className={cn(
        'min-w-0 rounded-2xl border border-line/80 bg-card p-3.5 hairline',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10.5px] font-medium uppercase tracking-[0.12em] text-faint">
          {label}
        </span>
        {Icon ? (
          <span
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border',
              styles.iconBg,
            )}
          >
            <Icon size={13} className={styles.icon} />
          </span>
        ) : null}
      </div>
      <div className={cn('mt-2 text-[21px] font-semibold leading-none tracking-tight tabular', styles.value)}>
        {value}
      </div>
      {hint ? <p className="mt-1.5 truncate text-[11px] text-faint">{hint}</p> : null}
    </div>
  )
}
