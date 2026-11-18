import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padded?: boolean
}

export function Card({ children, className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-line/80 bg-card hairline',
        padded && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-white">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs leading-5 text-faint">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
