import { cn } from '../utils/cn'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Array<Option<T>>
  value: T
  onChange: (value: T) => void
  className?: string
  size?: 'sm' | 'md'
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'flex w-full rounded-xl border border-line/80 bg-[#0b0c0f] p-1',
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-lg font-medium transition-all duration-200',
              size === 'md' ? 'h-9 text-[13px]' : 'h-8 text-xs',
              active
                ? 'bg-elevated text-white shadow-sm ring-1 ring-white/[0.06]'
                : 'text-faint hover:text-muted',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
