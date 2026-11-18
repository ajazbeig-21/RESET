import { Suspense, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookHeart, Flame } from 'lucide-react'
import { useApp } from '../store/AppStore'
import { buildChallengeStats } from '../utils/analytics'
import { cn } from '../utils/cn'
import { BottomNavigation, NAV_ITEMS } from './BottomNavigation'
import { BrandMark, Wordmark } from './Brand'

const titles: Record<string, string> = {
  '/': 'Today',
  '/progress': 'Progress',
  '/goals': 'Goals',
  '/weekly': 'Weekly',
  '/settings': 'Settings',
  '/journal': 'Reset Space',
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="animate-pulse">
        <BrandMark size={40} />
      </div>
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-faint">
        Loading
      </span>
    </div>
  )
}

export function AppShell() {
  const location = useLocation()
  const { settings, habits, dailyLogs, today } = useApp()
  const stats = buildChallengeStats(settings, habits, dailyLogs, today)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    document.title = `${titles[location.pathname] ?? 'RESET'} — RESET`
  }, [location.pathname])

  return (
    <div className="relative min-h-dvh bg-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(55%_100%_at_50%_0%,rgba(52,211,153,0.07),transparent_75%)]"
      />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line/70 bg-[#0a0b0d]/90 px-4 py-6 backdrop-blur-xl lg:flex">
        <div className="px-2">
          <Wordmark />
        </div>

        <nav aria-label="Primary" className="mt-9 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group flex h-11 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors',
                    isActive
                      ? 'bg-white/[0.055] text-white'
                      : 'text-muted hover:bg-white/[0.025] hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={17}
                      className={isActive ? 'text-accent' : 'text-faint group-hover:text-muted'}
                    />
                    {item.label}
                    {isActive ? (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                    ) : null}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="my-5 h-px bg-line/60" />

        <NavLink
          to="/journal"
          className={({ isActive }) =>
            cn(
              'group flex h-11 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors',
              isActive
                ? 'bg-white/[0.055] text-white'
                : 'text-muted hover:bg-white/[0.025] hover:text-white',
            )
          }
        >
          {({ isActive }) => (
            <>
              <BookHeart
                size={17}
                className={isActive ? 'text-accent' : 'text-faint group-hover:text-muted'}
              />
              Reset space
              <span className="ml-auto text-[9px] uppercase tracking-widest text-faint">private</span>
            </>
          )}
        </NavLink>

        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-line/80 bg-card p-4 hairline">
            <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.13em] text-faint">
              <span>Challenge</span>
              <span className="tabular text-muted">
                {stats.currentDay}/{stats.totalDays}
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-700"
                style={{ width: `${stats.timeProgress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted">
              <Flame size={13} className="text-accent" />
              <span className="tabular">{stats.currentStreak}</span> day
              {stats.currentStreak === 1 ? '' : 's'} streak
            </div>
          </div>
          <p className="mt-4 px-1 text-[10px] leading-4 text-faint/70">
            Private by design. Stored only on this device.
          </p>
        </div>
      </aside>

      <main className="lg:pl-[248px]">
        <div className="mx-auto w-full max-w-[560px] px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(1.1rem+env(safe-area-inset-top))] md:max-w-3xl md:px-8 md:pt-10 lg:pb-16">
          <Suspense fallback={<PageLoader />}>
            <div key={location.pathname} className="animate-fade-in">
              <Outlet />
            </div>
          </Suspense>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
