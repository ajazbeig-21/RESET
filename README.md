# RESET — 58 Day Challenge

A private, offline-first personal operating system for discipline, faith, fitness, career and creative work. RESET runs entirely on your device: no account, no backend, no analytics, no cloud.

Built as a mobile-first installable PWA with React, Vite, TypeScript, Tailwind CSS, Recharts and Lucide.

---

## What is inside

- **Daily dashboard** — a daily quote, live progress ring, individual Salah tracking, a grouped habit checklist and a daily note.
- **Habits that fit your life** — 14 defaults across Deen, Fitness, Career, Creator and Discipline. Add, edit, delete, pause, change category and set a target label for any habit.
- **Weekly analytics** — real scores from your local logs: completion rate, Salah consistency, gym/study/content sessions, a Monday–Sunday bar chart, category donut, seven-day heatmap and generated insights.
- **Challenge overview** — day count, time and consistency progress, streaks, lifetime totals and a clickable calendar for every challenge day.
- **Weight tracking** — 84 kg → 74 kg, a real weight trend chart, target line and editable weight history.
- **Five goals** — fat loss, Udemy course, weekly YouTube content, twelve DevOps interview topics and the Infosys DevOps interview kit.
- **Share My Week** — generates a real 1080 × 1350 post or 1080 × 1920 story card, with PNG download and native Web Share API support.
- **Weekly review** — five reflection prompts saved per week, with a timeline of past reviews.
- **Reset space** — a private emotional journal with seven moods, structured prompts and a 4-4-4 breathing exercise.
- **Fully local data** — versioned localStorage, JSON export/import, and a confirmed full reset.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | date-fns |
| Image export | html-to-image |
| Storage | Browser localStorage (versioned envelopes) |
| PWA | vite-plugin-pwa + Workbox |
| Font | Inter Variable, self-hosted via Fontsource |

There is no backend, database, authentication, API integration or subscription feature. After the first successful load, the app can run entirely offline.

---

## Requirements

- Node.js **20.19+** (or 22.12+)
- npm 10+
- A modern browser. HTTPS (or `localhost`) is required for service workers and installability.

---

## Installation

```bash
git clone <your-repo-url> RESET
cd RESET
npm install
```

## Development

```bash
npm run dev
```

