import type {
  AppSettings,
  CategoryId,
  CategoryMeta,
  DevOpsStatus,
  GoalsState,
  Habit,
  MoodId,
  PrayerId,
  ProductItemId,
  Quote,
  UdemyStageId,
  YouTubeStageId,
} from '../types'

export const APP_NAME = 'RESET'
export const CHALLENGE_NAME = 'RESET — 58 DAY CHALLENGE'

export const DEFAULT_START = '2026-11-18'
export const DEFAULT_END = '2027-01-15'

/** The 58 tracked days run from the start date up to (but not including) the end date. */
export const DEFAULT_TOTAL_DAYS = 58

export const PRAYERS: Array<{ id: PrayerId; label: string; arabic: string }> = [
  { id: 'fajr', label: 'Fajr', arabic: 'الفجر' },
  { id: 'dhuhr', label: 'Dhuhr', arabic: 'الظهر' },
  { id: 'asr', label: 'Asr', arabic: 'العصر' },
  { id: 'maghrib', label: 'Maghrib', arabic: 'المغرب' },
  { id: 'isha', label: 'Isha', arabic: 'العشاء' },
]

export const PRAYER_IDS: PrayerId[] = PRAYERS.map((p) => p.id)

export const CATEGORIES: CategoryMeta[] = [
  { id: 'deen', label: 'Deen', color: '#34D399' },
  { id: 'fitness', label: 'Fitness', color: '#60A5FA' },
  { id: 'career', label: 'Career', color: '#A78BFA' },
  { id: 'creator', label: 'Creator', color: '#FBBF24' },
  { id: 'discipline', label: 'Discipline', color: '#F472B6' },
]

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  deen: 'Deen',
  fitness: 'Fitness',
  career: 'Career',
  creator: 'Creator',
  discipline: 'Discipline',
}

export const CATEGORY_COLORS: Record<CategoryId, string> = {
  deen: '#34D399',
  fitness: '#60A5FA',
  career: '#A78BFA',
  creator: '#FBBF24',
  discipline: '#F472B6',
}

const createdAt = '2026-11-18T00:00:00.000Z'

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'salah',
    name: 'Pray all 5 Salah',
    description: 'The non-negotiable. Fajr, Dhuhr, Asr, Maghrib, Isha.',
    category: 'deen',
    enabled: true,
    kind: 'salah',
    order: 0,
    createdAt,
  },
  {
    id: 'quran',
    name: 'Quran or reflection',
    category: 'deen',
    enabled: true,
    kind: 'checkbox',
    targetLabel: '10 min',
    order: 1,
    createdAt,
  },
  {
    id: 'diet',
    name: 'Stay in calorie deficit',
    category: 'fitness',
    enabled: true,
    kind: 'checkbox',
    targetLabel: 'Nutrition plan',
    order: 2,
    createdAt,
  },
  {
    id: 'gym',
    name: 'Gym or planned activity',
    category: 'fitness',
    enabled: true,
    kind: 'checkbox',
    targetLabel: '30+ min',
    order: 3,
    createdAt,
  },
  {
    id: 'steps',
    name: 'Daily step target',
    category: 'fitness',
    enabled: true,
    kind: 'checkbox',
    targetLabel: '8,000 steps',
    order: 4,
    createdAt,
  },
  {
    id: 'water',
    name: 'Daily water target',
    category: 'fitness',
    enabled: true,
    kind: 'checkbox',
    targetLabel: '3 L',
    order: 5,
    createdAt,
  },
  {
    id: 'devops-interview',
    name: 'DevOps interview prep',
    category: 'career',
    enabled: true,
    kind: 'checkbox',
    targetLabel: 'Topics & scenarios',
    order: 6,
    createdAt,
  },
  {
    id: 'focused-study',
    name: 'Focused study',
    category: 'career',
    enabled: true,
    kind: 'checkbox',
    targetLabel: '45 min',
    order: 7,
    createdAt,
  },
  {
    id: 'udemy',
    name: 'Work on Udemy course',
    category: 'creator',
    enabled: true,
    kind: 'checkbox',
    targetLabel: 'One meaningful step',
    order: 8,
    createdAt,
  },
  {
    id: 'youtube',
    name: 'Work on YouTube content',
    category: 'creator',
    enabled: true,
    kind: 'checkbox',
    targetLabel: 'One meaningful step',
    order: 9,
    createdAt,
  },
  {
    id: 'digital-product',
    name: 'Build the interview kit',
    category: 'creator',
    enabled: true,
    kind: 'checkbox',
    targetLabel: 'Infosys DevOps kit',
    order: 10,
    createdAt,
  },
  {
    id: 'no-scrolling',
    name: 'Avoid unnecessary scrolling',
    category: 'discipline',
    enabled: true,
    kind: 'checkbox',
    targetLabel: 'No mindless feeds',
    order: 11,
    createdAt,
  },
  {
    id: 'no-reactions',
    name: 'Pause before reacting',
    category: 'discipline',
    enabled: true,
    kind: 'checkbox',
    targetLabel: 'No emotional arguments',
    order: 12,
    createdAt,
  },
  {
    id: 'sleep-on-time',
    name: 'Sleep on time',
    category: 'discipline',
    enabled: true,
    kind: 'checkbox',
    targetLabel: 'Lights out by 11:30 PM',
    order: 13,
    createdAt,
  },
]

export const DEFAULT_SETTINGS: AppSettings = {
  challengeName: CHALLENGE_NAME,
  challengeStart: DEFAULT_START,
  challengeEnd: DEFAULT_END,
  startingWeight: 84,
  targetWeight: 74,
  stepTarget: 8000,
  waterTarget: 3,
}

