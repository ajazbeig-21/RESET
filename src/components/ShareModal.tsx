import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Download, Loader2, Share2 } from 'lucide-react'
import { useApp } from '../store/AppStore'
import {
  buildChallengeStats,
  buildWeekSummary,
  getShareLine,
  getWeightStats,
} from '../utils/analytics'
import { getWeekStart } from '../utils/dateUtils'
import { captureCard, downloadDataUrl, shareImage } from '../utils/shareUtils'
import { Button } from './Button'
import { Modal } from './Modal'
import { SegmentedControl } from './SegmentedControl'
import { ShareCard, type ShareFormat } from './ShareCard'
import { useToast } from './Toast'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  weekStart?: string
}

function CardPreview({
  width,
  height,
  children,
}: {
  width: number
  height: number
  children: ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.25)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const update = () => {
      const next = Math.min(element.clientWidth / width, element.clientHeight / height)
      setScale(Number.isFinite(next) && next > 0 ? next : 0.25)
    }
    const observer = new ResizeObserver(update)
    observer.observe(element)
    update()
    return () => observer.disconnect()
  }, [width, height])

  return (
    <div
      ref={containerRef}
      className="relative h-[43dvh] max-h-[440px] min-h-[240px] w-full overflow-hidden rounded-2xl border border-line bg-black/40"
    >
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden rounded-2xl shadow-2xl"
        style={{
          width: width * scale,
          height: height * scale,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function ShareModal({ open, onClose, weekStart }: ShareModalProps) {
  const { settings, habits, dailyLogs, weightLogs, goals, today } = useApp()
  const { showToast } = useToast()
  const [format, setFormat] = useState<ShareFormat>('post')
  const [busy, setBusy] = useState<'idle' | 'download' | 'share'>('idle')
  const [prepared, setPrepared] = useState<{ format: ShareFormat; dataUrl: string } | null>(
    null,
  )
  const [preparing, setPreparing] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const effectiveWeekStart = useMemo(
    () => weekStart ?? getWeekStart(today),
    [today, weekStart],
  )

  const summary = useMemo(
    () =>
      buildWeekSummary(
        effectiveWeekStart,
        habits,
        dailyLogs,
        today,
        settings.challengeStart,
      ),
    [dailyLogs, effectiveWeekStart, habits, settings.challengeStart, today],
  )

  const challenge = useMemo(
    () => buildChallengeStats(settings, habits, dailyLogs, today),
    [dailyLogs, habits, settings, today],
  )

  const weightStats = useMemo(
    () => getWeightStats(weightLogs, settings),
    [settings, weightLogs],
  )

  const udemyPercent = useMemo(() => {
    const total = Object.values(goals.udemy.stages).length
    const done = Object.values(goals.udemy.stages).filter(Boolean).length
    return total === 0 ? 0 : Math.round((done / total) * 100)
  }, [goals.udemy.stages])

  const youtubePublished = useMemo(
    () => goals.youtube.videos.filter((video) => video.stages.published).length,
    [goals.youtube.videos],
  )

  const width = 1080
  const height = format === 'story' ? 1920 : 1350

  const cardData = {
    week: summary,
    settings,
    currentDay: challenge.currentDay,
    totalDays: challenge.totalDays,
    streak: challenge.currentStreak,
    weight: {
      logged: weightLogs.length > 0,
      current: weightStats.current,
      lost: weightStats.lost,
    },
    udemyPercent,
    youtubePublished,
  }

  const filename = `reset-week-${effectiveWeekStart}-${format}.png`

  const shareText = `My RESET week: ${summary.completionRate}% consistency · ${summary.gymSessions} gym sessions · ${summary.salahConsistency}% Salah consistency. ${getShareLine(summary.completionRate, challenge.currentStreak)}`

  // Prepare the full-resolution image in the background. This keeps the
  // native share call inside the original tap gesture on iOS.
  useEffect(() => {
    if (!open) {
      setPrepared(null)
      setPreparing(false)
      return
    }
    let cancelled = false
    setPrepared(null)
    setPreparing(true)
    const timer = window.setTimeout(() => {
      void (async () => {
        if (!captureRef.current) return
        try {
          const dataUrl = await captureCard(captureRef.current, width, height)
          if (!cancelled) setPrepared({ format, dataUrl })
        } catch (error) {
          console.error('Could not pre-render the share card', error)
        } finally {
          if (!cancelled) setPreparing(false)
        }
      })()
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    challenge,
    format,
    height,
    open,
    settings,
    summary,
    udemyPercent,
    weightLogs.length,
    weightStats,
    width,
    youtubePublished,
  ])

  const handleDownload = async () => {
    if (!captureRef.current) return
    setBusy('download')
    try {
      const dataUrl =
        prepared?.format === format
          ? prepared.dataUrl
          : await captureCard(captureRef.current, width, height)
      downloadDataUrl(dataUrl, filename)
      showToast('Weekly card downloaded.')
    } catch (error) {
      console.error(error)
      showToast('Could not generate the card. Please try again.', 'error')
    } finally {
      setBusy('idle')
    }
  }

  const handleShare = async () => {
    if (!captureRef.current) return
    setBusy('share')
    try {
      const dataUrl =
        prepared?.format === format
          ? prepared.dataUrl
          : await captureCard(captureRef.current, width, height)
      const result = await shareImage(dataUrl, filename, shareText)
      if (result === 'downloaded') {
        showToast('Sharing is not available here — image downloaded instead.', 'info')
      }
    } catch (error) {
      console.error(error)
      showToast('Could not prepare the image. Please try again.', 'error')
    } finally {
      setBusy('idle')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share my week"
      description="A clean progress card. No notes or private entries are included."
      footer={
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={handleDownload}
            disabled={busy !== 'idle' || preparing}
          >
            {busy === 'download' ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Download size={17} />
            )}
            Download
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleShare}
            disabled={busy !== 'idle' || preparing}
          >
            {busy === 'share' ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Share2 size={17} />
            )}
            Share
          </Button>
        </div>
      }
    >
      <div className="space-y-3 pb-1">
        <SegmentedControl
          options={[
            { value: 'post', label: 'Post · 4:5' },
            { value: 'story', label: 'Story · 9:16' },
          ]}
          value={format}
          onChange={(value) => {
            setPreparing(true)
            setFormat(value as ShareFormat)
          }}
        />
        <CardPreview width={width} height={height}>
          <ShareCard {...cardData} format={format} />
        </CardPreview>
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] leading-4 text-faint">
          {preparing ? (
            <>
              <Loader2 size={11} className="animate-spin" />
              Preparing high-resolution image…
            </>
          ) : (
            <>1080 × {height} PNG · ready for WhatsApp, Instagram and LinkedIn</>
          )}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-[-12000px] top-0"
        style={{ width, height }}
      >
        <div ref={captureRef} style={{ width, height }}>
          <ShareCard {...cardData} format={format} />
        </div>
      </div>
    </Modal>
  )
}
