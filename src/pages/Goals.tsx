import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Check,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Layers,
  Plus,
  Scale,
  Server,
  Trash2,
  TrendingDown,
  Youtube,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import {
  DEVOPS_STATUSES,
  DEVOPS_TOPICS,
  PRODUCT_ITEMS,
  UDEMY_STAGES,
  YOUTUBE_STAGES,
} from '../data/defaults'
import type { DevOpsStatus, YouTubeStageId, YouTubeVideo } from '../types'
import { getWeightStats } from '../utils/analytics'
import {
  diffDaysKey,
  formatMediumDate,
  formatShortDate,
  formatWeekRange,
  getWeekStart,
} from '../utils/dateUtils'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CheckboxMark } from '../components/HabitCheckbox'
import { ConfirmDialog, Modal } from '../components/Modal'
import { WeightSection } from '../components/WeightSection'
import { useToast } from '../components/Toast'
import { cn } from '../utils/cn'

function GoalHeading({
  number,
  title,
  subtitle,
  icon: Icon,
  color,
  percent,
  meta,
}: {
  number: number
  title: string
  subtitle: string
  icon: LucideIcon
  color: string
  percent: number
  meta?: string
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06]"
            style={{ backgroundColor: `${color}12`, color }}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <div className="text-[8.5px] font-semibold uppercase tracking-[0.16em] text-faint">
              Goal 0{number}
            </div>
            <h2 className="mt-1 text-[15px] font-semibold tracking-tight text-white">{title}</h2>
            <p className="mt-0.5 text-[10.5px] leading-4 text-faint">{subtitle}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[19px] font-semibold leading-none tabular text-white">
            {percent}%
          </div>
          <div className="mt-1 text-[8.5px] uppercase tracking-[0.12em] text-faint">done</div>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      {meta ? <p className="mt-2 text-[10.5px] leading-4 text-faint">{meta}</p> : null}
    </div>
  )
}

