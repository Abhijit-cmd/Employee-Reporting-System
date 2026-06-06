import { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
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
  IconUsers,
  IconBell,
} from '../shared/icons'
import { apiFetch } from '../../lib/api'
import type { Report } from '../../types'
import { formatMmyyyy, relativeTime } from '../../lib/utils'

interface Props {
  onNavigate: (page: string) => void
}

interface TargetAchievement {
  employeeName: string
  targetValue: number
  achievedValue: number
}

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#10b981',
  Pending: '#f59e0b',
}

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case 'report':
      return <IconFileText />
    case 'pending':
      return <IconClock />
    case 'employee':
      return <IconUsers />
    default:
      return <IconBell />
  }
}

function TargetAchievementChart({ data }: { data: TargetAchievement[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Target vs Achievement</span>
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        {data.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>No target data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="employeeName" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="targetValue" fill="#f59e0b" name="Target" radius={[4, 4, 0, 0]} />
              <Bar dataKey="achievedValue" fill="#10b981" name="Achieved" radius={[4, 4, 0, 0]} />
            </BarChart>
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
      if (name === 'Submitted' || name === 'Pending') {
        counts.set(name, (counts.get(name) ?? 0) + 1)
      }
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
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-legend">
              {donutData.map((d) => (
                <div className="legend-item" key={d.name}>
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
  const notifications = reports.slice(0, 4).map((r) => ({
    id: r.id,
    icon: r.reportStatus?.statusName === 'Pending' ? 'pending' : 'report',
    color: '#d1fae5',
    iconColor: '#10b981',
    title: `${r.user?.name ?? 'Employee'} — ${formatMmyyyy(r.mmyyyy)}`,
    desc: `Status: ${r.reportStatus?.statusName}`,
    time: relativeTime(r.createdAt),
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
  const [targetAchievements, setTargetAchievements] = useState<TargetAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [reportsData, targetData] = await Promise.all([
          apiFetch<any>('/api/admin/reports'),
          apiFetch<TargetAchievement[]>('/api/admin/dashboard/target-achievements'),
        ])

        if (cancelled) return

        setReports(Array.isArray(reportsData.reports) ? reportsData.reports : [])
        setTargetAchievements(Array.isArray(targetData) ? targetData : [])
      } catch (err) {
        if (cancelled) return

        console.error('Admin Dashboard API Error:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dashboard data',
        )

        setReports([]) // safe fallback
        setTargetAchievements([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="page-content">

      {/* ERROR UI */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10 }}>
          {error}
        </div>
      )}

      {/* LOADING UI */}
      {loading ? (
        <div style={{ padding: 20 }}>Loading dashboard...</div>
      ) : (
        <>
          {/* KPIs always visible */}
          <KpiCards onNavigate={onNavigate} />

          {/* middle section */}
          <div className="middle-row">
            <TargetAchievementChart data={targetAchievements} />
            <ReportsByStatusCard reports={reports} />
            <RecentNotificationsCard
              reports={reports}
              onNavigate={onNavigate}
            />
          </div>


          {/* bottom section */}
          <div className="bottom-row">
            <ReportsTable onNavigate={onNavigate} />
            <AdminQuickActions onNavigate={onNavigate} />
          </div>
        </>
      )}
    </main>

  )
}
