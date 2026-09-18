import {
  getTotalXP, getLevel, getEarnedBadges,
  BADGES, LEVELS, MILESTONES,
} from '../utils/gamification'

export default function AchievementsView({ workouts }) {
  const totalXP = getTotalXP(workouts)
  const level = getLevel(totalXP)
  const earnedBadgeIds = getEarnedBadges(workouts)
  const dayCount = workouts.length

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Wins 🏆</h2>

      {/* Level hero */}
      <div
        className="rounded-2xl p-5 text-white shadow-sm"
        style={{ background: `linear-gradient(135deg, ${level.color}ee, ${level.color}99)` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{level.icon}</span>
          <div className="flex-1">
            <p className="font-black text-xl">Level {level.level}</p>
            <p className="font-semibold opacity-90">{level.name}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{totalXP.toLocaleString()}</p>
            <p className="text-xs opacity-75">Total XP</p>
          </div>
        </div>
        <div className="bg-white/30 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all"
            style={{ width: `${level.progress}%` }}
          />
        </div>
        {level.next ? (
          <p className="text-xs opacity-80 mt-1.5">
            {(level.next.minXP - totalXP).toLocaleString()} XP to {level.next.icon} {level.next.name}
          </p>
        ) : (
          <p className="text-xs opacity-80 mt-1.5">Max level reached! 👑</p>
        )}
      </div>

      {/* Level ladder */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Level Ladder</p>
        <div className="space-y-1.5">
          {LEVELS.map(l => {
            const reached = totalXP >= l.minXP
            const isCurrent = l.level === level.level
            return (
              <div
                key={l.level}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isCurrent ? 'bg-slate-50 ring-1' : ''
                }`}
                style={isCurrent ? { ringColor: l.color } : {}}
              >
                <span className={`text-xl ${reached ? '' : 'grayscale opacity-30'}`}>{l.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${reached ? 'text-slate-800' : 'text-slate-300'}`}>
                    {l.name}
                  </p>
                  <p className={`text-xs ${reached ? 'text-slate-400' : 'text-slate-300'}`}>
                    {l.minXP.toLocaleString()} XP
                  </p>
                </div>
                {isCurrent && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: l.color }}
                  >
                    NOW
                  </span>
                )}
                {reached && !isCurrent && (
                  <span className="text-emerald-500 text-sm">✓</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Milestones</p>
        <div className="space-y-2">
          {MILESTONES.map(m => {
            const reached = dayCount >= m.day
            return (
              <div
                key={m.day}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl ${
                  reached ? 'bg-emerald-50' : 'bg-slate-50'
                }`}
              >
                <span className={`text-2xl ${reached ? '' : 'grayscale opacity-30'}`}>{m.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${reached ? 'text-slate-800' : 'text-slate-400'}`}>
                    Day {m.day} · {m.label}
                  </p>
                  {!reached && (
                    <p className="text-xs text-slate-300">{m.day - dayCount} days away</p>
                  )}
                </div>
                {reached && <span className="text-emerald-500 text-lg">✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Badges</p>
          <p className="text-xs text-slate-400">{earnedBadgeIds.length} / {BADGES.length}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map(badge => {
            const earned = earnedBadgeIds.includes(badge.id)
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-2.5 p-3 rounded-xl ${
                  earned ? 'bg-amber-50' : 'bg-slate-50'
                }`}
              >
                <span className={`text-2xl shrink-0 ${earned ? '' : 'grayscale opacity-25'}`}>
                  {badge.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${earned ? 'text-slate-800' : 'text-slate-300'}`}>
                    {badge.name}
                  </p>
                  <p className={`text-xs leading-tight ${earned ? 'text-slate-400' : 'text-slate-300'}`}>
                    {badge.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
