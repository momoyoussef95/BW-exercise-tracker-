import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getLast7Days, getWeeklyAverages, formatPlank } from '../utils/calculations'

function ExChart({ title, icon, data, dataKey, color, yFormat }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h3 className="font-semibold text-slate-700 mb-4">{icon} {title}</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={yFormat} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
            formatter={(v) => [yFormat ? yFormat(v) : v, title]}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function WeeklyView({ entries }) {
  const data = getLast7Days(entries)
  const avgs = getWeeklyAverages(entries)
  const totalDays = data.filter((d) => d.pushups || d.squats || d.plank).length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">This Week</h2>
        <p className="text-sm text-slate-400">{totalDays} of 7 days logged</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{avgs.pushups}</p>
          <p className="text-xs text-emerald-400 mt-0.5">avg pushups</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-600">{avgs.squats}</p>
          <p className="text-xs text-blue-400 mt-0.5">avg squats</p>
        </div>
        <div className="bg-violet-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-violet-600">{formatPlank(avgs.plank)}</p>
          <p className="text-xs text-violet-400 mt-0.5">avg plank</p>
        </div>
      </div>

      <ExChart title="Pushups" icon="💪" data={data} dataKey="pushups" color="#10b981" />
      <ExChart title="Squats" icon="🦵" data={data} dataKey="squats" color="#3b82f6" />
      <ExChart
        title="Plank"
        icon="⏱️"
        data={data}
        dataKey="plank"
        color="#8b5cf6"
        yFormat={formatPlank}
      />
    </div>
  )
}
