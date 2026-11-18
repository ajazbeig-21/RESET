import { cn } from '../utils/cn'

export function BrandMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <rect x="0.5" y="0.5" width="31" height="31" rx="9.5" fill="#121316" stroke="#2A2D33" />
      <path
        d="M23.2 10.6a8.4 8.4 0 1 0 1.3 7.1"
        stroke="#34D399"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M23.9 6.9v4.3h-4.3"
        stroke="#34D399"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2.1" fill="#34D399" />
    </svg>
  )
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={compact ? 30 : 34} />
      <div className="leading-none">
        <div className="text-[13px] font-semibold tracking-[0.22em] text-white">RESET</div>
        {!compact ? (
          <div className="mt-1 text-[9.5px] font-medium uppercase tracking-[0.16em] text-faint">
            58 day challenge
          </div>
        ) : null}
      </div>
    </div>
  )
}
