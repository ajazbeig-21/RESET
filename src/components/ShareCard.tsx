import type { AppSettings, WeekSummary } from '../types'
import { formatWeekRange, formatWeekRangeFull } from '../utils/dateUtils'
import { getShareLine } from '../utils/analytics'
import { cn } from '../utils/cn'
import { BrandMark } from './Brand'
import { ProgressRing } from './ProgressRing'

export type ShareFormat = 'post' | 'story'

interface ShareCardProps {
  week: WeekSummary
  settings: AppSettings
  currentDay: number
  totalDays: number
  streak: number
  weight: { logged: boolean; current: number; lost: number }
  udemyPercent: number
  youtubePublished: number
  format: ShareFormat
}

function signedWeight(lost: number): string {
  if (Math.abs(lost) < 0.05) return '0.0 kg'
  const sign = lost > 0 ? '−' : '+'
  return `${sign}${Math.abs(lost).toFixed(1)} kg`
}

export function ShareCard({
  week,
  settings,
  currentDay,
  totalDays,
  streak,
  weight,
  udemyPercent,
  youtubePublished,
  format,
}: ShareCardProps) {
  const isStory = format === 'story'
  const width = 1080
  const height = isStory ? 1920 : 1350

  const tiles = [
    { label: 'Salah consistency', value: `${week.salahConsistency}%` },
    { label: 'Gym sessions', value: `${week.gymSessions}` },
    { label: 'Study sessions', value: `${week.studySessions}` },
    { label: 'Content sessions', value: `${week.contentSessions}` },
    { label: 'Current streak', value: `${streak}d` },
    {
      label: 'Weight progress',
      value: weight.logged ? signedWeight(weight.lost) : '—',
    },
    { label: 'Udemy course', value: `${udemyPercent}%` },
    { label: 'YouTube videos', value: `${youtubePublished}` },
  ]

  const chartHeight = isStory ? 220 : 210

  return (
    <div
      className="relative overflow-hidden text-white"
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#08090B',
        fontFamily:
          "'Inter Variable', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 640px at 82% -12%, rgba(52,211,153,0.14), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(700px 560px at -8% 112%, rgba(96,165,250,0.075), transparent 72%)',
        }}
      />

      <div
        className="relative flex flex-1 flex-col"
        style={{
          padding: isStory ? 78 : 64,
          paddingTop: isStory ? 100 : 64,
          paddingBottom: isStory ? 76 : 58,
          minHeight: 0,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center" style={{ gap: isStory ? 20 : 16 }}>
            <BrandMark size={isStory ? 62 : 54} />
            <div>
              <div
                className="font-semibold"
                style={{ fontSize: isStory ? 29 : 25, letterSpacing: '0.26em' }}
              >
                RESET
              </div>
              <div
                className="uppercase text-[#6d727c]"
                style={{
                  fontSize: isStory ? 13 : 11.5,
                  letterSpacing: '0.18em',
                  marginTop: 7,
                }}
              >
                58 day challenge
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className="uppercase text-[#8f949e]"
              style={{ fontSize: 14, letterSpacing: '0.2em' }}
            >
              Weekly report
            </div>
            <div
              className="font-medium text-[#34D399]"
              style={{ fontSize: isStory ? 25 : 22, marginTop: 10 }}
            >
              {formatWeekRange(week.weekStart)}
            </div>
          </div>
        </div>

        <div
          className="flex items-center"
          style={{ marginTop: isStory ? 80 : 68, gap: isStory ? 60 : 48 }}
        >
          <ProgressRing
            percent={week.completionRate}
            size={isStory ? 296 : 252}
            stroke={isStory ? 20 : 16}
          >
            <span
              className="font-semibold leading-none tabular text-white"
              style={{ fontSize: isStory ? 98 : 78, letterSpacing: '-0.05em' }}
            >
              {week.completionRate}%
            </span>
            <span
              className="uppercase text-[#8f949e]"
              style={{
                fontSize: isStory ? 15 : 12,
                letterSpacing: '0.18em',
                marginTop: 14,
              }}
            >
              Week score
            </span>
          </ProgressRing>

          <div className="min-w-0 flex-1">
            <div
              className="uppercase text-[#6d727c]"
              style={{ fontSize: 14, letterSpacing: '0.18em' }}
            >
              {formatWeekRangeFull(week.weekStart)} · Day {currentDay} of {totalDays}
            </div>
            <div
              className="font-semibold text-white"
              style={{
                fontSize: isStory ? 50 : 38,
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                marginTop: isStory ? 22 : 16,
              }}
            >
              {getShareLine(week.completionRate, streak)}
            </div>
            <div
              className="text-[#8f949e]"
              style={{ fontSize: isStory ? 20 : 17, marginTop: isStory ? 30 : 20 }}
            >
              {week.completedHabits} habits completed · {week.perfectDays} perfect day
              {week.perfectDays === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        <div
          className={cn('grid', isStory ? 'grid-cols-2' : 'grid-cols-4')}
          style={{ marginTop: isStory ? 70 : 52, gap: isStory ? 20 : 16 }}
        >
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="flex flex-col justify-between rounded-[22px] border border-white/[0.065] bg-[#111317]"
              style={{
                padding: isStory ? 26 : 22,
                minHeight: isStory ? 150 : 136,
              }}
            >
              <div
                className="uppercase text-[#6d727c]"
                style={{
                  fontSize: isStory ? 15 : 12,
                  letterSpacing: '0.13em',
                  lineHeight: 1.35,
                }}
              >
                {tile.label}
              </div>
              <div
                className="font-semibold tabular text-white"
                style={{
                  fontSize: isStory ? 52 : 36,
                  letterSpacing: '-0.03em',
                  marginTop: 16,
                  lineHeight: 1,
                }}
              >
                {tile.value}
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-[26px] border border-white/[0.065] bg-[#111317]"
          style={{ marginTop: isStory ? 40 : 32, padding: isStory ? 28 : 26 }}
        >
          <div className="flex items-center justify-between">
            <div
              className="uppercase text-[#8f949e]"
              style={{ fontSize: isStory ? 15 : 13, letterSpacing: '0.16em' }}
            >
              Daily consistency
            </div>
            <div
              className="text-[#34D399]"
              style={{ fontSize: isStory ? 16 : 14, fontWeight: 500 }}
            >
              {week.completedHabits} habits logged
            </div>
          </div>

          <div
            className="flex items-end"
            style={{ marginTop: isStory ? 30 : 22, gap: isStory ? 16 : 12 }}
          >
            {week.days.map((day) => {
              const barHeight = Math.max(5, (day.percent / 100) * chartHeight)
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center">
                  <div
                    className="flex w-full flex-col items-center justify-end"
                    style={{ height: chartHeight + 34 }}
                  >
                    <div
                      className="tabular"
                      style={{
                        fontSize: isStory ? 17 : 14,
                        color: day.isFuture || day.isOutside ? '#4b4f57' : '#b6bac2',
                        marginBottom: 10,
                      }}
                    >
                      {day.isOutside ? '—' : `${day.percent}%`}
                    </div>
                    <div
                      style={{
                        width: isStory ? 56 : 38,
                        height: barHeight,
                        borderRadius: 10,
                        background:
                          day.isFuture || day.isOutside
                            ? '#202329'
                            : 'linear-gradient(180deg, #4ADE80 0%, #10B981 100%)',
                        opacity: day.isFuture || day.isOutside ? 0.6 : 1,
                      }}
                    />
                  </div>
                  <div
                    className="uppercase"
                    style={{
                      fontSize: isStory ? 14 : 12,
                      letterSpacing: '0.08em',
                      color: day.isToday ? '#34D399' : '#6d727c',
                      marginTop: 10,
                    }}
                  >
                    {day.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="mt-auto flex items-end justify-between border-t border-white/[0.07]"
          style={{ paddingTop: isStory ? 30 : 22, marginTop: 'auto' }}
        >
          <div className="flex items-center" style={{ gap: 12 }}>
            <span
              className="block rounded-full bg-[#34D399]"
              style={{ width: 8, height: 8 }}
            />
            <span
              className="uppercase text-[#6d727c]"
              style={{ fontSize: isStory ? 14 : 12, letterSpacing: '0.18em' }}
            >
              RESET · {settings.challengeName.replace(/^RESET\s*[—-]\s*/i, '').toUpperCase()}
            </span>
          </div>
          <span
            className="text-[#6d727c]"
            style={{ fontSize: isStory ? 14 : 12, letterSpacing: '0.08em' }}
          >
            Private by design · stored on device
          </span>
        </div>
      </div>
    </div>
  )
}
