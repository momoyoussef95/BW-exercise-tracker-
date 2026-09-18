import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { formatPlank } from '../utils/calculations'

function GoalInput({ icon, label, field, value, unit, onChange }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="ml-auto text-xs text-slate-400 font-medium uppercase tracking-wide">{unit}</span>
      </div>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(field, Math.max(0, parseInt(e.target.value) || 0))}
        className="w-full text-3xl font-bold text-slate-900 bg-transparent outline-none"
        placeholder="0"
        min="0"
      />
    </div>
  )
}

export default function GoalsView({ goals, onUpdate, entries }) {
  const [form, setForm] = useState({ pushups: goals.pushups || 0, squats: goals.squats || 0, plank: goals.plank || 0 })
  const [editing, setEditing] = useState(!goals.pushups && !goals.squats && !goals.plank)
  const [toast, setToast] = useState(false)

  const handleChange = (field, val) => setForm((f) => ({ ...f, [field]: val }))

  const handleSave = () => {
    onUpdate(form)
    setEditing(false)
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  const history = goals.history || []

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg z-50">
          ✓ Goals updated!
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Goals 🎯</h2>
          {goals.updatedAt && (
            <p className="text-sm text-slate-400">Last updated {format(parseISO(goals.updatedAt), 'MMM d, yyyy')}</p>
          )}
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-4 py-2 rounded-xl transition-colors">
            Edit Goals
          </button>
        )}
      </div>

      {!editing ? (
        <div className="space-y-3">
          {[
            { icon: '💪', label: 'Pushups', value: goals.pushups, display: (v) => `${v} reps`, color: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-700' },
            { icon: '🦵', label: 'Squats', value: goals.squats, display: (v) => `${v} reps`, color: 'border-blue-200 bg-blue-50', text: 'text-blue-700' },
            { icon: '⏱️', label: 'Plank', value: goals.plank, display: formatPlank, color: 'border-violet-200 bg-violet-50', text: 'text-violet-700' },
          ].map((g) => (
            <div key={g.label} className={`rounded-2xl p-5 border ${g.color} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <span className="font-semibold text-slate-700">{g.label}</span>
              </div>
              <span className={`text-2xl font-bold ${g.text}`}>{g.display(g.value || 0)}</span>
            </div>
          ))}
          <p className="text-xs text-slate-400 text-center pt-1">Update your goals any time — biweekly or monthly works great.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <GoalInput icon="💪" label="Pushup Goal" field="pushups" value={form.pushups} unit="reps" onChange={handleChange} />
          <GoalInput icon="🦵" label="Squat Goal" field="squats" value={form.squats} unit="reps" onChange={handleChange} />
          <GoalInput icon="⏱️" label="Plank Goal" field="plank" value={form.plank} unit="seconds" onChange={handleChange} />
          <div className="flex gap-3">
            {(goals.pushups || goals.squats || goals.plank) && (
              <button onClick={() => { setForm({ pushups: goals.pushups, squats: goals.squats, plank: goals.plank }); setEditing(false) }} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold">
                Cancel
              </button>
            )}
            <button onClick={handleSave} className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors">
              Save Goals
            </button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-3">Goal History</h3>
          <div className="space-y-3">
            {[...history].reverse().map((h, i) => (
              <div key={i} className="flex justify-between items-start text-sm border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="text-slate-400 text-xs">{format(parseISO(h.setAt), 'MMM d, yyyy')}</div>
                <div className="text-right text-slate-600">
                  <span className="text-emerald-600 font-medium">{h.pushups}p</span>
                  {' · '}
                  <span className="text-blue-600 font-medium">{h.squats}s</span>
                  {' · '}
                  <span className="text-violet-600 font-medium">{formatPlank(h.plank)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
