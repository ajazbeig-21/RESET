interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type Listener = () => void

let installEvent: BeforeInstallPromptEvent | null = null
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((listener) => listener())
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    installEvent = event as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    installEvent = null
    notify()
  })
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return installEvent
}

export function clearInstallPrompt(): void {
  installEvent = null
  notify()
}

export function subscribeInstallPrompt(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}
