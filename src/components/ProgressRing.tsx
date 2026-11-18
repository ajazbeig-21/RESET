import { useId, type ReactNode } from 'react'
import { cn } from '../utils/cn'

interface ProgressRingProps {
  percent: number
  size?: number
  stroke?: number
  children?: ReactNode
  className?: string
  color?: string
  trackColor?: string
  ariaLabel?: string
}

export function ProgressRing({
  percent,
  size = 116,
  stroke = 9,
  children,
  className,
  color = '#34D399',
  trackColor = 'rgba(255,255,255,0.065)',
  ariaLabel,
}: ProgressRingProps) {
  const gradientId = useId()
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safePercent / 100) * circumference

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={safePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${safePercent}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