export const UDEMY_STAGES: Array<{ id: UdemyStageId; label: string }> = [
  { id: 'planning', label: 'Course planning' },
  { id: 'outline', label: 'Outline completed' },
  { id: 'recording', label: 'Recording' },
  { id: 'editing', label: 'Editing' },
  { id: 'uploading', label: 'Uploading' },
  { id: 'published', label: 'Published' },
]

export const YOUTUBE_STAGES: Array<{ id: YouTubeStageId; label: string }> = [
  { id: 'idea', label: 'Idea' },
  { id: 'script', label: 'Script' },
  { id: 'recording', label: 'Recording' },
  { id: 'editing', label: 'Editing' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'published', label: 'Published' },
]

export const DEVOPS_TOPICS: Array<{ id: string; label: string }> = [
  { id: 'linux', label: 'Linux' },
  { id: 'networking', label: 'Networking' },
  { id: 'aws', label: 'AWS' },
  { id: 'docker', label: 'Docker' },
  { id: 'kubernetes', label: 'Kubernetes' },
  { id: 'jenkins', label: 'Jenkins' },
  { id: 'terraform', label: 'Terraform' },
  { id: 'prometheus', label: 'Prometheus' },
  { id: 'grafana', label: 'Grafana' },
  { id: 'cicd', label: 'CI/CD' },
  { id: 'sre', label: 'SRE' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
]

export const DEVOPS_STATUSES: Array<{ id: DevOpsStatus; label: string; short: string }> = [
  { id: 'not-started', label: 'Not started', short: 'New' },
  { id: 'learning', label: 'Learning', short: 'Learn' },
  { id: 'practiced', label: 'Practiced', short: 'Practice' },
  { id: 'interview-ready', label: 'Interview ready', short: 'Ready' },
]

export const PRODUCT_ITEMS: Array<{ id: ProductItemId; label: string }> = [
  { id: 'linux', label: 'Linux questions' },
  { id: 'aws', label: 'AWS questions' },
  { id: 'docker', label: 'Docker questions' },
  { id: 'jenkins', label: 'Jenkins questions' },
  { id: 'kubernetes', label: 'Kubernetes questions' },
  { id: 'terraform', label: 'Terraform questions' },
  { id: 'monitoring', label: 'Monitoring questions' },
  { id: 'scenarios', label: 'Scenario-based questions' },
  { id: 'formatting', label: 'PDF formatting' },
  { id: 'launch', label: 'Product launch' },
]

export const DEFAULT_GOALS: GoalsState = {
  udemy: {
    title: 'Publish one Udemy course',
    stages: {
      planning: false,
      outline: false,
      recording: false,
      editing: false,
      uploading: false,
      published: false,
    },
  },
  youtube: {
    videos: [],
  },
  devops: Object.fromEntries(DEVOPS_TOPICS.map((topic) => [topic.id, 'not-started'])),
  product: Object.fromEntries(PRODUCT_ITEMS.map((item) => [item.id, false])),
}

export const MOODS: Array<{ id: MoodId; label: string; emoji: string; color: string }> = [
  { id: 'peaceful', label: 'Peaceful', emoji: '🕊️', color: '#34D399' },
  { id: 'happy', label: 'Happy', emoji: '☀️', color: '#FBBF24' },
  { id: 'focused', label: 'Focused', emoji: '🎯', color: '#60A5FA' },
  { id: 'anxious', label: 'Anxious', emoji: '🌪️', color: '#A78BFA' },
  { id: 'sad', label: 'Sad', emoji: '🌧️', color: '#818CF8' },
  { id: 'angry', label: 'Angry', emoji: '🔥', color: '#F87171' },
  { id: 'exhausted', label: 'Exhausted', emoji: '🌙', color: '#94A3B8' },
]

export const QUOTES: Quote[] = [
  { text: 'Indeed, with hardship comes ease.', source: "Qur'an 94:6" },
  {
    text: 'And whoever relies upon Allah — then He is sufficient for him.',
    source: "Qur'an 65:3",
  },
  {
    text: 'Allah does not burden a soul beyond that it can bear.',
    source: "Qur'an 2:286",
  },
  {
    text: 'Verily, in the remembrance of Allah do hearts find rest.',
    source: "Qur'an 13:28",
  },
  {
    text: 'The most beloved deeds to Allah are those done consistently, even if they are small.',
    source: 'Sahih al-Bukhari & Muslim',
  },
  { text: 'Consistency beats motivation.' },
  { text: 'One day at a time. One prayer at a time.' },
  {
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    source: 'James Clear',
  },
  {
    text: 'Discipline is the bridge between goals and accomplishment.',
    source: 'Jim Rohn',
  },
  { text: 'Small daily improvements are the key to staggering long-term results.' },
  { text: 'Protect your mornings and your days will protect you.' },
  { text: 'The price of discipline is always less than the pain of regret.' },
  { text: 'Show up on the days you do not feel like showing up.' },
  { text: 'What you do every day matters more than what you do once in a while.' },
  { text: 'Be patient. Indeed, Allah is with the patient.', source: "Qur'an 2:153" },
  { text: 'So remember Me; I will remember you.', source: "Qur'an 2:152" },
]

export const SHARE_LINES = [
  'Consistency beats motivation.',
  'One week stronger. Keep showing up.',
  'Quiet discipline. Loud results.',
  'The work is working.',
  'Small steps. Serious momentum.',
  'You kept your word to yourself.',
]
