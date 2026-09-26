import { useState, useEffect } from 'react'
import { format, isToday as isTodayFn } from 'date-fns'
import { calcXP } from '../utils/gamification'

const todayStr = () => format(new Date(), 'yyyy-MM-dd')

const SUGGESTIONS = [
  // Chest
  'Bench Press', 'Incline Bench', 'Chest Press', 'Cable Flyes', 'Push-ups', 'Dips',
  // Back
  'Pull-ups', 'Rows', 'Lat Pulldown', 'Cable Rows', 'T-Bar Row', 'Back Extension',
  // Shoulders
  'Shoulder Press', 'Lateral Raises', 'Front Raises', 'Face Pulls', 'Arnold Press',
  // Arms
  'Bicep Curls', 'Hammer Curls', 'Triceps', 'Skull Crushers', 'French Press', 'Preacher Curl',
  // Legs
  'Squats', 'Deadlift', 'Leg Press', 'RDL', 'Hip Thrusts', 'Leg Extensions',
  'Leg Curls', 'Calf Raises', 'Glute Machine', 'Abductors', 'Kickouts', 'Hip Raises',
  // Cardio
  'Treadmill', 'Running', 'Jogging', 'Biking', 'Elliptical', 'Stairmaster', 'Jump Rope', 'Walking',
  // Core
  'Plank', 'Crunches', 'Sit-ups', 'Mountain Climbers', 'Ab Machine',
  // Other
  'Sled Push', 'Sled Pull', 'Battle Ropes', 'Burpees', 'Box Jumps', 'Yoga',
]

const SPORT_SUGGESTIONS = [
  'Soccer', 'Pickleball', 'Basketball', 'Tennis', 'Volleyball', 'Padel',
  'Badminton', 'Golf', 'Swimming', 'Hockey', 'Softball', 'Flag Football',
]

const EMPTY_FORM = { type: 'weights', duration: '', exercisesRaw: '', notes: '', partner: '' }
const EMPTY_SPORT_FORM = { sport: '', duration: '', notes: '', partner: '' }

