import { CalendarDays, House, Settings, Target, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../utils/cn'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/weekly', label: 'Weekly', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 transition-colors duration-150',
                  isActive ? 'text-accent' : 'text-faint active:text-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute top-0 h-[2px] w-6 rounded-full transition-opacity',
                      isActive ? 'bg-accent opacity-100' : 'opacity-0',
                    )}
                  />
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="text-[9.5px] font-medium tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
