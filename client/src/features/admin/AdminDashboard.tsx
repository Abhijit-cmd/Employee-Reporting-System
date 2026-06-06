import { useState, useEffect, useMemo } from 'react'
import KpiCards from './components/KpiCards'
import ReportsTable from './components/ReportsTable'
import AdminQuickActions from './components/AdminQuickActions'
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


function TargetAchievementCard({ data }: { data: TargetAchievement[] }) {
  const rows = useMemo(() => {
    const map = new Map<string, { target: number; achieved: number }>()
    for (const d of data) {
      const cur = map.get(d.employeeName) ?? { target: 0, achieved: 0 }
      map.set(d.employeeName, {
        target: cur.target + d.targetValue,
        achieved: cur.achieved + d.achievedValue,
      })
    }
    return Array.from(map.entries()).map(([name, v]) => {
      const pct = v.target > 0 ? Math.min(100, Math.round((v.achieved / v.target) * 100)) : 0
      const color = pct >= 100 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
      const label = pct >= 100 ? 'On Target' : pct >= 60 ? 'In Progress' : 'Behind'
      return { name, ...v, pct, color, label }
    })
  }, [data])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Target Progress</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rows.length} employee{rows.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="card-body">
        {rows.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>No targets set yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {rows.map((r) => (
              <div key={r.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: r.color + '22', color: r.color }}>{r.label}</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: r.color }}>{r.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, background: r.color,
                    borderRadius: 5, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Achieved: <strong style={{ color: 'var(--text-primary)' }}>{r.achieved}</strong></span>
                  <span>Target: <strong style={{ color: 'var(--text-primary)' }}>{r.target}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReportsByStatusCard({ reports }: { reports: Report[] }) {
  const allStatuses = ['Submitted', 'Pending', 'Reviewed']
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of reports) {
      const name = r.reportStatus?.statusName ?? 'Unknown'
      map.set(name, (map.get(name) ?? 0) + 1)
    }
    return map
  }, [reports])

  const total = reports.length
  const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
    Submitted: { color: '#3b82f6', bg: '#eff6ff', icon: '📄' },
    Pending:   { color: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
    Reviewed:  { color: '#10b981', bg: '#f0fdf4', icon: '✅' },
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Reports by Status</span>
        {total > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} total</span>}
      </div>
      <div className="card-body">
        {total === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>No reports yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {allStatuses.map((status) => {
              const count = counts.get(status) ?? 0
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const cfg = statusConfig[status]
              return (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: cfg.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0 }}>{cfg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{status}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{count}</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cfg.color,
                        borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', width: 34, textAlign: 'right' }}>{pct}%</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function RecentActivityCard({
  reports,
  onNavigate,
}: {
  reports: Report[]
  onNavigate: (p: string) => void
}) {
  const items = reports.slice(0, 5)
  const statusConfig: Record<string, { color: string; bg: string }> = {
    Submitted: { color: '#3b82f6', bg: '#eff6ff' },
    Pending:   { color: '#f59e0b', bg: '#fffbeb' },
    Reviewed:  { color: '#10b981', bg: '#f0fdf4' },
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Reports</span>
        <button className="card-action" type="button" onClick={() => onNavigate('reports')}>
          View all
        </button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {items.length === 0 ? (
          <p style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>No reports submitted yet.</p>
        ) : (
          <div>
            {items.map((r, i) => {
              const status = r.reportStatus?.statusName ?? 'Unknown'
              const cfg = statusConfig[status] ?? { color: '#9ca3af', bg: '#f9fafb' }
              return (
                <div
                  key={r.id}
                  onClick={() => onNavigate('reports')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', cursor: 'pointer',
                    borderBottom: i < items.length - 1 ? '1px solid var(--border-color, #f3f4f6)' : 'none',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: cfg.bg,
                    color: cfg.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0,
                  }}>
                    {(r.user?.name ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.user?.name ?? 'Employee'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Report for {formatMmyyyy(r.mmyyyy)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: cfg.bg, color: cfg.color, marginBottom: 2,
                    }}>{status}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{relativeTime(r.createdAt)}</div>
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
            <TargetAchievementCard data={targetAchievements} />
            <ReportsByStatusCard reports={reports} />
            <RecentActivityCard
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
