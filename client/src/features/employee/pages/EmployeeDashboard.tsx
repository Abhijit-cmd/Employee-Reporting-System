import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import EmployeeKpiCards from '../components/EmployeeKpiCards'
import NotificationsPanel from '../components/NotificationsPanel'
import MyReportsTable from '../components/MyReportsTable'
import QuickActions from '../components/QuickActions'
import { apiFetch } from '../../../lib/api'
import type { Report } from '../../../types'

interface Props {
  onNavigate: (page: string) => void
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function buildLineData(reports: Report[]) {
  const year = new Date().getFullYear()
  const buckets = MONTH_LABELS.map(month => ({ month, submitted: 0, pending: 0 }))

  reports.forEach(r => {
    const date = new Date(r.createdAt)
    if (date.getFullYear() !== year) return
    const m      = date.getMonth()
    const status = r.reportStatus?.statusName ?? ''
    if (status === 'Submitted') buckets[m].submitted++
    else if (status === 'Pending') buckets[m].pending++
  })

  return buckets
}

export default function EmployeeDashboard({ onNavigate }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch<Report[]>('/api/reports/my-reports')
      .then((data) => { if (!cancelled) setReports(Array.isArray(data) ? data : []) })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const lineData = buildLineData(reports)

  return (
    <main className="page-content">
      <EmployeeKpiCards />

      <div className="emp-middle-row">

        {/* Reports Overview Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Reports Overview</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date().getFullYear()}</span>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading…</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
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

        <NotificationsPanel />
      </div>

      <div className="emp-bottom-row">
        <MyReportsTable onNavigate={onNavigate} />
        <QuickActions onNavigate={onNavigate} />
      </div>
    </main>
  )
}
