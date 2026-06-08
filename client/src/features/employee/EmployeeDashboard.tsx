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
} from 'recharts'
import EmployeeKpiCards from './components/EmployeeKpiCards'
import NotificationsPanel from './components/NotificationsPanel'
import MyReportsTable from './components/MyReportsTable'
import QuickActions from './components/QuickActions'
import { IconMegaphone } from '../shared/icons'
import { apiFetch } from '../../lib/api'
import { relativeTime } from '../../lib/utils'
import type { Report } from '../../types'

interface Props {
  onNavigate: (page: string) => void
}

interface Announcement {
  id: number
  title: string
  body: string
  createdAt: string
  author: { name: string }
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ── Reports Overview ──────────────────────────────────────────────────────────
function ReportsOverviewCard({ reports }: { reports: Report[] }) {
  const barData = useMemo(() => {
    const byMonth = new Map<string, { submitted: number; reviewed: number; pending: number }>()
    for (const r of reports) {
      const mm = r.mmyyyy?.slice(0, 2)
      const monthIdx = Number(mm) - 1
      if (monthIdx < 0 || monthIdx > 11) continue
      const label = MONTH_LABELS[monthIdx]
      const entry = byMonth.get(label) ?? { submitted: 0, reviewed: 0, pending: 0 }
      const status = r.reportStatus?.statusName ?? ''
      if (status === 'Submitted') entry.submitted++
      else if (status === 'Reviewed') entry.reviewed++
      else entry.pending++
      byMonth.set(label, entry)
    }
    return MONTH_LABELS
      .map(month => ({ month, ...( byMonth.get(month) ?? { submitted: 0, reviewed: 0, pending: 0 }) }))
      .filter(d => d.submitted > 0 || d.reviewed > 0 || d.pending > 0)
  }, [reports])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">My Reports Overview</span>
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        {barData.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>No report data yet.</p>
        ) : (
          <>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>
              Your report status by month — bars show submitted, reviewed and pending counts.
            </p>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="submitted" stackId="a" fill="#3b82f6" name="Submitted" radius={[0,0,0,0]} />
                <Bar dataKey="reviewed"  stackId="a" fill="#10b981" name="Reviewed"  radius={[0,0,0,0]} />
                <Bar dataKey="pending"   stackId="a" fill="#f59e0b" name="Pending"   radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  )
}

// ── Announcements Panel ───────────────────────────────────────────────────────
function AnnouncementsPanel({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch<Announcement[]>('/api/admin/announcements')
      .then(data => { if (!cancelled) setItems(Array.isArray(data) ? data.slice(0, 3) : []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Announcements</span>
        <button
          className="card-action"
          type="button"
          onClick={() => onNavigate?.('announcements')}
        >
          View all
        </button>
      </div>
      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {loading && <p style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: 13 }}>Loading…</p>}

        {!loading && items.length === 0 && (
          <p style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: 13 }}>No announcements yet.</p>
        )}

        {!loading && items.map((a, i) => (
          <div
            key={a.id}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              padding: '10px 0',
              borderBottom: i < items.length - 1 ? '1px solid var(--border-color, #f0f0f0)' : 'none',
            }}
          >
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: '#fdecea',
              color: '#c62828',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}>
              <IconMegaphone />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)', marginBottom: 2, lineHeight: 1.3 }}>{a.title}</div>
              <div style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {a.body}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {relativeTime(a.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function EmployeeDashboard({ onNavigate }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiFetch<Report[]>('/api/reports/my-reports')
        if (cancelled) return
        setReports(Array.isArray(data) ? data : [])
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load employee dashboard data')
        setReports([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <main className="page-content">
      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 20 }}>Loading employee dashboard...</div>
      ) : (
        <>
          <EmployeeKpiCards />

          <div className="emp-middle-row">
            {/* Left: chart */}
            <ReportsOverviewCard reports={reports} />

            {/* Right: notifications + announcements stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <NotificationsPanel onNavigate={onNavigate} />
              <AnnouncementsPanel onNavigate={onNavigate} />
            </div>
          </div>

          <div className="emp-bottom-row">
            <MyReportsTable />
            <QuickActions onNavigate={onNavigate} />
          </div>
        </>
      )}
    </main>
  )
}
