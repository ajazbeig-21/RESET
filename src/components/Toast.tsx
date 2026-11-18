import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../utils/cn'

type Tone = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  tone: Tone
}

interface ToastContextValue {
  showToast: (message: string, tone?: Tone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const tones: Record<Tone, string> = {
  success: 'text-accent',
  error: 'text-red-400',
  info: 'text-azure',
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, tone: Tone = 'success') => {
    const id = nextId
    nextId += 1
    setToasts((current) => [...current.slice(-2), { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[120] flex flex-col items-center gap-2 px-4 md:bottom-8"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.tone]
          return (
            <div
              key={toast.id}
              className="animate-fade-up flex max-w-sm items-center gap-2.5 rounded-full border border-line bg-elevated/95 px-4 py-2.5 text-[13px] font-medium text-white shadow-2xl backdrop-blur-xl"
            >
              <Icon size={16} className={cn('shrink-0', tones[toast.tone])} />
              <span className="min-w-0">{toast.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
