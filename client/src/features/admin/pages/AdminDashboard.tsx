import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import KpiCards from '../components/KpiCards'
import ReportsTable from '../components/ReportsTable'
import AdminQuickActions from '../components/AdminQuickActions'
import {
  IconFileText, IconClock, IconTarget, IconUsers, IconBell,
} from '../../../components/icons'

interface Props {
  onNavigate: (page: string) => void
}

// ── Data ──────────────────────────────────────────────────────────────────────

const lineData = [
  { day: '1 May', submitted: 18, pending: 5 },
  { day: '5 May', submitted: 35, pending: 8 },
  { day: '10 May', submitted: 52, pending: 12 },
  { day: '15 May', submitted: 68, pending: 10 },
  { day: '20 May', submitted: 85, pending: 14 },
  { day: '25 May', submitted: 78, pending: 11 },
  { day: '31 May', submitted: 62, pending: 9 },
]

const donutData = [
  { name: 'Submitted', value: 330, color: '#10b981' },
  { name: 'Pending',   value: 12,  color: '#f59e0b' },
  { name: 'Draft',     value: 28,  color: '#6366f1' }
]
const donutTotal = donutData.reduce((s, d) => s + d.value, 0)

const notifications = [
  { id: 1, icon: 'report',   color: '#d1fae5', iconColor: '#10b981', title: 'New report submitted',  desc: 'Aneesa Khan submitted May 2025 report', time: '5m ago' },
  { id: 2, icon: 'pending',  color: '#fef3c7', iconColor: '#f59e0b', title: 'Report pending review', desc: "Ahmed Ali's report is pending review",   time: '1h ago' },
  { id: 3, icon: 'target',   color: '#e0e7ff', iconColor: '#6366f1', title: 'Target updated',        desc: 'Sales target updated for Team North',    time: '2h ago' },
  { id: 4, icon: 'employee', color: '#fce7f3', iconColor: '#ec4899', title: 'New employee added',    desc: 'Sarah Khan joined as Sales Executive',   time: '3h ago' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case 'report':   return <IconFileText />
    case 'pending':  return <IconClock />
    case 'target':   return <IconTarget />
    case 'employee': return <IconUsers />
    default:         return <IconBell />
  }
}

function ReportOverviewCard() {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Report Overview</span>
        <select className="chart-select" defaultValue="this-month">
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="this-year">This Year</option>
        </select>
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} itemStyle={{ color: '#374151' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="submitted" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3, fill: '#4f46e5' }} activeDot={{ r: 5 }} name="Submitted" />
            <Line type="monotone" dataKey="pending"   stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} name="Pending" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ReportsByStatusCard() {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Reports by Status</span>
      </div>
      <div className="card-body">
        <div className="donut-wrap">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {donutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} formatter={(val) => [`${val} reports`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-legend">
            {donutData.map((d, i) => (
              <div className="legend-item" key={i}>
                <div className="legend-dot" style={{ background: d.color }} />
                <span className="legend-label">{d.name}</span>
                <span className="legend-val">{d.value}</span>
                <span className="legend-pct">({((d.value / donutTotal) * 100).toFixed(1)}%)</span>
              </div>
            ))}
            <div className="donut-total">Total: {donutTotal} Reports</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecentNotificationsCard({ onNavigate }: { onNavigate: (p: string) => void }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Notifications</span>
        <button className="card-action" type="button" onClick={() => onNavigate('reports')}>View all</button>
      </div>
      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        <div className="notif-list">
          {notifications.map(n => (
            <div className="notif-item" key={n.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('reports')}>
              <div className="notif-icon-wrap" style={{ background: n.color, color: n.iconColor }}>
                <NotifIcon type={n.icon} />
              </div>
              <div className="notif-content">
                <div className="notif-title">{n.title}</div>
                <div className="notif-desc">{n.desc}</div>
              </div>
              <div className="notif-time">{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard({ onNavigate }: Props) {
  return (
    <main className="page-content">
      <KpiCards onNavigate={onNavigate} />
      <div className="middle-row">
        <ReportOverviewCard />
        <ReportsByStatusCard />
        <RecentNotificationsCard onNavigate={onNavigate} />
      </div>
      <div className="bottom-row">
        <ReportsTable onNavigate={onNavigate} />
        <AdminQuickActions onNavigate={onNavigate} />
      </div>
    </main>
  )
}
