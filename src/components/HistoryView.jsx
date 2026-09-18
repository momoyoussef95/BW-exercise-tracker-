import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { formatPlank } from '../utils/calculations'

export default function HistoryView({ entries, onDelete, onEdit }) {
  const [editDate, setEditDate] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const sorted = Object.entries(entries)
    .sort(([a], [b]) => b.localeCompare(a))

  const startEdit = (date, entry) => {
    setEditDate(date)
    setEditForm({ pushups: entry.pushups || 0, squats: entry.squats || 0, plank: entry.plank || 0 })
  }

  const saveEdit = () => {
    onEdit(editDate, editForm)
    setEditDate(null)
  }

  if (sorted.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">History 📋</h2>
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-slate-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">No entries yet. Start by logging today's workout!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">History 📋</h2>
        <p className="text-sm text-slate-400">{sorted.length} days logged</p>
      </div>

      {sorted.map(([date, entry]) => {
        const isEditing = editDate === date
        const isConfirmingDelete = deleteConfirm === date
        const d = parseISO(date)

        return (
          <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between border-b border-slate-50">
              <div>
                <p className="font-semibold text-slate-800">{format(d, 'EEEE')}</p>
                <p className="text-xs text-slate-400">{format(d, 'MMMM d, yyyy')}</p>
              </div>
              <div className="flex gap-2">
                {!isEditing && (
                  <>
                    <button onClick={() => startEdit(date, entry)} className="text-xs text-blue-500 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50">
                      Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(date)} className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="px-5 py-4 space-y-3">
                {[
                  { icon: '💪', field: 'pushups', label: 'Pushups', unit: 'reps' },
                  { icon: '🦵', field: 'squats', label: 'Squats', unit: 'reps' },
                  { icon: '⏱️', field: 'plank', label: 'Plank', unit: 'seconds' },
                ].map((f) => (
                  <div key={f.field} className="flex items-center gap-3">
                    <span className="text-lg w-7 text-center">{f.icon}</span>
                    <span className="text-sm text-slate-500 w-16">{f.label}</span>
                    <input
                      type="number"
                      value={editForm[f.field] || ''}
                      onChange={(e) => setEditForm((ef) => ({ ...ef, [f.field]: parseInt(e.target.value) || 0 }))}
                      className="flex-1 text-right text-lg font-bold text-slate-900 bg-slate-50 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-300"
                      min="0"
                    />
                    <span className="text-xs text-slate-400 w-12">{f.unit}</span>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditDate(null)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">Cancel</button>
                  <button onClick={saveEdit} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold">Save</button>
                </div>
              </div>
            ) : isConfirmingDelete ? (
              <div className="px-5 py-4 flex items-center justify-between bg-red-50">
                <p className="text-sm text-red-600">Delete this entry?</p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteConfirm(null)} className="text-sm text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100">No</button>
                  <button onClick={() => { onDelete(date); setDeleteConfirm(null) }} className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-medium">Yes, delete</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 divide-x divide-slate-50">
                <div className="py-4 text-center">
                  <p className="text-xl font-bold text-emerald-600">{entry.pushups || 0}</p>
                  <p className="text-xs text-slate-400">💪 pushups</p>
                </div>
                <div className="py-4 text-center">
                  <p className="text-xl font-bold text-blue-600">{entry.squats || 0}</p>
                  <p className="text-xs text-slate-400">🦵 squats</p>
                </div>
                <div className="py-4 text-center">
                  <p className="text-xl font-bold text-violet-600">{formatPlank(entry.plank)}</p>
                  <p className="text-xs text-slate-400">⏱️ plank</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
