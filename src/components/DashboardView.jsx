import { format } from 'date-fns'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import {
  getTotalXP, getLevel, getEarnedBadges, getWeeklyStreak,
  getThisWeekCount, getNextMilestone, getPrevMilestone, BADGES,
} from '../utils/gamification'

export default function DashboardView({ workouts, bodyWeights }) {
  const totalXP = getTotalXP(workouts)
  const level = getLevel(totalXP)
  const streak = getWeeklyStreak(workouts)
  const thisWeek = getThisWeekCount(workouts)
  const dayCount = workouts.length
  const nextMilestone = getNextMilestone(dayCount)
  const prevMilestone = getPrevMilestone(dayCount)
  const earnedBadgeIds = getEarnedBadges(workouts)
  const recentWorkouts = [...workouts].reverse().slice(0, 3)

  const weightEntries = Object.entries(bodyWeights)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([date, weight]) => ({
      weight,
      label: format(new Date(date + 'T12:00:00'), 'MMM d'),
    }))

  const prevDay = prevMilestone?.day || 0
  const nextDay = nextMilestone?.day || 100
  const milestoneProgress = Math.min(((dayCount - prevDay) / (nextDay - prevDay)) * 100, 100)

  return (
    <div className="space-y-4">
      {/* Hero: Day counter */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Total Workout Days</p>
            <p className="text-5xl font-black mt-1">Day {dayCount}</p>
            {nextMilestone && (
              <p className="text-emerald-100 text-sm mt-1.5">
                {nextDay - dayCount} days to {nextMilestone.icon} Day {nextDay}
              </p>
            )}
          </div>
          <span className="text-6xl opacity-80">{prevMilestone?.icon || '🌱'}</span>
        </div>
        <div className="mt-4 bg-emerald-400/40 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${milestoneProgress}%` }}
          />
        </div>
        <p className="text-xs text-emerald-100 mt-1.5">
          {dayCount - prevDay} / {nextDay - prevDay} toward {nextMilestone?.label || 'Foundation Built'}
        </p>
      </div>

      {/* Level + XP */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{level.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-slate-800 truncate">Lvl {level.level} · {level.name}</p>
              <p className="text-sm text-slate-400 shrink-0">{totalXP.toLocaleString()} XP</p>
            </div>
            {level.next && (
              <p className="text-xs text-slate-400 mt-0.5">
                {(level.next.minXP - totalXP).toLocaleString()} XP to {level.next.name}
              </p>
            )}
          </div>
        </div>
        <div className="bg-slate-100 rounded-full h-2.5">
          <div
            className="rounded-full h-2.5 transition-all"
            style={{ width: `${level.progress}%`, backgroundColor: level.color }}
          />
        </div>
      </div>

      {/* Streak + This Week */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-3xl font-black text-amber-500">{streak}</p>
          <p className="text-xs text-slate-500 mt-0.5">🔥 Week Streak</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-3xl font-black text-blue-500">{thisWeek}</p>
          <p className="text-xs text-slate-500 mt-0.5">📅 This Week</p>
        </div>
      </div>

      {/* Earned badges */}
      {earnedBadgeIds.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-2.5">
            Badges <span className="text-slate-400 font-normal">({earnedBadgeIds.length}/{BADGES.length})</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {earnedBadgeIds.map(id => {
              const badge = BADGES.find(b => b.id === id)
              if (!badge) return null
              return (
                <span
                  key={id}
                  title={`${badge.name}: ${badge.desc}`}
                  className="text-2xl cursor-default"
                >
                  {badge.icon}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Weight trend */}
      {weightEntries.length >= 2 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Weight Trend ⚖️</p>
            <p className="text-sm text-slate-400">
              {weightEntries[weightEntries.length - 1]?.weight} lbs
            </p>
          </div>
          <ResponsiveContainer width="100%" height={70}>
            <LineChart data={weightEntries}>
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                formatter={(v) => [`${v} lbs`, 'Weight']}
                labelFormatter={(_, p) => p?.[0]?.payload?.label || ''}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-3">Recent Workouts</p>
          <div className="space-y-2.5">
            {recentWorkouts.map(w => (
              <div key={w.id} className="flex items-center gap-3">
                <span className="text-xl shrink-0">
                  {w.type === 'weights' ? '🏋️' : w.type === 'cardio' ? '🏃' : '⚡'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {w.exercises?.slice(0, 3).join(', ') || w.type}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(w.date + 'T12:00:00'), 'MMM d')} · Day {w.dayNumber} · {w.duration}min
                    {w.partner ? ` · 👥 ${w.partner}` : ''}
                  </p>
                </div>
                <span className="text-xs text-emerald-600 font-semibold shrink-0">
                  +{w.xp} xp
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {workouts.length === 0 && (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
          <p className="text-4xl mb-3">🌱</p>
          <p className="font-semibold text-slate-700">Ready to start?</p>
          <p className="text-sm text-slate-400 mt-1">Log your first workout in the Log tab!</p>
        </div>
      )}
    </div>
  )
}
