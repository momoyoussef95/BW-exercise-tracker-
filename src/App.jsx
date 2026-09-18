import { useState, useEffect } from 'react'
import DashboardView from './components/DashboardView'
import TodayLogView from './components/TodayLogView'
import StatsView from './components/StatsView'
import AchievementsView from './components/AchievementsView'
import HistoryView from './components/HistoryView'
import {
  getWorkouts, saveWorkout, deleteWorkout,
  getBodyWeights, saveBodyWeight,
  getSkips, saveSkip, deleteSkip,
  isSeeded, markSeeded, bulkSaveWorkouts,
} from './utils/storage'
import { SEED_WORKOUTS, SEED_WEIGHT } from './utils/seedData'

const TABS = [
  { id: 'home',    label: 'Home',    icon: '🏠' },
  { id: 'log',     label: 'Log',     icon: '📝' },
  { id: 'stats',   label: 'Stats',   icon: '📊' },
  { id: 'wins',    label: 'Wins',    icon: '🏆' },
  { id: 'history', label: 'History', icon: '📋' },
]

export default function App() {
  const [tab, setTab] = useState('home')
  const [workouts, setWorkouts] = useState([])
  const [bodyWeights, setBodyWeights] = useState({})
  const [skips, setSkips] = useState({})

  useEffect(() => {
    if (!isSeeded()) {
      bulkSaveWorkouts(SEED_WORKOUTS)
      localStorage.setItem('et_weights', JSON.stringify(SEED_WEIGHT))
      markSeeded()
    }
    setWorkouts(getWorkouts())
    setBodyWeights(getBodyWeights())
    setSkips(getSkips())
  }, [])

  const handleSaveWorkout = (workout) => setWorkouts([...saveWorkout(workout)])
  const handleDeleteWorkout = (id) => setWorkouts([...deleteWorkout(id)])
  const handleSaveWeight = (date, weight) => setBodyWeights({ ...saveBodyWeight(date, weight) })
  const handleSaveSkip = (date, reason) => setSkips({ ...saveSkip(date, reason) })
  const handleDeleteSkip = (date) => setSkips({ ...deleteSkip(date) })

  const view = {
    home: (
      <DashboardView workouts={workouts} bodyWeights={bodyWeights} />
    ),
    log: (
      <TodayLogView
        workouts={workouts}
        bodyWeights={bodyWeights}
        skips={skips}
        onSaveWorkout={handleSaveWorkout}
        onSaveWeight={handleSaveWeight}
        onSaveSkip={handleSaveSkip}
        onDeleteSkip={handleDeleteSkip}
      />
    ),
    stats: <StatsView workouts={workouts} bodyWeights={bodyWeights} />,
    wins: <AchievementsView workouts={workouts} />,
    history: (
      <HistoryView
        workouts={workouts}
        skips={skips}
        onDelete={handleDeleteWorkout}
        onSaveWorkout={handleSaveWorkout}
      />
    ),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-2">
        <span className="text-2xl">💪</span>
        <h1 className="text-lg font-bold text-slate-900">Exercise Tracker</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-28">
        {view[tab]}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 safe-b">
        <div className="max-w-lg mx-auto flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
                tab === t.id ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
