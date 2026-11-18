import { lazy } from 'react'
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Card } from './components/Card'
import { Button } from './components/Button'
import Dashboard from './pages/Dashboard'

const Progress = lazy(() => import('./pages/Progress'))
const Goals = lazy(() => import('./pages/Goals'))
const Weekly = lazy(() => import('./pages/Weekly'))
const Settings = lazy(() => import('./pages/Settings'))
const Journal = lazy(() => import('./pages/Journal'))

function NotFound() {
  return (
    <div className="pt-10">
      <Card className="p-8 text-center">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
          Lost the path
        </div>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-white">
          This page does not exist
        </h1>
        <p className="mt-2 text-[12px] text-muted">
          Return to today. That is the only place the work happens.
        </p>
        <Link to="/" className="mt-5 inline-block">
          <Button variant="primary">Back to today</Button>
        </Link>
      </Card>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="progress" element={<Progress />} />
          <Route path="goals" element={<Goals />} />
          <Route path="weekly" element={<Weekly />} />
          <Route path="settings" element={<Settings />} />
          <Route path="journal" element={<Journal />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
