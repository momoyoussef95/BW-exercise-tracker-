export const LEVELS = [
  { level: 1, name: 'Warming Up',       icon: '🌱', minXP: 0,     color: '#10b981' },
  { level: 2, name: 'Building Base',     icon: '🔥', minXP: 1000,  color: '#f59e0b' },
  { level: 3, name: 'Getting Consistent',icon: '⚡', minXP: 2500,  color: '#3b82f6' },
  { level: 4, name: 'Dedicated',         icon: '💎', minXP: 5000,  color: '#8b5cf6' },
  { level: 5, name: 'Athlete Mode',      icon: '🏆', minXP: 8000,  color: '#ec4899' },
  { level: 6, name: 'Elite',             icon: '👑', minXP: 12000, color: '#f97316' },
  { level: 7, name: 'Foundation Builder',icon: '🏛️', minXP: 16000, color: '#eab308' },
]

export const MILESTONES = [
  { day: 10,  label: 'First Milestone',        icon: '🎯' },
  { day: 20,  label: '20 Strong',              icon: '💪' },
  { day: 30,  label: 'One Month',              icon: '🗓️' },
  { day: 42,  label: 'The Answer',             icon: '🌟' },
  { day: 50,  label: 'Halfway to Foundation',  icon: '⭐' },
  { day: 75,  label: 'Three Quarters',         icon: '🔥' },
  { day: 100, label: 'Foundation Built',       icon: '🏛️' },
]

export const BADGES = [
  { id: 'first',     icon: '🌅', name: 'Day One',      desc: 'Logged your first workout' },
  { id: 'day10',     icon: '🎯', name: 'Day 10',        desc: 'Hit 10 workout days' },
  { id: 'day20',     icon: '💪', name: 'Day 20',        desc: '20 workout days logged' },
  { id: 'day30',     icon: '🗓️', name: 'Day 30',        desc: '30 days. One month.' },
  { id: 'day50',     icon: '⭐', name: 'Day 50',        desc: 'Halfway to your foundation' },
  { id: 'day100',    icon: '🏛️', name: 'Foundation',    desc: '100 days. You built it.' },
  { id: 'iron_hour', icon: '🏋️', name: 'Iron Hour',     desc: 'Logged a 1-hour+ session' },
  { id: 'runner',    icon: '🏃', name: 'Runner',        desc: 'Logged a running workout' },
  { id: 'on_fire',   icon: '🔥', name: 'On Fire',       desc: '3+ workouts in one week' },
  { id: 'squad',     icon: '👥', name: 'Squad Up',      desc: 'Worked out with a partner' },
  { id: 'night_owl', icon: '🌙', name: 'Night Owl',     desc: 'Late-night workout session' },
  { id: 'comeback',  icon: '💫', name: 'Comeback',      desc: 'Returned after a long break' },
  { id: 'five_k',    icon: '🏅', name: '5K Club',       desc: 'Ran 5km' },
]

export const calcXP = (workout) => {
  let xp = 100
  const mins = workout.duration || 0
  if (mins >= 60) xp += 100
  else if (mins >= 45) xp += 75
  else if (mins >= 30) xp += 50
  else if (mins >= 15) xp += 25
  if (workout.notes && workout.notes.length > 5) xp += 25
  if (workout.partner) xp += 25
  if (workout.type === 'weights') xp += 50
  else if (workout.type === 'mixed') xp += 30
  return xp
}

export const getTotalXP = (workouts) =>
  workouts.reduce((sum, w) => sum + (w.xp || calcXP(w)), 0)

export const getLevel = (totalXP) => {
  const lvl = [...LEVELS].reverse().find(l => totalXP >= l.minXP) || LEVELS[0]
  const idx = LEVELS.findIndex(l => l.level === lvl.level)
  const next = LEVELS[idx + 1] || null
  const progress = next
    ? Math.min(((totalXP - lvl.minXP) / (next.minXP - lvl.minXP)) * 100, 100)
    : 100
  return { ...lvl, next, progress, totalXP }
}

export const getNextMilestone = (dayCount) =>
  MILESTONES.find(m => m.day > dayCount) || null

export const getPrevMilestone = (dayCount) =>
  [...MILESTONES].reverse().find(m => m.day <= dayCount) || null

export const getEarnedBadges = (workouts) => {
  const ids = []
  const count = workouts.length
  if (count >= 1) ids.push('first')
  if (count >= 10) ids.push('day10')
  if (count >= 20) ids.push('day20')
  if (count >= 30) ids.push('day30')
  if (count >= 50) ids.push('day50')
  if (count >= 100) ids.push('day100')
  if (workouts.some(w => (w.duration || 0) >= 60)) ids.push('iron_hour')
  if (workouts.some(w => w.type === 'cardio' || w.notes?.toLowerCase().match(/run|jog/))) ids.push('runner')
  if (workouts.some(w => w.partner)) ids.push('squad')
  if (workouts.some(w => w.notes?.toLowerCase().match(/1 am|12 am|late night/))) ids.push('night_owl')
  if (workouts.some(w => w.notes?.toLowerCase().match(/5 ?km/))) ids.push('five_k')

  const weekMap = {}
  workouts.forEach(w => {
    const d = new Date(w.date + 'T12:00:00')
    const start = new Date(d); start.setDate(d.getDate() - d.getDay())
    const key = start.toISOString().slice(0, 10)
    weekMap[key] = (weekMap[key] || 0) + 1
  })
  if (Object.values(weekMap).some(c => c >= 3)) ids.push('on_fire')

  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date))
  for (let i = 1; i < sorted.length; i++) {
    const gap = (new Date(sorted[i].date) - new Date(sorted[i - 1].date)) / 86400000
    if (gap >= 14) { ids.push('comeback'); break }
  }

  return [...new Set(ids)]
}

export const getWeeklyStreak = (workouts) => {
  if (!workouts.length) return 0
  const weekSet = new Set()
  workouts.forEach(w => {
    const d = new Date(w.date + 'T12:00:00')
    const start = new Date(d); start.setDate(d.getDate() - d.getDay())
    weekSet.add(start.toISOString().slice(0, 10))
  })
  const weeks = [...weekSet].sort().reverse()
  const today = new Date()
  const thisWeekStart = new Date(today); thisWeekStart.setDate(today.getDate() - today.getDay())
  const thisWeekKey = thisWeekStart.toISOString().slice(0, 10)

  let streak = 0
  let check = new Date(thisWeekStart)
  for (const w of weeks) {
    const checkKey = check.toISOString().slice(0, 10)
    if (w === checkKey) {
      streak++
      check.setDate(check.getDate() - 7)
    } else if (w < checkKey) {
      if (checkKey === thisWeekKey) {
        check.setDate(check.getDate() - 7)
        if (w === check.toISOString().slice(0, 10)) { streak++; check.setDate(check.getDate() - 7) }
        else break
      } else break
    }
  }
  return streak
}

export const getThisWeekCount = (workouts) => {
  const today = new Date()
  const start = new Date(today); start.setDate(today.getDate() - today.getDay()); start.setHours(0,0,0,0)
  return workouts.filter(w => new Date(w.date + 'T12:00:00') >= start).length
}
