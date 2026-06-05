import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import KpiCards from '../components/KpiCards'
import ReportsTable from '../components/ReportsTable'
import AdminQuickActions from '../components/AdminQuickActions'
import { IconFileText, IconClock, IconTarget, IconUsers, IconBell } from '../../../components/icons'
import { apiFetch } from '../../../lib/api'
import type { Report } from '../../../types'

interface Props {
  onNavigate: (page: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#10b981',
  Pending:   '#f59e0b',
  Draft:     '#6366f1',
  Rejected:  '#ef4444',
}

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case 'report':   return <IconFileText />
    case 'pending':  return <IconClock />
    case 'target':   return <IconTarget />
    case 'employee': return <IconUsers />
    default:         return <IconBell />
  }
}

function useReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<Report[]>('/api/reports')
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { reports, loading }
}

function buildLineData(reports: Report[]) {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()

  const buckets: Record<string, { submitted: number; pending: number }> = {}

  for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d += 5) {
    const label = `${d} ${now.toLocaleString('default', { month: 'short' })}`
    buckets[label] = { submitted: 0, pending: 0 }
  }

  reports.forEach(r => {
    const date = new Date(r.createdAt)
    if (date.getMonth() !== month || date.getFullYear() !== year) return
    const day   = date.getDate()
    const slot  = Math.floor((day - 1) / 5) * 5 + 1
    const label = `${slot} ${now.toLocaleString('default', { month: 'short' })}`
    if (!buckets[label]) buckets[label] = { submitted: 0, pending: 0 }
    const status = r.reportStatus?.statusName ?? ''
    if (status === 'Submitted') buckets[label].submitted++
    else if (status === 'Pending') buckets[label].pending++
  })

  return Object.entries(buckets).map(([day, v]) => ({ day, ...v }))
}

function buildDonutData(reports: Report[]) {
  const counts: Record<string, number> = {}
  reports.forEach(r => {
    const s = r.reportStatus?.statusName ?? 'Unknown'
    counts[s] = (counts[s] ?? 0) + 1
  })
  return Object.entries(counts).map(([name, value]) => ({
    name, value, color: STATUS_COLORS[name] ?? '#94a3b8',
  }))
}

function ReportOverviewCard({ reports, loading }: { reports: Report[]; loading: boolean }) {
  const lineData = buildLineData(reports)
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Report Overview</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>This Month</span>
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading…</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Line type="monotone" dataKey="submitted" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Submitted" />
              <Line type="monotone" dataKey="pending"   stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function ReportsByStatusCard({ reports, loading }: { reports: Report[]; loading: boolean }) {
  const donutData  = buildDonutData(reports)
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Reports by Status</span>
      </div>
      <div className="card-body">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading…</p>
        ) : donutData.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No reports yet</p>
        ) : (
          <div className="donut-wrap">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value" strokeWidth={0}>
                  {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
                  <span className="legend-pct">({donutTotal > 0 ? ((d.value / donutTotal) * 100).toFixed(1) : 0}%)</span>
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

function RecentActivityCard({ reports, loading, onNavigate }: { reports: Report[]; loading: boolean; onNavigate: (p: string) => void }) {
  const recent = reports.slice(0, 4)
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Activity</span>
        <button className="card-action" type="button" onClick={() => onNavigate('reports')}>View all</button>
      </div>
      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Loading…</p>
        ) : recent.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No recent activity</p>
        ) : (
          <div className="notif-list">
            {recent.map(r => {
              const status = r.reportStatus?.statusName ?? 'Unknown'
              const color     = STATUS_COLORS[status] ?? '#94a3b8'
              const lightBg   = color + '22'
              return (
                <div className="notif-item" key={r.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('reports')}>
                  <div className="notif-icon-wrap" style={{ background: lightBg, color }}>
                    <NotifIcon type={status === 'Pending' ? 'pending' : 'report'} />
                  </div>
                  <div className="notif-content">
                    <div className="notif-title">{r.user?.name ?? 'Employee'} — {status}</div>
                    <div className="notif-desc">Report for {r.mmyyyy}</div>
                  </div>
                  <div className="notif-time">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard({ onNavigate }: Props) {
  const { reports, loading } = useReports()

  return (
    <main className="page-content">
      <KpiCards onNavigate={onNavigate} />
      <div className="middle-row">
        <ReportOverviewCard    reports={reports} loading={loading} />
        <ReportsByStatusCard   reports={reports} loading={loading} />
        <RecentActivityCard    reports={reports} loading={loading} onNavigate={onNavigate} />
      </div>
      <div className="bottom-row">
        <ReportsTable onNavigate={onNavigate} />
        <AdminQuickActions onNavigate={onNavigate} />
      </div>
    </main>
  )
}
