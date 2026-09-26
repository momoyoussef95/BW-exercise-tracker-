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
  getEntries, saveEntry, deleteEntry,
  getSports, saveSport, deleteSport,
  getQuickWins, saveQuickWin, deleteQuickWin,
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

const THEMES = [
  { id: 'light', icon: '☀️', label: 'Light' },
  { id: 'dark',  icon: '🌙', label: 'Dark' },
  { id: 'fun',   icon: '🎉', label: 'Fun' },
]

export default function App() {
  const [tab, setTab] = useState('home')
  const [workouts, setWorkouts] = useState([])
  const [bodyWeights, setBodyWeights] = useState({})
  const [skips, setSkips] = useState({})
  const [entries, setEntries] = useState({})
  const [sports, setSports] = useState([])
  const [quickWins, setQuickWins] = useState([])
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('et_theme') || 'light' } catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('et_theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    if (!isSeeded()) {
      bulkSaveWorkouts(SEED_WORKOUTS)
      localStorage.setItem('et_weights', JSON.stringify(SEED_WEIGHT))
      markSeeded()
    }
    setWorkouts(getWorkouts())
    setBodyWeights(getBodyWeights())
    setSkips(getSkips())
    setEntries(getEntries())
    setSports(getSports())
    setQuickWins(getQuickWins())
  }, [])

  const handleSaveWorkout = (workout) => setWorkouts([...saveWorkout(workout)])
  const handleDeleteWorkout = (id) => setWorkouts([...deleteWorkout(id)])
  const handleSaveWeight = (date, weight) => setBodyWeights({ ...saveBodyWeight(date, weight) })
  const handleSaveSkip = (date, reason) => setSkips({ ...saveSkip(date, reason) })
  const handleDeleteSkip = (date) => setSkips({ ...deleteSkip(date) })
  const handleSaveEntry = (date, entry) => setEntries({ ...saveEntry(date, entry) })
  const handleDeleteEntry = (date) => setEntries({ ...deleteEntry(date) })
  const handleSaveSport = (sport) => setSports([...saveSport(sport)])
  const handleDeleteSport = (id) => setSports([...deleteSport(id)])
  const handleSaveQuickWin = (win) => setQuickWins([...saveQuickWin(win)])
  const handleDeleteQuickWin = (id) => setQuickWins([...deleteQuickWin(id)])

  const view = {
    home: (
      <DashboardView
        workouts={workouts}
        bodyWeights={bodyWeights}
        entries={entries}
        sports={sports}
        quickWins={quickWins}
      />
    ),
    log: (
      <TodayLogView
        workouts={workouts}
        bodyWeights={bodyWeights}
        skips={skips}
        entries={entries}
        sports={sports}
        quickWins={quickWins}
        onSaveWorkout={handleSaveWorkout}
        onSaveWeight={handleSaveWeight}
        onSaveSkip={handleSaveSkip}
        onDeleteSkip={handleDeleteSkip}
        onSaveEntry={handleSaveEntry}
        onDeleteEntry={handleDeleteEntry}
        onSaveSport={handleSaveSport}
        onDeleteSport={handleDeleteSport}
        onSaveQuickWin={handleSaveQuickWin}
        onDeleteQuickWin={handleDeleteQuickWin}
      />
    ),
    stats: (
      <StatsView
        workouts={workouts}
        bodyWeights={bodyWeights}
        sports={sports}
        entries={entries}
        quickWins={quickWins}
      />
    ),
    wins: <AchievementsView workouts={workouts} quickWins={quickWins} onDeleteQuickWin={handleDeleteQuickWin} />,
    history: (
      <HistoryView
        workouts={workouts}
        skips={skips}
        entries={entries}
        sports={sports}
        onDelete={handleDeleteWorkout}
        onSaveWorkout={handleSaveWorkout}
        onDeleteSport={handleDeleteSport}
      />
    ),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-2">
        <span className="text-2xl">💪</span>
        <h1 className="text-lg font-bold text-slate-900 flex-1">Fitness Tracker</h1>
        <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.label}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors ${
                theme === t.id ? 'bg-white shadow-sm' : 'opacity-50'
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>
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
