const WORKOUTS_KEY = 'et_workouts'
const WEIGHTS_KEY = 'et_weights'
const SKIPS_KEY = 'et_skips'
const SEEDED_KEY = 'et_seeded'
const GOALS_KEY = 'bwt_goals'

const parse = (key, fallback) => {
  try {
    const d = localStorage.getItem(key)
    return d ? JSON.parse(d) : fallback
  } catch {
    return fallback
  }
}

export const getWorkouts = () => parse(WORKOUTS_KEY, [])

export const saveWorkout = (workout) => {
  const workouts = getWorkouts()
  const idx = workouts.findIndex(w => w.id === workout.id)
  if (idx >= 0) workouts[idx] = workout
  else workouts.push(workout)
  workouts.sort((a, b) => a.date.localeCompare(b.date))
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts))
  return workouts
}

export const deleteWorkout = (id) => {
  const workouts = getWorkouts().filter(w => w.id !== id)
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts))
  return workouts
}

export const bulkSaveWorkouts = (workouts) => {
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts))
}

export const getBodyWeights = () => parse(WEIGHTS_KEY, {})

export const saveBodyWeight = (date, weight) => {
  const weights = getBodyWeights()
  if (weight === null || weight === undefined) delete weights[date]
  else weights[date] = weight
  localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights))
  return weights
}

export const getSkips = () => parse(SKIPS_KEY, {})

export const saveSkip = (date, reason) => {
  const skips = getSkips()
  skips[date] = { reason, skippedAt: new Date().toISOString() }
  localStorage.setItem(SKIPS_KEY, JSON.stringify(skips))
  return skips
}

export const deleteSkip = (date) => {
  const skips = getSkips()
  delete skips[date]
  localStorage.setItem(SKIPS_KEY, JSON.stringify(skips))
  return skips
}

export const isSeeded = () => {
  try { return localStorage.getItem(SEEDED_KEY) === 'true' } catch { return false }
}

export const markSeeded = () => {
  try { localStorage.setItem(SEEDED_KEY, 'true') } catch {}
}

const DEFAULT_GOALS = { pushups: 50, squats: 50, plank: 60, history: [] }

export const getGoals = () => parse(GOALS_KEY, DEFAULT_GOALS)

export const saveGoals = (newGoals) => {
  const current = getGoals()
  const history = current.history || []
  if (current.pushups || current.squats || current.plank) {
    history.push({
      pushups: current.pushups,
      squats: current.squats,
      plank: current.plank,
      setAt: current.updatedAt || new Date().toISOString(),
    })
  }
  const updated = { ...newGoals, updatedAt: new Date().toISOString(), history: history.slice(-10) }
  localStorage.setItem(GOALS_KEY, JSON.stringify(updated))
  return updated
}