Open the URL shown by Vite (usually <http://localhost:5173>). The service worker is disabled in development by design; use the production preview to test PWA behaviour.

## Type checking

```bash
npm run typecheck
```

## Production build

```bash
npm run build
```

Output is written to `dist/`. The build includes:

- the app bundle and lazy-loaded pages
- the web app manifest
- a generated service worker
- app icons and iOS splash images

## Preview the production build

```bash
npm run preview
```

Open <http://localhost:4173>. This is the best way to verify offline behaviour and installation locally.

## Regenerate app icons

The committed icons and splash screens were generated from SVG sources:

```bash
npm run icons
```

This requires the `sharp` dev dependency that is already listed. Edit `scripts/generate-icons.mjs` to change icon or splash artwork.

---

## Challenge configuration

The default challenge is:

- **Start:** 18 November 2026
- **End / target date:** 15 January 2027
- **Tracked days:** 58

The challenge runs for **58 tracked days**: from 18 November 2026 through 14 January 2027. 15 January 2027 is the final target/completion date. The app calculates this from the start and end dates (the difference between the dates), so **Day 1 of 58 is 18 November** and the challenge is complete on 15 January.

To change the dates, targets or measurements, open **Settings → Challenge**. Existing logs are never deleted when the dates change. You can also change the defaults in `src/data/defaults.ts`.

### Habit scoring

- Only **enabled** habits count toward the daily score, weekly rate and streaks.
- Salah is tracked as one habit with five individual prayer checkboxes. It is complete only when all five are logged.
- A day counts toward a streak when its completion is **50% or more**. An unfinished today does not erase yesterday's streak.
- Disable a habit in Settings to pause it without deleting its history.

---

## Using RESET

### Home

Tap any habit row, prayer pill or note field. Every change is persisted synchronously, so it survives an immediate refresh or app close. The ring, counters, streak and challenge averages update immediately.

### Progress

The challenge card shows time progress, consistency, active days and perfect days. Tap any date in the calendar to open the day editor. Past days are always editable. The weight section logs entries separately from habits and never assumes loss.

### Weekly

Use the week arrows to move through challenge weeks. **Analytics** contains the summary cards, consistency chart, category breakdown, heatmap and insights. **Review** saves a reflection for the selected week and keeps a timeline of previous reviews.

### Goals

- Fat loss: weight stats and trend.
- Udemy: six production stages.
- YouTube: weekly video entries with six stages and a published log.
- DevOps: twelve topics with four statuses.
- Digital product: ten build checklist items.

### Share My Week

Open the share icon on the Home or Weekly page. Choose **Post · 4:5** or **Story · 9:16**, then download or share. Sharing uses the native Web Share API where available and falls back to a PNG download. Only aggregate progress is included; notes, reflections and journal text are never included.

### Reset space

Reach it from the Home header, the desktop sidebar, or Settings. Journal entries and mood reflections are private and local. The Breathe tab runs an inhale 4 / hold 4 / exhale 4 exercise with a visual breathing guide.

---

## Data architecture

All data lives in `localStorage`. Every value is wrapped in a versioned envelope:

```json
{
  "version": 1,
  "data": {}
}
```

| Key | Contents |
| --- | --- |
| `reset_app_settings` | challenge dates, weights, step and water targets |
| `reset_habits` | habit definitions, categories, enabled state and target labels |
| `reset_daily_logs` | object keyed by `YYYY-MM-DD`; completed habits, prayers, notes |
| `reset_weight_logs` | array of weight entries |
| `reset_goals` | Udemy stages, YouTube videos, DevOps topics, product checklist |
| `reset_weekly_reflections` | weekly review entries |
| `reset_journals` | private emotional journal entries |

Example daily log:

```json
{
  "date": "2026-11-18",
  "completedHabits": ["quran", "gym", "focused-study"],
  "completedPrayers": ["fajr", "dhuhr", "asr", "maghrib", "isha"],
  "notes": "",
  "updatedAt": "2026-11-18T20:10:00.000Z"
}
```

### Backup format

**Settings → Data & backup → Export all data** downloads:

```json
{
  "app": "RESET",
  "schemaVersion": 1,
  "exportedAt": "2026-12-10T09:30:00.000Z",
  "data": {
    "settings": {},
    "habits": [],
    "dailyLogs": {},
    "weightLogs": [],
    "goals": {},
    "reflections": [],
    "journals": []
  }
}
```

Imports are validated and sanitised before they replace local data. Invalid files are rejected with an error message.

### Privacy and limitations

- There is **no encryption layer**. localStorage is protected by your device, browser profile and OS security.
- Clearing browser/site data will delete the app's data. Export a backup first.
- Data does not sync between devices. Move it with JSON export/import.
- The share card is generated fully on-device. No note or journal content is included.
- The app never sends your data to a server.

---

## PWA installation

The app must be served over **HTTPS** for installation and offline support (localhost is the exception for development).

### Android (Chrome / Edge)

1. Open the app in Chrome.
2. Tap the menu (⋮) → **Install app** / **Add to Home screen**.
3. If the install prompt appears in-app, use **Settings → Install app → Install app**.

The app opens in standalone mode with its own icon and splash/theme.

### iPhone / iPad (Safari)

1. Open the app in **Safari**. Third-party browsers cannot install PWAs on iOS.
2. Tap the **Share** button.
3. Choose **Add to Home Screen**.
4. Confirm the name **RESET**.

The app launches full screen with the dark status bar and generated iOS splash screens.

### Desktop

Use the install icon in the Chrome/Edge address bar, or the browser menu → **Install RESET**.

### Offline behaviour and updates

- All app assets, fonts and icons are precached by the service worker.
- After the first successful load, open the installed app without a connection.
- `registerType: 'autoUpdate'` is enabled. A new deployment is picked up on the next load; the old cache is cleaned automatically.

---

## Deployment

The app is a static bundle. `base` is relative (`./`) and routing uses `HashRouter`, so it works on any static host without rewrite rules, including project sub-paths.

### Vercel

1. Import the repository.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy. Vercel provides HTTPS automatically.

Or with the CLI:

```bash
npm i -g vercel
vercel --prod
```

### Netlify

1. Add a new site from Git.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Deploy. HTTPS is automatic.

Or with the CLI:

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages

1. Run `npm run build`.
2. Publish the contents of `dist/` (for example with a GitHub Actions Pages workflow or by pushing `dist/` to a `gh-pages` branch).
3. Enable **Settings → Pages** and use HTTPS.

Because the build uses relative asset paths and hash routing, it works at both `username.github.io/repo/` and a custom domain. Do not upload the repository root; publish the built `dist/` directory.

### Any static host

Upload `dist/` to Cloudflare Pages, S3 + CloudFront, Firebase Hosting, nginx, Caddy, or any static file server. Serve `index.html` for the root path and keep HTTPS enabled for the PWA.

No environment variables, server functions or database setup are required.

---

## Project structure

```text
src/
  components/       Reusable UI, navigation, charts, share card, modals
  data/             Default habits, goals, quotes and category metadata
  hooks/            localStorage, today, etc.
  pages/            Dashboard, Progress, Goals, Weekly, Settings, Journal
  store/            Central AppStore provider and mutation API
  types/            Shared TypeScript models
  utils/            Analytics, dates, streaks, export, share, storage
  App.tsx           Hash routes and lazy page loading
  index.css         Tailwind theme, global styles and motion
public/
  favicon.svg
  apple-touch-icon.png
  icons/            PWA icons, maskable icon and iOS splash screens
scripts/
  generate-icons.mjs
vite.config.ts      React, Tailwind and PWA configuration
```

### Adding or changing a page

- Pages are lazy-loaded in `src/App.tsx` and rendered inside the responsive shell in `src/components/AppShell.tsx`.
- Add a route, then add an entry to `NAV_ITEMS` in `src/components/BottomNavigation.tsx` for primary navigation.
- The desktop sidebar in `AppShell.tsx` uses the same nav list, plus a separate Reset space link.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build production assets + PWA |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check only |
| `npm run icons` | Regenerate PNG icons and iOS splash screens |

---

## Troubleshooting

**The app is blank on a static host.**
Publish the built `dist/` directory, not the repository source, and make sure the host serves `index.html` at the base URL. HTTPS is required for the service worker.

**The install button does not appear.**
Android install prompts depend on HTTPS and browser heuristics. Use the browser menu. On iPhone, installation is only available through Safari → Share → Add to Home Screen.

**My data disappeared.**
Clearing site data, uninstalling the PWA with data deletion, or a browser storage cleanup will remove localStorage. Restore from a previously exported JSON backup in Settings. Export regularly.

**The share image is not generating.**
Image generation uses the local canvas/font stack. Keep the page open until it finishes and try again. On unsupported browsers, the image still downloads instead of opening the native share sheet.

**Charts look empty.**
Charts render only from local data. Log habits and weight entries first. Empty weeks intentionally show zero unless logs exist.

**Changes to the challenge dates changed my day count.**
This is expected. The day count is calculated from the start and end dates. Existing habit logs, weights and reviews are not deleted.

---

## Notes on the transition to January 2027

The default tracked window ends the day before the configured end date. On 15 January 2027 the challenge is complete, and the app still shows your history, weight chart, goals and reflections. You can start a new challenge by changing the dates in Settings (and exporting the old backup first if you want to preserve a snapshot).

---

Built for one person: show up, pray, train, study, create, sleep, repeat.
