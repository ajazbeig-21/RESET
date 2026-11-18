import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../utils/cn'

export const inputClass =
  'h-11 w-full rounded-xl border border-line bg-[#0b0c0f] px-3.5 text-sm text-white placeholder:text-faint outline-none transition-colors focus:border-accent/50 focus:ring-2 focus:ring-accent/10'

export const textareaClass =
  'w-full resize-none rounded-xl border border-line bg-[#0b0c0f] px-3.5 py-3 text-sm leading-6 text-white placeholder:text-faint outline-none transition-colors focus:border-accent/50 focus:ring-2 focus:ring-accent/10'

export function Field({
  label,
  hint,
  children,
  className,
  htmlFor,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[12px] font-medium tracking-wide text-muted"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] leading-4 text-faint">{hint}</p> : null}
    </div>
  )
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(textareaClass, className)} {...props} />
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(inputClass, 'appearance-none pr-10', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-faint"
      />
    </div>
  )
}
