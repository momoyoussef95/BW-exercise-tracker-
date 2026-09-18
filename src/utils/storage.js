const ENTRIES_KEY = 'bwt_entries'
const GOALS_KEY = 'bwt_goals'

export const getEntries = () => {
  try {
    const data = localStorage.getItem(ENTRIES_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export const saveEntry = (date, entry) => {
  const entries = getEntries()
  entries[date] = { ...entry, updatedAt: new Date().toISOString() }
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  return entries
}

export const deleteEntry = (date) => {
  const entries = getEntries()
  delete entries[date]
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  return entries
}

const DEFAULT_GOALS = { pushups: 50, squats: 50, plank: 60, history: [] }

export const getGoals = () => {
  try {
    const data = localStorage.getItem(GOALS_KEY)
    return data ? JSON.parse(data) : DEFAULT_GOALS
  } catch {
    return DEFAULT_GOALS
  }
}

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
  const updated = {
    ...newGoals,
    updatedAt: new Date().toISOString(),
    history: history.slice(-10),
  }
  localStorage.setItem(GOALS_KEY, JSON.stringify(updated))
  return updated
}
