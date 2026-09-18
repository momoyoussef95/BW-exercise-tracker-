import { useState, useEffect } from 'react'
import TodayView from './components/TodayView'
import WeeklyView from './components/WeeklyView'
import MonthlyView from './components/MonthlyView'
import GoalsView from './components/GoalsView'
import HistoryView from './components/HistoryView'
import { getEntries, saveEntry, deleteEntry, getGoals, saveGoals } from './utils/storage'

const TABS = [
  { id: 'today', label: 'Today', icon: '🏋️' },
  { id: 'week', label: 'Week', icon: '📅' },
  { id: 'month', label: 'Month', icon: '📆' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'history', label: 'History', icon: '📋' },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const [entries, setEntries] = useState({})
  const [goals, setGoals] = useState({})

  useEffect(() => {
    setEntries(getEntries())
    setGoals(getGoals())
  }, [])

  const handleSaveEntry = (date, entry) => setEntries({ ...saveEntry(date, entry) })
  const handleDeleteEntry = (date) => setEntries({ ...deleteEntry(date) })
  const handleUpdateGoals = (newGoals) => setGoals({ ...saveGoals(newGoals) })

  const view = {
    today: <TodayView entries={entries} goals={goals} onSave={handleSaveEntry} onDelete={handleDeleteEntry} />,
    week: <WeeklyView entries={entries} goals={goals} />,
    month: <MonthlyView entries={entries} goals={goals} />,
    goals: <GoalsView goals={goals} onUpdate={handleUpdateGoals} entries={entries} />,
    history: <HistoryView entries={entries} onDelete={handleDeleteEntry} onEdit={handleSaveEntry} />,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-2">
        <span className="text-2xl">💪</span>
        <h1 className="text-lg font-bold text-slate-900">Body Weight Tracker</h1>
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
