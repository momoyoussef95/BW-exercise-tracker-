import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { calcXP } from '../utils/gamification'

const todayStr = () => format(new Date(), 'yyyy-MM-dd')

const SUGGESTIONS = [
  'Bench Press', 'Squats', 'Deadlift', 'Pull-ups', 'Dips',
  'Rows', 'Shoulder Press', 'Bicep Curls', 'Triceps',
  'Treadmill', 'Running', 'Jogging', 'Biking',
  'Push-ups', 'Lat Pulldown', 'Leg Press', 'Glute Machine',
]

const EMPTY_FORM = { type: 'weights', duration: '', exercisesRaw: '', notes: '', partner: '' }

export default function TodayLogView({
  workouts, bodyWeights, skips,
  onSaveWorkout, onSaveWeight, onSaveSkip, onDeleteSkip,
}) {
  const today = todayStr()
  const todayWorkout = workouts.find(w => w.date === today)
  const todayWeight = bodyWeights[today]
  const todaySkip = skips[today]

  const [showGymForm, setShowGymForm] = useState(false)
  const [gymForm, setGymForm] = useState(EMPTY_FORM)
  const [weightInput, setWeightInput] = useState('')
  const [showSkipForm, setShowSkipForm] = useState(false)
  const [skipReason, setSkipReason] = useState('')

  useEffect(() => {
    setWeightInput(todayWeight != null ? todayWeight.toString() : '')
  }, [todayWeight])

  const openEdit = () => {
    if (todayWorkout) {
      setGymForm({
        type: todayWorkout.type,
        duration: todayWorkout.duration.toString(),
        exercisesRaw: todayWorkout.exercises?.join(', ') || '',
        notes: todayWorkout.notes || '',
        partner: todayWorkout.partner || '',
      })
    } else {
      setGymForm(EMPTY_FORM)
    }
    setShowGymForm(true)
  }

  const handleSaveGym = () => {
    if (!gymForm.duration) return
    const exercises = gymForm.exercisesRaw.split(',').map(e => e.trim()).filter(Boolean)
    const isEdit = !!todayWorkout
    const workout = {
      id: isEdit ? todayWorkout.id : `w-${today}-${Date.now()}`,
      date: today,
      type: gymForm.type,
      duration: parseInt(gymForm.duration) || 0,
      exercises,
      notes: gymForm.notes,
      partner: gymForm.partner.trim() || null,
      dayNumber: isEdit ? todayWorkout.dayNumber : workouts.length + 1,
      xp: 0,
    }
    workout.xp = calcXP(workout)
    onSaveWorkout(workout)
    setShowGymForm(false)
    setGymForm(EMPTY_FORM)
  }

  const handleSaveWeight = () => {
    const val = parseFloat(weightInput)
    if (!isNaN(val) && val > 50 && val < 600) onSaveWeight(today, val)
  }

  const handleSaveSkip = () => {
    onSaveSkip(today, skipReason)
    setShowSkipForm(false)
    setSkipReason('')
  }

  const previewXP = gymForm.duration
    ? calcXP({
        type: gymForm.type,
        duration: parseInt(gymForm.duration) || 0,
        notes: gymForm.notes,
        partner: gymForm.partner.trim() || null,
      })
    : 0

  const addSuggestion = (s) =>
    setGymForm(f => ({
      ...f,
      exercisesRaw: f.exercisesRaw ? `${f.exercisesRaw}, ${s}` : s,
    }))

  const filteredSuggestions = SUGGESTIONS.filter(s => !gymForm.exercisesRaw.includes(s)).slice(0, 10)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Log</h2>
        <p className="text-sm text-slate-400">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Rest day banner */}
      {todaySkip && !todayWorkout && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl mt-0.5">😴</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Rest Day</p>
            {todaySkip.reason && (
              <p className="text-sm text-amber-700 mt-0.5">{todaySkip.reason}</p>
            )}
          </div>
          <button
            onClick={() => onDeleteSkip(today)}
            className="text-xs text-amber-500 underline shrink-0"
          >
            Undo
          </button>
        </div>
      )}

      {/* Logged workout banner */}
      {todayWorkout && !showGymForm && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl mt-0.5">
            {todayWorkout.type === 'weights' ? '🏋️' : todayWorkout.type === 'cardio' ? '🏃' : '⚡'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-emerald-800">
              Day {todayWorkout.dayNumber} done! +{todayWorkout.xp} XP ✨
            </p>
            <p className="text-sm text-emerald-700 truncate mt-0.5">
              {todayWorkout.exercises?.slice(0, 4).join(', ')} · {todayWorkout.duration}min
            </p>
            {todayWorkout.notes && (
              <p className="text-xs text-emerald-600 mt-1 italic">"{todayWorkout.notes}"</p>
            )}
          </div>
          <button
            onClick={openEdit}
            className="text-xs text-emerald-600 underline shrink-0"
          >
            Edit
          </button>
        </div>
      )}

      {/* Gym form (add or edit) */}
      {showGymForm && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800">
              {todayWorkout ? '✏️ Edit Session' : '🏋️ Log Session'}
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3.5">
            {/* Type */}
            <div className="flex gap-2">
              {[
                { v: 'weights', label: '🏋️ Weights' },
                { v: 'cardio',  label: '🏃 Cardio' },
                { v: 'mixed',   label: '⚡ Mixed' },
              ].map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => setGymForm(f => ({ ...f, type: v }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    gymForm.type === v
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Duration (minutes)</label>
              <input
                type="number"
                value={gymForm.duration}
                onChange={e => setGymForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="e.g. 45"
                className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-300"
                min="1"
              />
            </div>

            {/* Exercises */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Exercises (comma separated)</label>
              <input
                type="text"
                value={gymForm.exercisesRaw}
                onChange={e => setGymForm(f => ({ ...f, exercisesRaw: e.target.value }))}
                placeholder="Bench Press, Squats, Pull-ups"
                className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-300"
              />
              {filteredSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {filteredSuggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => addSuggestion(s)}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Notes</label>
              <textarea
                value={gymForm.notes}
                onChange={e => setGymForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="How did it feel? PRs? Energy level..."
                className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-300 resize-none text-sm"
                rows={2}
              />
            </div>

            {/* Partner */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Workout Partner (optional)</label>
              <input
                type="text"
                value={gymForm.partner}
                onChange={e => setGymForm(f => ({ ...f, partner: e.target.value }))}
                placeholder="e.g. Hassan, Melike"
                className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            {previewXP > 0 && (
              <p className="text-xs text-emerald-600 font-medium">✨ +{previewXP} XP for this session</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowGymForm(false); setGymForm(EMPTY_FORM) }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGym}
                disabled={!gymForm.duration}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                {todayWorkout ? 'Save Changes' : `Log Day ${workouts.length + 1}! 💪`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt to log (if nothing logged yet) */}
      {!todayWorkout && !todaySkip && !showGymForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <button
            onClick={openEdit}
            className="w-full py-3.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors"
          >
            + Log Today's Session
          </button>
        </div>
      )}

      {/* Body Weight */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800">⚖️ Body Weight</h3>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              placeholder="e.g. 165.5"
              className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-300"
              step="0.1"
              min="50"
              max="600"
            />
            <span className="text-slate-400 font-medium">lbs</span>
            <button
              onClick={handleSaveWeight}
              className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
            >
              Save
            </button>
          </div>
          {todayWeight != null && (
            <p className="text-xs text-emerald-600 mt-2">✓ Today: {todayWeight} lbs</p>
          )}
        </div>
      </div>

      {/* Skip / Rest Day */}
      {!todayWorkout && !todaySkip && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {showSkipForm ? (
            <div className="px-5 py-4 space-y-3">
              <h3 className="font-semibold text-slate-700">😴 Mark as Rest Day</h3>
              <textarea
                value={skipReason}
                onChange={e => setSkipReason(e.target.value)}
                placeholder="What's up? Tired, busy, sore... (optional)"
                className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-amber-300 resize-none text-sm"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowSkipForm(false); setSkipReason('') }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSkip}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 text-white text-sm font-semibold hover:bg-amber-500 transition-colors"
                >
                  Log Rest Day
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-3.5">
              <button
                onClick={() => setShowSkipForm(true)}
                className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-400 font-medium text-sm hover:bg-amber-50 hover:text-amber-500 transition-colors"
              >
                😴 Mark as Rest Day
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
