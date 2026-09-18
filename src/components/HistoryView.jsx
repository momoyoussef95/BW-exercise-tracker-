import { useState } from 'react'
import { format } from 'date-fns'

const TYPE_ICONS = { weights: '🏋️', cardio: '🏃', mixed: '⚡' }

export default function HistoryView({ workouts, skips, onDelete, onSaveWorkout }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandId, setExpandId] = useState(null)

  const items = [
    ...workouts.map(w => ({ ...w, _kind: 'workout' })),
    ...Object.entries(skips).map(([date, skip]) => ({
      id: `skip-${date}`,
      date,
      _kind: 'skip',
      reason: skip.reason,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">History 📋</h2>
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-slate-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">No entries yet. Start logging!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">History 📋</h2>
        <p className="text-sm text-slate-400">{workouts.length} workout days logged</p>
      </div>

      {items.map(item => {
        const d = new Date(item.date + 'T12:00:00')
        const isExpanded = expandId === item.id
        const isDeleting = deleteConfirm === item.id

        if (item._kind === 'skip') {
          return (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm">
              <div className="px-5 py-3.5 flex items-center gap-3">
                <span className="text-xl shrink-0">😴</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-500">Rest Day</p>
                  <p className="text-xs text-slate-400">{format(d, 'EEEE, MMM d')}</p>
                  {item.reason && (
                    <p className="text-xs text-slate-400 mt-0.5 italic">{item.reason}</p>
                  )}
                </div>
              </div>
            </div>
          )
        }

        return (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div
              className="px-5 py-3.5 flex items-center gap-3 cursor-pointer active:bg-slate-50"
              onClick={() => setExpandId(isExpanded ? null : item.id)}
            >
              <span className="text-xl shrink-0">{TYPE_ICONS[item.type] || '💪'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 text-sm">Day {item.dayNumber}</span>
                  <span>·</span>
                  <span>{item.duration}min</span>
                  {item.partner && (
                    <>
                      <span>·</span>
                      <span>👥 {item.partner}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {format(d, 'EEEE, MMM d')} · {item.exercises?.slice(0, 3).join(', ')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-emerald-600">+{item.xp} xp</p>
                <p className="text-slate-300 text-xs mt-0.5">{isExpanded ? '▲' : '▼'}</p>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-slate-50 px-5 py-3 space-y-2.5">
                {item.exercises?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.exercises.map(e => (
                      <span
                        key={e}
                        className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <p className="text-sm text-slate-600 italic">"{item.notes}"</p>
                )}
                {isDeleting ? (
                  <div className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2.5">
                    <p className="text-sm text-red-600">Delete Day {item.dayNumber}?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null) }}
                        className="text-xs text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100"
                      >
                        No
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(item.id)
                          setDeleteConfirm(null)
                          setExpandId(null)
                        }}
                        className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item.id) }}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete entry
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