export default function TodayLogView({
  workouts, bodyWeights, skips, entries, sports,
  onSaveWorkout, onSaveWeight, onSaveSkip, onDeleteSkip, onSaveEntry, onDeleteEntry,
  onSaveSport, onDeleteSport,
}) {
  const today = todayStr()
  const [selectedDate, setSelectedDate] = useState(today)

  const dateWorkout = workouts.find(w => w.date === selectedDate)
  const dateWeight = bodyWeights[selectedDate]
  const dateSkip = skips[selectedDate]
  const dateEntry = entries[selectedDate]
  const dateSports = sports.filter(s => s.date === selectedDate)

  const [showGymForm, setShowGymForm] = useState(false)
  const [gymForm, setGymForm] = useState(EMPTY_FORM)
  const [weightInput, setWeightInput] = useState('')
  const [showSkipForm, setShowSkipForm] = useState(false)
  const [skipReason, setSkipReason] = useState('')
  const [bwForm, setBwForm] = useState({ pushups: '', squats: '', plank: '' })
  const [bwSaved, setBwSaved] = useState(false)
  const [showSportForm, setShowSportForm] = useState(false)
  const [sportForm, setSportForm] = useState(EMPTY_SPORT_FORM)
  const [entForm, setEntForm] = useState({ done: false, minutes: '' })
  const [entSaved, setEntSaved] = useState(false)
  const [newsForm, setNewsForm] = useState({ done: false, minutes: '' })
  const [newsSaved, setNewsSaved] = useState(false)

  // Reset the on-screen forms whenever the selected date (or its data) changes
  useEffect(() => {
    setWeightInput(dateWeight != null ? dateWeight.toString() : '')
    setBwForm({
      pushups: dateEntry?.pushups?.toString() || '',
      squats: dateEntry?.squats?.toString() || '',
      plank: dateEntry?.plank?.toString() || '',
    })
    setEntForm({
      done: !!dateEntry?.entertainment?.done,
      minutes: dateEntry?.entertainment?.minutes?.toString() || '',
    })
    setNewsForm({
      done: !!dateEntry?.news?.done,
      minutes: dateEntry?.news?.minutes?.toString() || '',
    })
    setShowGymForm(false)
    setShowSportForm(false)
    setShowSkipForm(false)
    setBwSaved(false)
    setEntSaved(false)
    setNewsSaved(false)
  }, [selectedDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = () => {
    setGymForm(dateWorkout ? {
      type: dateWorkout.type,
      duration: dateWorkout.duration.toString(),
      exercisesRaw: dateWorkout.exercises?.join(', ') || '',
      notes: dateWorkout.notes || '',
      partner: dateWorkout.partner || '',
    } : EMPTY_FORM)
    setShowGymForm(true)
  }

  const handleSaveGym = () => {
    if (!gymForm.duration) return
    const exercises = gymForm.exercisesRaw.split(',').map(e => e.trim()).filter(Boolean)
    const isEdit = !!dateWorkout
    const workout = {
      id: isEdit ? dateWorkout.id : `w-${selectedDate}-${Date.now()}`,
      date: selectedDate,
      type: gymForm.type,
      duration: parseInt(gymForm.duration) || 0,
      exercises,
      notes: gymForm.notes,
      partner: gymForm.partner.trim() || null,
      dayNumber: isEdit ? dateWorkout.dayNumber : workouts.length + 1,
      xp: 0,
    }
    workout.xp = calcXP(workout)
    onSaveWorkout(workout)
    setShowGymForm(false)
    setGymForm(EMPTY_FORM)
  }

  const handleSaveWeight = () => {
    const val = parseFloat(weightInput)
    if (!isNaN(val) && val > 50 && val < 600) onSaveWeight(selectedDate, val)
  }

  const handleSaveSkip = () => {
    onSaveSkip(selectedDate, skipReason)
    setShowSkipForm(false)
    setSkipReason('')
  }

  const handleSaveBW = () => {
    const entry = {
      pushups: parseInt(bwForm.pushups) || 0,
      squats: parseInt(bwForm.squats) || 0,
      plank: parseInt(bwForm.plank) || 0,
    }
    if (!entry.pushups && !entry.squats && !entry.plank) return
    onSaveEntry(selectedDate, entry)
    setBwSaved(true)
    setTimeout(() => setBwSaved(false), 2000)
  }

  const handleSaveSport = () => {
    if (!sportForm.sport.trim() || !sportForm.duration) return
    const sport = {
      id: `sport-${selectedDate}-${Date.now()}`,
      date: selectedDate,
      sport: sportForm.sport.trim(),
      duration: parseInt(sportForm.duration) || 0,
      notes: sportForm.notes,
      partner: sportForm.partner.trim() || null,
    }
    onSaveSport(sport)
    setShowSportForm(false)
    setSportForm(EMPTY_SPORT_FORM)
  }

  const handleSaveEntertainment = () => {
    onSaveEntry(selectedDate, {
      entertainment: { done: entForm.done, minutes: parseInt(entForm.minutes) || 0 },
    })
    setEntSaved(true)
    setTimeout(() => setEntSaved(false), 2000)
  }

  const handleSaveNews = () => {
    onSaveEntry(selectedDate, {
      news: { done: newsForm.done, minutes: parseInt(newsForm.minutes) || 0 },
    })
    setNewsSaved(true)
    setTimeout(() => setNewsSaved(false), 2000)
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

  const usedExercises = gymForm.exercisesRaw.toLowerCase()
  const filteredSuggestions = SUGGESTIONS
    .filter(s => !usedExercises.includes(s.toLowerCase()))
    .slice(0, 12)

  const filteredSportSuggestions = SPORT_SUGGESTIONS
    .filter(s => s.toLowerCase() !== sportForm.sport.trim().toLowerCase())
    .slice(0, 12)

  const formatPlank = (s) => {
    if (!s) return ''
    const sec = parseInt(s) || 0
    const m = Math.floor(sec / 60)
    const r = sec % 60
    if (m === 0) return `${r}s`
    if (r === 0) return `${m}m`
    return `${m}m ${r}s`
  }

  const isSelectedToday = isTodayFn(new Date(selectedDate + 'T12:00:00'))
  const dateLabel = isSelectedToday
    ? `Today, ${format(new Date(selectedDate + 'T12:00:00'), 'MMMM d')}`
    : format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Log</h2>
        <p className="text-sm text-slate-400">{dateLabel}</p>
      </div>

      {/* Date picker - log any day, not just today */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
        <span className="text-xl shrink-0">📅</span>
        <label className="text-sm text-slate-500 shrink-0">Logging for</label>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={e => setSelectedDate(e.target.value)}
          className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
        />
        {!isSelectedToday && (
          <button
            onClick={() => setSelectedDate(today)}
            className="text-xs text-emerald-600 underline shrink-0"
          >
            Today
          </button>
        )}
      </div>

      {/* Rest day banner */}
      {dateSkip && !dateWorkout && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl mt-0.5">😴</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Rest Day</p>
            {dateSkip.reason && (
              <p className="text-sm text-amber-700 mt-0.5">{dateSkip.reason}</p>
            )}
          </div>
          <button onClick={() => onDeleteSkip(selectedDate)} className="text-xs text-amber-500 underline shrink-0">
            Undo
          </button>
        </div>
      )}

      {/* Logged workout banner */}
      {dateWorkout && !showGymForm && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl mt-0.5">
            {dateWorkout.type === 'weights' ? '🏋️' : dateWorkout.type === 'cardio' ? '🏃' : '⚡'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-emerald-800">
              Day {dateWorkout.dayNumber} done! +{dateWorkout.xp} XP ✨
            </p>
            <p className="text-sm text-emerald-700 truncate mt-0.5">
              {dateWorkout.exercises?.slice(0, 4).join(', ')} · {dateWorkout.duration}min
            </p>
            {dateWorkout.notes && (
              <p className="text-xs text-emerald-600 mt-1 italic">"{dateWorkout.notes}"</p>
            )}
          </div>
          <button onClick={openEdit} className="text-xs text-emerald-600 underline shrink-0">Edit</button>
        </div>
      )}

      {/* Gym session form */}
      {showGymForm && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800">
              {dateWorkout ? '✏️ Edit Session' : '🏋️ Log Session'}
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3.5">
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
                    gymForm.type === v ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

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

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Exercises (comma separated)</label>
              <input
                type="text"
                value={gymForm.exercisesRaw}
                onChange={e => setGymForm(f => ({ ...f, exercisesRaw: e.target.value }))}
                placeholder="Bench Press, Rows, Triceps..."
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
                {dateWorkout ? 'Save Changes' : (isSelectedToday ? `Log Day ${workouts.length + 1}! 💪` : 'Log Session 💪')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt to log gym session */}
      {!dateWorkout && !dateSkip && !showGymForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <button
            onClick={openEdit}
            className="w-full py-3.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors"
          >
            + Log {isSelectedToday ? "Today's" : 'a'} Gym Session
          </button>
        </div>
      )}

      {/* Sports */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">⚽ Sports</h3>
          {dateSports.length > 0 && (
            <p className="text-xs text-emerald-600 font-medium">{dateSports.length} logged</p>
          )}
        </div>
        <div className="px-5 py-4 space-y-3">
          {dateSports.map(s => (
            <div key={s.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3.5 py-2.5">
              <span className="text-lg shrink-0">🏅</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {s.sport} · {s.duration}min{s.partner ? ` · 👥 ${s.partner}` : ''}
                </p>
                {s.notes && <p className="text-xs text-slate-400 truncate">{s.notes}</p>}
              </div>
              <button
                onClick={() => onDeleteSport(s.id)}
                className="text-xs text-red-400 hover:text-red-600 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}

          {showSportForm ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Sport</label>
                <input
                  type="text"
                  value={sportForm.sport}
                  onChange={e => setSportForm(f => ({ ...f, sport: e.target.value }))}
                  placeholder="e.g. Soccer, Pickleball..."
                  className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {filteredSportSuggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => setSportForm(f => ({ ...f, sport: s }))}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Duration (minutes)</label>
                <input
                  type="number"
                  value={sportForm.duration}
                  onChange={e => setSportForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="e.g. 60"
                  className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-300"
                  min="1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Who with (optional)</label>
                <input
                  type="text"
                  value={sportForm.partner}
                  onChange={e => setSportForm(f => ({ ...f, partner: e.target.value }))}
                  placeholder="e.g. Hassan"
                  className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Notes (optional)</label>
                <textarea
                  value={sportForm.notes}
                  onChange={e => setSportForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="How'd it go?"
                  className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-300 resize-none text-sm"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowSportForm(false); setSportForm(EMPTY_SPORT_FORM) }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSport}
                  disabled={!sportForm.sport.trim() || !sportForm.duration}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50"
                >
                  Save Sport
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSportForm(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors"
            >
              + Add Sport
            </button>
          )}
        </div>
      </div>

      {/* Body Weight Exercises */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">💪 Body Weight Exercises</h3>
          {dateEntry && (dateEntry.pushups || dateEntry.squats || dateEntry.plank) && (
            <p className="text-xs text-emerald-600 font-medium">Logged ✓</p>
          )}
        </div>
        <div className="px-5 py-4 space-y-3">
          {[
            { field: 'pushups', label: 'Push-ups', icon: '🤜', unit: 'reps', placeholder: '0' },
            { field: 'squats',  label: 'Squats',   icon: '🦵', unit: 'reps', placeholder: '0' },
            { field: 'plank',   label: 'Plank',    icon: '⏱️', unit: 'sec',  placeholder: '0' },
          ].map(({ field, label, icon, unit, placeholder }) => (
            <div key={field} className="flex items-center gap-3">
              <span className="text-lg w-7 text-center shrink-0">{icon}</span>
              <span className="text-sm text-slate-600 w-20">{label}</span>
              <input
                type="number"
                value={bwForm[field]}
                onChange={e => setBwForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                className="flex-1 text-right bg-slate-50 rounded-xl px-3 py-2 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                min="0"
              />
              <span className="text-xs text-slate-400 w-7">{unit}</span>
            </div>
          ))}

          {dateEntry && (dateEntry.pushups || dateEntry.squats || dateEntry.plank) && (
            <div className="text-xs text-slate-400 flex gap-3 pt-1">
              {dateEntry.pushups > 0 && <span>Push-ups: {dateEntry.pushups}</span>}
              {dateEntry.squats > 0 && <span>Squats: {dateEntry.squats}</span>}
              {dateEntry.plank > 0 && <span>Plank: {formatPlank(dateEntry.plank.toString())}</span>}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {dateEntry && (dateEntry.pushups || dateEntry.squats || dateEntry.plank) && (
              <button
                onClick={() => { onDeleteEntry(selectedDate); setBwForm({ pushups: '', squats: '', plank: '' }) }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSaveBW}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                bwSaved
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {bwSaved ? 'Saved! ✓' : 'Save BW Reps'}
            </button>
          </div>
        </div>
      </div>

      {/* Entertainment */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">📺 Entertainment</h3>
          {dateEntry?.entertainment?.done && (
            <p className="text-xs text-emerald-600 font-medium">Logged ✓</p>
          )}
        </div>
        <div className="px-5 py-4 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={entForm.done}
              onChange={e => setEntForm(f => ({ ...f, done: e.target.checked }))}
              className="w-5 h-5 rounded accent-emerald-500"
            />
            <span className="text-sm text-slate-600">I watched entertainment today</span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 w-20">Duration</span>
            <input
              type="number"
              value={entForm.minutes}
              onChange={e => setEntForm(f => ({ ...f, minutes: e.target.value }))}
              placeholder="0"
              className="flex-1 text-right bg-slate-50 rounded-xl px-3 py-2 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
              min="0"
            />
            <span className="text-xs text-slate-400 w-7">min</span>
          </div>
          <button
            onClick={handleSaveEntertainment}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              entSaved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {entSaved ? 'Saved! ✓' : 'Save Entertainment'}
          </button>
        </div>
      </div>

      {/* News */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">📰 News</h3>
          {dateEntry?.news?.done && (
            <p className="text-xs text-emerald-600 font-medium">Logged ✓</p>
          )}
        </div>
        <div className="px-5 py-4 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={newsForm.done}
              onChange={e => setNewsForm(f => ({ ...f, done: e.target.checked }))}
              className="w-5 h-5 rounded accent-emerald-500"
            />
            <span className="text-sm text-slate-600">I caught up on the news today</span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 w-20">Duration</span>
            <input
              type="number"
              value={newsForm.minutes}
              onChange={e => setNewsForm(f => ({ ...f, minutes: e.target.value }))}
              placeholder="0"
              className="flex-1 text-right bg-slate-50 rounded-xl px-3 py-2 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
              min="0"
            />
            <span className="text-xs text-slate-400 w-7">min</span>
          </div>
          <button
            onClick={handleSaveNews}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              newsSaved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {newsSaved ? 'Saved! ✓' : 'Save News'}
          </button>
        </div>
      </div>

      {/* Scale Weight */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-50">
          <h3 className="font-semibold text-slate-800">⚖️ Scale Weight</h3>
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
          {dateWeight != null && (
            <p className="text-xs text-emerald-600 mt-2">✓ {isSelectedToday ? 'Today' : 'That day'}: {dateWeight} lbs</p>
          )}
        </div>
      </div>

      {/* Skip / Rest Day */}
      {!dateWorkout && !dateSkip && (
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
