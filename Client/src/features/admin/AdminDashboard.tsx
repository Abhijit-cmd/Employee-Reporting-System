import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import KpiCards from './components/KpiCards'
import ReportsTable from './components/ReportsTable'
import AdminQuickActions from './components/AdminQuickActions'
import {
  IconFileText,
  IconClock,
  IconTarget,
  IconUsers,
  IconBell,
} from '../shared/icons'
import { apiFetch } from '../../lib/api'
import type { Report } from '../../types'
import { formatMmyyyy, relativeTime } from '../../lib/utils'

interface Props {
  onNavigate: (page: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#10b981',
  Pending: '#f59e0b',
  Draft: '#6366f1',
  Rejected: '#ef4444',
}

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case 'report':
      return <IconFileText />
    case 'pending':
      return <IconClock />
    case 'target':
      return <IconTarget />
    case 'employee':
      return <IconUsers />
    default:
      return <IconBell />
  }
}

function ReportOverviewCard({ reports }: { reports: Report[] }) {
  const lineData = useMemo(() => {
    const byDay = new Map<string, { submitted: number; pending: number }>()
    for (const r of reports) {
      const day = new Date(r.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      })
      const entry = byDay.get(day) ?? { submitted: 0, pending: 0 }
      if (['Submitted', 'Approved'].includes(r.reportStatus?.statusName ?? '')) {
        entry.submitted++
      } else {
        entry.pending++
      }
      byDay.set(day, entry)
    }
    return Array.from(byDay.entries())
      .slice(-7)
      .map(([day, counts]) => ({ day, ...counts }))
  }, [reports])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Report Overview</span>
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        {lineData.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>No report data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Line type="monotone" dataKey="submitted" stroke="#4f46e5" strokeWidth={2.5} name="Submitted" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2.5} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function ReportsByStatusCard({ reports }: { reports: Report[] }) {
  const donutData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of reports) {
      const name = r.reportStatus?.statusName ?? 'Unknown'
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
    return Array.from(counts.entries()).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] ?? '#9ca3af',
    }))
  }, [reports])

  const donutTotal = donutData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Reports by Status</span>
      </div>
      <div className="card-body">
        {donutTotal === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>No reports yet.</p>
        ) : (
          <div className="donut-wrap">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-legend">
              {donutData.map((d, i) => (
                <div className="legend-item" key={i}>
                  <div className="legend-dot" style={{ background: d.color }} />
                  <span className="legend-label">{d.name}</span>
                  <span className="legend-val">{d.value}</span>
                  <span className="legend-pct">
                    ({((d.value / donutTotal) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
              <div className="donut-total">Total: {donutTotal} Reports</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RecentNotificationsCard({
  reports,
  onNavigate,
}: {
  reports: Report[]
  onNavigate: (p: string) => void
}) {
  const notifications = reports.slice(0, 4).map((r, i) => ({
    id: r.id,
    icon: r.reportStatus?.statusName === 'Pending' ? 'pending' : 'report',
    color: '#d1fae5',
    iconColor: '#10b981',
    title: `${r.user?.name ?? 'Employee'} — ${formatMmyyyy(r.mmyyyy)}`,
    desc: `Status: ${r.reportStatus?.statusName}`,
    time: relativeTime(r.createdAt),
    key: i,
  }))

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Notifications</span>
        <button className="card-action" type="button" onClick={() => onNavigate('reports')}>
          View all
        </button>
      </div>
      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {notifications.length === 0 ? (
          <p style={{ padding: 16, color: 'var(--text-muted)' }}>No recent activity.</p>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div
                className="notif-item"
                key={n.id}
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate('reports')}
              >
                <div
                  className="notif-icon-wrap"
                  style={{ background: n.color, color: n.iconColor }}
                >
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
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard({ onNavigate }: Props) {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    apiFetch<Report[]>('/api/admin/reports')
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]))
  }, [])

  return (
    <main className="page-content">
      <KpiCards onNavigate={onNavigate} />
      <div className="middle-row">
        <ReportOverviewCard reports={reports} />
        <ReportsByStatusCard reports={reports} />
        <RecentNotificationsCard reports={reports} onNavigate={onNavigate} />
      </div>
      <div className="bottom-row">
        <ReportsTable onNavigate={onNavigate} />
        <AdminQuickActions onNavigate={onNavigate} />
      </div>
    </main>
  )
}
