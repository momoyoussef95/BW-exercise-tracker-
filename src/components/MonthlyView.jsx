import { useState } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getMonthDays, getMonthlyData, getMonthlyTotals, formatPlank } from '../utils/calculations'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function CalendarCell({ cell, goals }) {
  if (!cell) return <div />
  const e = cell.entry
  const isToday = cell.date === format(new Date(), 'yyyy-MM-dd')

  let bg = 'bg-slate-100 text-slate-400'
  if (e) {
    const avgPct = goals.pushups
      ? ((e.pushups || 0) / goals.pushups + (e.squats || 0) / goals.squats + (e.plank || 0) / goals.plank) / 3
      : 1
    if (avgPct >= 1) bg = 'bg-emerald-500 text-white'
    else if (avgPct >= 0.6) bg = 'bg-emerald-300 text-white'
    else bg = 'bg-emerald-100 text-emerald-700'
  }

  return (
    <div className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold ${bg} ${isToday ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}>
      {cell.day}
    </div>
  )
}

export default function MonthlyView({ entries, goals }) {
  const [current, setCurrent] = useState(new Date())
  const year = current.getFullYear()
  const month = current.getMonth()

  const cells = getMonthDays(entries, year, month)
  const chartData = getMonthlyData(entries, year, month).filter((d) => d.pushups || d.squats || d.plank)
  const totals = getMonthlyTotals(entries, year, month)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(subMonths(current, 1))} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 text-xl">‹</button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">{format(current, 'MMMM yyyy')}</h2>
          <p className="text-sm text-slate-400">{totals.days} days logged</p>
        </div>
        <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 text-xl">›</button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DOW.map((d) => (
            <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">{d[0]}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => (
            <CalendarCell key={i} cell={cell} goals={goals} />
          ))}
        </div>
        <div className="flex gap-4 mt-3 justify-center text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100 inline-block" /> No entry</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 inline-block" /> Partial</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Goal met</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-600">{totals.pushups}</p>
          <p className="text-xs text-emerald-400">total pushups</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-600">{totals.squats}</p>
          <p className="text-xs text-blue-400">total squats</p>
        </div>
        <div className="bg-violet-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-violet-600">{formatPlank(totals.plank)}</p>
          <p className="text-xs text-violet-400">total plank</p>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                cursor={{ stroke: '#f1f5f9' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Line type="monotone" dataKey="pushups" stroke="#10b981" strokeWidth={2.5} dot={false} name="Pushups" />
              <Line type="monotone" dataKey="squats" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Squats" />
              <Line type="monotone" dataKey="plank" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Plank (s)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length <= 1 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-slate-400">
          <p className="text-3xl mb-2">📈</p>
          <p className="text-sm">Log at least 2 days this month to see your trend chart.</p>
        </div>
      )}
    </div>
  )
}
