import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  bodyClassName?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
  bodyClassName,
}: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    const timer = window.setTimeout(() => panelRef.current?.focus(), 30)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
      window.clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-[6px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-line bg-panel shadow-2xl outline-none animate-sheet-in md:animate-scale-in md:rounded-3xl',
          wide ? 'md:max-w-2xl' : 'md:max-w-[560px]',
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 md:px-6 md:pt-6">
          <div className="min-w-0">
            {title ? (
              <h2
                id={titleId}
                className="text-[17px] font-semibold tracking-tight text-white"
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-[13px] leading-5 text-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-faint transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-6', bodyClassName)}>
          {children}
        </div>
        {footer ? (
          <div className="border-t border-line/70 bg-panel/95 px-5 py-4 safe-bottom md:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-line bg-elevated text-sm font-medium text-white transition-colors hover:bg-[#1c1e23]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cn(
              'h-11 flex-1 rounded-xl text-sm font-semibold transition-colors',
              destructive
                ? 'bg-red-500 text-white hover:bg-red-400'
                : 'bg-accent text-[#04140e] hover:bg-[#4ade80]',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="pb-1 text-sm leading-6 text-muted">{message}</div>
    </Modal>
  )
}