function VideoCard({
  video,
  defaultOpen,
  onToggleStage,
  onDelete,
}: {
  video: YouTubeVideo
  defaultOpen: boolean
  onToggleStage: (videoId: string, stage: YouTubeStageId) => void
  onDelete: (videoId: string) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const completed = YOUTUBE_STAGES.filter((stage) => video.stages[stage.id]).length
  const percent = Math.round((completed / YOUTUBE_STAGES.length) * 100)
  const published = video.stages.published

  return (
    <div className="overflow-hidden rounded-2xl border border-line/70 bg-[#0b0c0f]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full p-3 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[8.5px] font-medium uppercase tracking-[0.12em] text-faint">
              Week of {formatShortDate(video.weekStart)}
            </div>
            <div className="mt-1 truncate text-[12px] font-medium text-white">
              {video.title}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {published ? (
              <span className="rounded-full border border-accent/25 bg-accent/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-accent">
                Published
              </span>
            ) : null}
            <ChevronDown
              size={14}
              className={cn('text-faint transition-transform', open && 'rotate-180')}
            />
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-[9px] tabular text-faint">
            {completed}/{YOUTUBE_STAGES.length}
          </span>
        </div>
      </button>

      {open ? (
        <div className="border-t border-line/60 p-3">
          <div className="grid grid-cols-3 gap-1.5">
            {YOUTUBE_STAGES.map((stage) => {
              const done = video.stages[stage.id]
              return (
                <button
                  key={stage.id}
                  type="button"
                  aria-pressed={done}
                  onClick={() => onToggleStage(video.id, stage.id)}
                  className={cn(
                    'flex h-9 items-center justify-center gap-1 rounded-lg border text-[10px] font-medium transition-colors',
                    done
                      ? 'border-accent/30 bg-accent/10 text-accent'
                      : 'border-line bg-white/[0.02] text-faint hover:text-muted',
                  )}
                >
                  {done ? <Check size={10} strokeWidth={3} /> : null}
                  {stage.label}
                </button>
              )
            })}
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[9.5px] text-faint">{percent}% complete</span>
            <button
              type="button"
              onClick={() => onDelete(video.id)}
              className="flex items-center gap-1 text-[10px] text-faint transition-colors hover:text-red-300"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const devopsDescriptions: Record<DevOpsStatus, string> = {
  'not-started': 'No focused work yet.',
  learning: 'Studying the fundamentals.',
  practiced: 'Hands-on labs and scenarios.',
  'interview-ready': 'You can explain and defend it.',
}

const devopsColors: Record<DevOpsStatus, string> = {
  'not-started': '#62666f',
  learning: '#60A5FA',
  practiced: '#FBBF24',
  'interview-ready': '#34D399',
}

export default function Goals() {
  const {
    settings,
    goals,
    weightLogs,
    today,
    setUdemyStage,
    addYouTubeVideo,
    toggleYouTubeStage,
    deleteYouTubeVideo,
    setDevopsStatus,
    toggleProductItem,
  } = useApp()
  const { showToast } = useToast()
  const [addOpen, setAddOpen] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)

  const currentWeekStart = getWeekStart(today)
  const startWeekStart = getWeekStart(settings.challengeStart)
  const weightStats = getWeightStats(weightLogs, settings)

  const udemyPercent = Math.round(
    (Object.values(goals.udemy.stages).filter(Boolean).length / UDEMY_STAGES.length) * 100,
  )

  const weeksElapsed = Math.max(
    1,
    Math.floor(diffDaysKey(currentWeekStart, startWeekStart) / 7) + 1,
  )
  const publishedWeeks = new Set(
    goals.youtube.videos
      .filter(
        (video) =>
          video.stages.published &&
          video.weekStart >= startWeekStart &&
          video.weekStart <= currentWeekStart,
      )
      .map((video) => video.weekStart),
  ).size
  const youtubePercent = Math.min(
    100,
    Math.round((publishedWeeks / weeksElapsed) * 100),
  )
  const publishedVideos = goals.youtube.videos.filter((video) => video.stages.published)
  const currentWeekVideos = goals.youtube.videos
    .filter((video) => video.weekStart === currentWeekStart)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const pastVideos = goals.youtube.videos
    .filter((video) => video.weekStart !== currentWeekStart)
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart) || b.createdAt.localeCompare(a.createdAt))

  const devopsWeighted = DEVOPS_TOPICS.reduce((sum, topic) => {
    const status = goals.devops[topic.id] ?? 'not-started'
    if (status === 'learning') return sum + 1 / 3
    if (status === 'practiced') return sum + 2 / 3
    if (status === 'interview-ready') return sum + 1
    return sum
  }, 0)
  const devopsPercent = Math.round((devopsWeighted / DEVOPS_TOPICS.length) * 100)
  const readyTopics = DEVOPS_TOPICS.filter(
    (topic) => goals.devops[topic.id] === 'interview-ready',
  ).length

  const productDone = PRODUCT_ITEMS.filter((item) => goals.product[item.id]).length
  const productPercent = Math.round((productDone / PRODUCT_ITEMS.length) * 100)

  const overall = Math.round(
    (weightStats.progress + udemyPercent + youtubePercent + devopsPercent + productPercent) / 5,
  )

  const overview = [
    { label: 'Fat loss', value: weightStats.progress, color: '#34D399' },
    { label: 'Udemy', value: udemyPercent, color: '#A78BFA' },
    { label: 'YouTube', value: youtubePercent, color: '#FBBF24' },
    { label: 'DevOps', value: devopsPercent, color: '#60A5FA' },
    { label: 'Digital product', value: productPercent, color: '#F472B6' },
  ]

  const selectedTopic = DEVOPS_TOPICS.find((topic) => topic.id === topicId)
  const videoToDeleteData = goals.youtube.videos.find((video) => video.id === videoToDelete)
  const allYoutubeVideos = currentWeekVideos.length + pastVideos.length

  const handleAddVideo = () => {
    addYouTubeVideo(videoTitle.trim() || 'Untitled video', currentWeekStart)
    setVideoTitle('')
    setAddOpen(false)
    showToast('Video added to this week.')
  }

  return (
    <div>
      <header>
        <div className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-faint">
          Five commitments
        </div>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">Goals</h1>
        <p className="mt-1.5 text-[12px] text-muted">
          Build the body, the skills and the work. By {formatMediumDate(settings.challengeEnd)}.
        </p>
      </header>

      <Card className="mt-4 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-faint">
              Goal momentum
            </div>
            <div className="mt-1 text-[12px] text-muted">Average across all five goals</div>
          </div>
          <span className="text-[26px] font-semibold leading-none tabular text-white">
            {overall}%
          </span>
        </div>
        <div className="mt-4 space-y-2.5">
          {overview.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="w-[92px] shrink-0 text-[10.5px] text-muted">{item.label}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-[9.5px] font-medium tabular text-white">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      <section className="mt-7">
        <Card className="p-5">
          <GoalHeading
            number={1}
            title="Fat loss"
            subtitle={`${settings.startingWeight} kg → ${settings.targetWeight} kg by ${formatMediumDate(settings.challengeEnd)}`}
            icon={TrendingDown}
            color="#34D399"
            percent={weightStats.progress}
            meta={
              weightLogs.length > 0
                ? `${Math.abs(weightStats.lost).toFixed(1)} kg ${
                    weightStats.lost >= 0 ? 'lost' : 'gained'
                  } · ${weightStats.remaining.toFixed(1)} kg to target`
                : 'Log your first weight below to start the trend.'
            }
          />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
              <div className="text-[8.5px] uppercase tracking-[0.1em] text-faint">Start</div>
              <div className="mt-1 text-[12.5px] font-semibold tabular text-white">
                {settings.startingWeight} kg
              </div>
            </div>
            <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
              <div className="text-[8.5px] uppercase tracking-[0.1em] text-faint">Current</div>
              <div className="mt-1 text-[12.5px] font-semibold tabular text-accent">
                {weightStats.current} kg
              </div>
            </div>
            <div className="rounded-xl border border-line/60 bg-white/[0.02] p-2.5">
              <div className="text-[8.5px] uppercase tracking-[0.1em] text-faint">Target</div>
              <div className="mt-1 text-[12.5px] font-semibold tabular text-white">
                {settings.targetWeight} kg
              </div>
            </div>
          </div>
        </Card>
        <div className="mt-3">
          <WeightSection list={false} />
        </div>
      </section>

      <section className="mt-6">
        <Card className="p-5">
          <GoalHeading
            number={2}
            title="Udemy course"
            subtitle="Publish one course"
            icon={GraduationCap}
            color="#A78BFA"
            percent={udemyPercent}
            meta={`${Object.values(goals.udemy.stages).filter(Boolean).length} of ${UDEMY_STAGES.length} stages complete`}
          />
          <div className="mt-4 overflow-hidden rounded-2xl border border-line/60">
            <div className="divide-y divide-line-soft">
              {UDEMY_STAGES.map((stage) => {
                const done = goals.udemy.stages[stage.id]
                return (
                  <button
                    key={stage.id}
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={() => setUdemyStage(stage.id, !done)}
                    className="flex min-h-[48px] w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <CheckboxMark checked={done} size="sm" />
                    <span
                      className={cn(
                        'flex-1 text-[12px] font-medium',
                        done ? 'text-white/55' : 'text-white',
                      )}
                    >
                      {stage.label}
                    </span>
                    {stage.id === 'published' && done ? (
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-accent">
                        Live
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="p-5">
          <GoalHeading
            number={3}
            title="YouTube"
            subtitle="One video every week"
            icon={Youtube}
            color="#FBBF24"
            percent={youtubePercent}
            meta={`${publishedWeeks} of ${weeksElapsed} challenge weeks published · ${publishedVideos.length} videos live`}
          />

          <div className="mt-4 rounded-2xl border border-line/60 bg-[#0b0c0f] p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-medium text-white">This week</div>
                <div className="mt-0.5 text-[9.5px] text-faint">
                  {formatWeekRange(currentWeekStart)}
                </div>
              </div>
              <Button
                size="sm"
                variant="subtle"
                onClick={() => setAddOpen((value) => !value)}
              >
                <Plus size={13} />
                Add video
              </Button>
            </div>

            {addOpen ? (
              <div className="mt-3 flex gap-2">
                <input
                  value={videoTitle}
                  onChange={(event) => setVideoTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleAddVideo()
                  }}
                  placeholder="Video title or idea"
                  maxLength={120}
                  autoFocus
                  className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-[#08090b] px-3 text-[12px] text-white outline-none placeholder:text-faint focus:border-accent/50"
                />
                <Button size="sm" variant="primary" onClick={handleAddVideo}>
                  Add
                </Button>
              </div>
            ) : null}

            <div className="mt-2.5 space-y-2">
              {currentWeekVideos.length === 0 && !addOpen ? (
                <p className="rounded-xl border border-dashed border-line/80 px-3 py-4 text-center text-[10.5px] leading-4 text-faint">
                  No video tracked for this week. Add one idea and move it through the stages.
                </p>
              ) : null}
              {currentWeekVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  defaultOpen
                  onToggleStage={toggleYouTubeStage}
                  onDelete={setVideoToDelete}
                />
              ))}
            </div>
          </div>

          {pastVideos.length > 0 ? (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[9.5px] font-medium uppercase tracking-[0.12em] text-faint">
                  Content log
                </span>
                <span className="text-[9.5px] text-faint">{allYoutubeVideos} videos</span>
              </div>
              <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
                {pastVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    defaultOpen={false}
                    onToggleStage={toggleYouTubeStage}
                    onDelete={setVideoToDelete}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {publishedVideos.length > 0 ? (
            <div className="mt-4 rounded-xl border border-accent/15 bg-accent/[0.04] px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.1em] text-accent">
                <CheckCircle2 size={11} />
                Published videos
              </div>
              <div className="mt-1.5 text-[11px] leading-5 text-white/70">
                {publishedVideos.length} published · {publishedVideos.map((video) => video.title).join(' · ')}
              </div>
            </div>
          ) : null}
        </Card>
      </section>

      <section className="mt-6">
        <Card className="p-5">
          <GoalHeading
            number={4}
            title="DevOps interview prep"
            subtitle="Twelve topics, interview ready"
            icon={Server}
            color="#60A5FA"
            percent={devopsPercent}
            meta={`${readyTopics} of ${DEVOPS_TOPICS.length} topics interview ready`}
          />

          <div className="mt-4 grid grid-cols-2 gap-2">
            {DEVOPS_TOPICS.map((topic) => {
              const status = goals.devops[topic.id] ?? 'not-started'
              const index = DEVOPS_STATUSES.findIndex((item) => item.id === status)
              const color = devopsColors[status]
              const short = DEVOPS_STATUSES[index]?.short ?? 'New'
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setTopicId(topic.id)}
                  className="rounded-2xl border border-line/70 bg-[#0b0c0f] p-3 text-left transition-colors hover:border-line hover:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[11px] font-medium leading-4 text-white">
                      {topic.label}
                    </span>
                    <span
                      className="shrink-0 rounded-full px-1.5 py-0.5 text-[7.5px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: `${color}16`, color }}
                    >
                      {short}
                    </span>
                  </div>
                  <div className="mt-2.5 flex gap-1">
                    {[0, 1, 2, 3].map((segment) => (
                      <span
                        key={segment}
                        className="h-1 flex-1 rounded-full"
                        style={{
                          backgroundColor:
                            segment < index ? color : 'rgba(255,255,255,0.06)',
                        }}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[9.5px] text-faint">Tap a topic to update its status.</p>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="p-5">
          <GoalHeading
            number={5}
            title="Digital product"
            subtitle="Infosys DevOps Interview Kit"
            icon={Layers}
            color="#F472B6"
            percent={productPercent}
            meta={`${productDone} of ${PRODUCT_ITEMS.length} parts complete`}
          />
          <div className="mt-4 overflow-hidden rounded-2xl border border-line/60">
            <div className="divide-y divide-line-soft">
              {PRODUCT_ITEMS.map((item) => {
                const done = Boolean(goals.product[item.id])
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={() => toggleProductItem(item.id)}
                    className="flex min-h-[46px] w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <CheckboxMark checked={done} size="sm" />
                    <span
                      className={cn(
                        'flex-1 text-[12px] font-medium',
                        done ? 'text-white/55' : 'text-white',
                      )}
                    >
                      {item.label}
                    </span>
                    {done ? <Check size={13} className="text-accent" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      </section>

      <div className="mt-7 flex items-center justify-between border-t border-line/50 pt-5 text-[10px] text-faint">
        <span className="flex items-center gap-1.5">
          <Scale size={12} /> Goals are reviewed weekly.
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={12} /> One week stronger.
        </span>
      </div>

      <Modal
        open={Boolean(topicId)}
        onClose={() => setTopicId(null)}
        title={selectedTopic ? selectedTopic.label : 'Topic status'}
        description="Where are you with this topic right now?"
      >
        <div className="space-y-2 pb-2">
          {DEVOPS_STATUSES.map((status) => {
            const selected = selectedTopic ? goals.devops[selectedTopic.id] === status.id : false
            return (
              <button
                key={status.id}
                type="button"
                onClick={() => {
                  if (!selectedTopic) return
                  setDevopsStatus(selectedTopic.id, status.id)
                  setTopicId(null)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                  selected
                    ? 'border-accent/30 bg-accent/[0.07]'
                    : 'border-line bg-white/[0.015] hover:bg-white/[0.035]',
                )}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: devopsColors[status.id] }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium text-white">
                    {status.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-faint">
                    {devopsDescriptions[status.id]}
                  </span>
                </span>
                {selected ? <Check size={15} className="shrink-0 text-accent" /> : null}
              </button>
            )
          })}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(videoToDelete)}
        onClose={() => setVideoToDelete(null)}
        onConfirm={() => {
          if (videoToDelete) {
            deleteYouTubeVideo(videoToDelete)
            showToast('Video removed.', 'info')
          }
        }}
        title="Delete this video?"
        message={
          videoToDeleteData
            ? `"${videoToDeleteData.title}" and its stage progress will be removed.`
            : 'This video and its stage progress will be removed.'
        }
        confirmLabel="Delete"
        destructive
      />
    </div>
  )
}
