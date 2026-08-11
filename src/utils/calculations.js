import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'

export const todayStr = () => format(new Date(), 'yyyy-MM-dd')

export const formatPlank = (seconds) => {
  if (!seconds) return '0s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}m`
  return `${m}m ${s}s`
}

export const getStreak = (entries) => {
  let streak = 0
  let date = new Date()
  if (!entries[format(date, 'yyyy-MM-dd')]) {
    date = subDays(date, 1)
  }
  while (entries[format(date, 'yyyy-MM-dd')]) {
    streak++
    date = subDays(date, 1)
  }
  return streak
}

export const getPersonalBests = (entries) => {
  const bests = { pushups: 0, squats: 0, plank: 0 }
  Object.values(entries).forEach((e) => {
    if ((e.pushups || 0) > bests.pushups) bests.pushups = e.pushups
    if ((e.squats || 0) > bests.squats) bests.squats = e.squats
    if ((e.plank || 0) > bests.plank) bests.plank = e.plank
  })
  return bests
}

export const getLast7Days = (entries) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const key = format(d, 'yyyy-MM-dd')
    const e = entries[key] || {}
    return {
      date: key,
      label: format(d, 'EEE'),
      pushups: e.pushups || 0,
      squats: e.squats || 0,
      plank: e.plank || 0,
    }
  })
}

export const getWeeklyAverages = (entries) => {
  const days = getLast7Days(entries).filter((d) => d.pushups || d.squats || d.plank)
  if (!days.length) return { pushups: 0, squats: 0, plank: 0 }
  const sum = days.reduce((a, d) => ({
    pushups: a.pushups + d.pushups,
    squats: a.squats + d.squats,
    plank: a.plank + d.plank,
  }), { pushups: 0, squats: 0, plank: 0 })
  return {
    pushups: Math.round(sum.pushups / days.length),
    squats: Math.round(sum.squats / days.length),
    plank: Math.round(sum.plank / days.length),
  }
}

export const getMonthDays = (entries, year, month) => {
  const start = startOfMonth(new Date(year, month, 1))
  const end = endOfMonth(start)
  const days = eachDayOfInterval({ start, end })
  const firstDow = getDay(start) // 0=Sun

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  days.forEach((d) => {
    const key = format(d, 'yyyy-MM-dd')
    const e = entries[key] || null
    cells.push({ date: key, day: d.getDate(), entry: e })
  })
  return cells
}

export const getMonthlyData = (entries, year, month) => {
  const start = startOfMonth(new Date(year, month, 1))
  const end = endOfMonth(start)
  return eachDayOfInterval({ start, end }).map((d) => {
    const key = format(d, 'yyyy-MM-dd')
    const e = entries[key] || {}
    return {
      date: key,
      label: format(d, 'd'),
      pushups: e.pushups || 0,
      squats: e.squats || 0,
      plank: e.plank || 0,
    }
  })
}

export const getMonthlyTotals = (entries, year, month) => {
  const data = getMonthlyData(entries, year, month)
  return data.reduce((a, d) => ({
    pushups: a.pushups + d.pushups,
    squats: a.squats + d.squats,
    plank: a.plank + d.plank,
    days: a.days + (d.pushups || d.squats || d.plank ? 1 : 0),
  }), { pushups: 0, squats: 0, plank: 0, days: 0 })
}
