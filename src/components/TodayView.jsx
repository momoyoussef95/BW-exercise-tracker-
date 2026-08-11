import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { todayStr, getStreak, getPersonalBests, formatPlank } from '../utils/calculations'

function GoalRing({ value, goal, color }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

function StatRing({ label, value, goal, color, display }) {
  const pct = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <GoalRing value={value} goal={goal} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-700">{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className="text-xs text-slate-400">{display(value)} / {display(goal)}</p>
    </div>
  )
}

export default function TodayView({ entries, goals, onSave }) {
  const date = todayStr()
  const existing = entries[date]
  const [form, setForm] = useState({ pushups: 0, squats: 0, plank: 0 })
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (existing) {
      setForm({ pushups: existing.pushups || 0, squats: existing.squats || 0, plank: existing.plank || 0 })
      setSaved(true)
    } else {
      setForm({ pushups: 0, squats: 0, plank: 0 })
      setSaved(false)
    }
  }, [entries])

  const streak = getStreak(entries)
  const pbs = getPersonalBests(entries)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleSave = () => {
    if (!form.pushups && !form.squats && !form.plank) return
    onSave(date, form)
    setSaved(true)
    showToast('Workout saved!')
  }

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: Math.max(0, parseInt(e.target.value) || 0) }))

  const inputClass = 'w-full text-4xl font-bold text-center bg-transparent outline-none text-slate-900 py-2'

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg z-50 transition-all">
          ✓ {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{format(new Date(), 'EEEE')}</h2>
          <p className="text-slate-400 text-sm">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2">
          <span className="text-xl">🔥</span>
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600 leading-none">{streak}</p>
            <p className="text-xs text-amber-400">day streak</p>
          </div>
        </div>
      </div>

      {saved ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-emerald-800">Today logged ✓</span>
            <button onClick={() => setSaved(false)} className="text-sm text-emerald-600 underline underline-offset-2">Edit</button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-700">{form.pushups}</p>
              <p className="text-xs text-emerald-500">💪 Pushups</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{form.squats}</p>
              <p className="text-xs text-blue-500">🦵 Squats</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-violet-700">{formatPlank(form.plank)}</p>
              <p className="text-xs text-violet-500">⏱️ Plank</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-4 pb-1">
              <span className="text-2xl">💪</span>
              <span className="font-semibold text-slate-600 flex-1">Pushups</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">reps</span>
            </div>
            <input type="number" value={form.pushups || ''} onChange={set('pushups')} className={inputClass} placeholder="0" min="0" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-4 pb-1">
              <span className="text-2xl">🦵</span>
              <span className="font-semibold text-slate-600 flex-1">Squats</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">reps</span>
            </div>
            <input type="number" value={form.squats || ''} onChange={set('squats')} className={inputClass} placeholder="0" min="0" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-4 pb-1">
              <span className="text-2xl">⏱️</span>
              <span className="font-semibold text-slate-600 flex-1">Plank</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">seconds</span>
            </div>
            <input type="number" value={form.plank || ''} onChange={set('plank')} className={inputClass} placeholder="0" min="0" />
          </div>
          <button
            onClick={handleSave}
            disabled={!form.pushups && !form.squats && !form.plank}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-colors text-lg"
          >
            Save Workout
          </button>
        </div>
      )}

      {(goals.pushups || goals.squats || goals.plank) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Today vs Goal</h3>
          <div className="flex justify-around">
            <StatRing label="Pushups" value={form.pushups} goal={goals.pushups} color="#10b981" display={(v) => v} />
            <StatRing label="Squats" value={form.squats} goal={goals.squats} color="#3b82f6" display={(v) => v} />
            <StatRing label="Plank" value={form.plank} goal={goals.plank} color="#8b5cf6" display={formatPlank} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-slate-700 mb-3">Personal Bests 🏆</h3>
        <div className="space-y-2.5">
          {[
            { icon: '💪', label: 'Pushups', value: `${pbs.pushups} reps`, color: 'text-emerald-600' },
            { icon: '🦵', label: 'Squats', value: `${pbs.squats} reps`, color: 'text-blue-600' },
            { icon: '⏱️', label: 'Plank', value: formatPlank(pbs.plank), color: 'text-violet-600' },
          ].map((r) => (
            <div key={r.label} className="flex justify-between items-center">
              <span className="text-slate-500">{r.icon} {r.label}</span>
              <span className={`font-bold ${r.color}`}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
