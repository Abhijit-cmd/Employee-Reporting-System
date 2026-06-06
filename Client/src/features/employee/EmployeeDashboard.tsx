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
} from 'recharts'
import EmployeeKpiCards from './components/EmployeeKpiCards'
import NotificationsPanel from './components/NotificationsPanel'
import MyReportsTable from './components/MyReportsTable'
import QuickActions from './components/QuickActions'
import { IconMegaphone } from '../shared/icons'
import { apiFetch } from '../../lib/api'
import type { Report } from '../../types'

interface Props {
  onNavigate: (page: string) => void
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function ReportsOverviewCard({ reports }: { reports: Report[] }) {
  const lineData = useMemo(() => {
    const byMonth = new Map<string, { submitted: number; pending: number }>()
    for (const r of reports) {
      const mm = r.mmyyyy?.slice(0, 2)
      const monthIdx = Number(mm) - 1
      if (monthIdx < 0 || monthIdx > 11) continue
      const label = MONTH_LABELS[monthIdx]
      const entry = byMonth.get(label) ?? { submitted: 0, pending: 0 }
      if (r.reportStatus?.statusName === 'Submitted') {
        entry.submitted++
      } else {
        entry.pending++
      }
      byMonth.set(label, entry)
    }
    return MONTH_LABELS.map((month) => ({
      month,
      submitted: byMonth.get(month)?.submitted ?? 0,
      pending: byMonth.get(month)?.pending ?? 0,
    })).filter((d) => d.submitted > 0 || d.pending > 0)
  }, [reports])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">My Reports Overview</span>
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        {lineData.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>No report data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
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

function LatestAnnouncement() {
  return (
    <div className="announcement-bar">
      <div className="announcement-icon">
        <IconMegaphone />
      </div>
      <div className="announcement-body">
        <strong>Latest Announcement</strong>
        <span>Check announcements for team updates.</span>
      </div>
      <button className="card-action" type="button" style={{ whiteSpace: 'nowrap' }}>
        View all Announcements
      </button>
    </div>
  )
}

export default function EmployeeDashboard({ onNavigate }: Props) {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    apiFetch<Report[]>('/api/reports/my-reports')
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]))
  }, [])

  return (
    <main className="page-content">
      <EmployeeKpiCards />
      <div className="emp-middle-row">
        <ReportsOverviewCard reports={reports} />
        <NotificationsPanel />
      </div>
      <div className="emp-bottom-row">
        <MyReportsTable />
        <QuickActions onNavigate={onNavigate} />
      </div>
      <LatestAnnouncement />
    </main>
  )
}
