import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-[#04140e] font-semibold shadow-[0_10px_30px_-12px_rgba(52,211,153,0.65)] hover:bg-[#4ade80] active:bg-[#2fbd89]',
  secondary:
    'bg-elevated text-white border border-line hover:border-line hover:bg-[#1c1e23] active:bg-[#15171b]',
  ghost: 'text-muted hover:text-white hover:bg-white/[0.05] active:bg-white/[0.08]',
  danger:
    'bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/15 active:bg-red-500/20',
  subtle:
    'bg-white/[0.055] text-white/90 border border-white/[0.055] hover:bg-white/[0.09]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 rounded-xl text-[13px] gap-1.5',
  md: 'h-11 px-4 rounded-xl text-sm gap-2',
  lg: 'h-12 px-5 rounded-2xl text-[15px] gap-2',
  icon: 'h-11 w-11 rounded-xl justify-center',
  'icon-sm': 'h-9 w-9 rounded-lg justify-center',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  full = false,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.985]',
        variants[variant],
        sizes[size],
        full && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
