import { Check } from 'lucide-react'
import { cn } from '../utils/cn'

export function CheckboxMark({
  checked,
  size = 'md',
  className,
}: {
  checked: boolean
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border transition-all duration-200',
        size === 'md' ? 'h-[26px] w-[26px]' : 'h-[22px] w-[22px]',
        checked
          ? 'border-accent bg-accent text-[#04140e] shadow-[0_0_18px_-4px_rgba(52,211,153,0.55)]'
          : 'border-line bg-[#0b0c0f] text-transparent',
        className,
      )}
      aria-hidden="true"
    >
      {checked ? (
        <Check
          size={size === 'md' ? 15 : 13}
          strokeWidth={3}
          className="animate-check"
        />
      ) : null}
    </span>
  )
}
