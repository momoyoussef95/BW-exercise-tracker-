import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts'

export default function StatsView({ workouts, bodyWeights }) {
  // Body weight trend (last 20 readings)
  const weightData = Object.entries(bodyWeights)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-20)
    .map(([date, weight]) => ({
      weight,
      label: format(new Date(date + 'T12:00:00'), 'MMM d'),
    }))

  // Weekly workout counts (last 12 weeks)
  const now = new Date()
  const weeklyData = Array.from({ length: 12 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(now, 11 - i))
    const weekEnd = endOfWeek(weekStart)
    const count = workouts.filter(w => {
      const d = new Date(w.date + 'T12:00:00')
      return d >= weekStart && d <= weekEnd
    }).length
    return { label: format(weekStart, 'MMM d'), count }
  })

  // Type distribution
  const typeCounts = workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1
    return acc
  }, {})

  // Top exercises (by frequency)
  const exerciseCounts = {}
  workouts.forEach(w => {
    w.exercises?.forEach(e => {
      exerciseCounts[e] = (exerciseCounts[e] || 0) + 1
    })
  })
  const topExercises = Object.entries(exerciseCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  // Summary stats
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const avgDuration = workouts.length > 0 ? Math.round(totalMinutes / workouts.length) : 0
  const totalXP = workouts.reduce((sum, w) => sum + (w.xp || 0), 0)

  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Stats 📊</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">{workouts.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Sessions</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-blue-600">{totalHours}h</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Time</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-violet-600">{avgDuration}m</p>
          <p className="text-xs text-slate-400 mt-0.5">Avg Session</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-black text-amber-500">{totalXP.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total XP</p>
        </div>
      </div>

      {/* Weekly frequency chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Workouts Per Week</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyData} barSize={14}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis hide allowDecimals={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [v, 'workouts']}
            />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Body weight trend */}
      {weightData.length >= 2 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Body Weight ⚖️</p>
            <p className="text-xs text-slate-400">
              {weightData[0]?.weight} → {weightData[weightData.length - 1]?.weight} lbs
            </p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 3', 'dataMax + 3']}
                width={36}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v} lbs`, 'Weight']}
                labelFormatter={(_, p) => p?.[0]?.payload?.label || ''}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Workout types */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Workout Types</p>
        <div className="space-y-2.5">
          {[
            { type: 'weights', label: '🏋️ Weights', color: '#8b5cf6' },
            { type: 'mixed',   label: '⚡ Mixed',   color: '#f59e0b' },
            { type: 'cardio',  label: '🏃 Cardio',  color: '#10b981' },
          ].map(({ type, label, color }) => {
            const count = typeCounts[type] || 0
            const pct = workouts.length > 0 ? Math.round((count / workouts.length) * 100) : 0
            return (
              <div key={type}>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{label}</span>
                  <span>{count} ({pct}%)</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2">
                  <div
                    className="rounded-full h-2 transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top exercises */}
      {topExercises.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-3">Top Exercises</p>
          <div className="flex flex-wrap gap-2">
            {topExercises.map(([ex, count]) => (
              <span
                key={ex}
                className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium"
              >
                {ex} <span className="text-slate-400">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {workouts.length === 0 && (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-slate-400">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm">Log workouts to see stats here.</p>
        </div>
      )}
    </div>
  )
}
