import { useState, useEffect } from 'react'
import { apiFetch } from '../../../lib/api'
import type { Report } from '../../../types'
import { formatMmyyyy } from '../../../lib/utils'
import { IconFileText, IconClock, IconTarget, IconBarChart, IconArrowUp } from '../../shared/icons'

interface Props {
  onNavigate: (page: string) => void
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function KpiCard({ label, value, sub, icon, iconBg, iconColor }: {
  label: string; value: string; sub: string; icon: React.ReactNode; iconBg: string; iconColor: string
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <div className="kpi-body">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-sub plain">{sub}</div>
      </div>
    </div>
  )
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--border-color, #e5e7eb)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', minWidth: 32 }}>{pct}%</span>
    </div>
  )
}

export default function AchievementsPage({ onNavigate }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    apiFetch<Report[]>('/api/reports/my-reports')
      .then((data) => { if (!cancelled) setReports(Array.isArray(data) ? data : []) })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const currentYear = new Date().getFullYear()
  const thisYearReports = reports.filter((r) => r.mmyyyy?.slice(2) === String(currentYear))

  const submitted = reports.filter((r) => r.reportStatus?.statusName === 'Submitted').length
  const pending   = reports.filter((r) => ['Pending', 'Draft'].includes(r.reportStatus?.statusName ?? '')).length
  const reviewed  = reports.filter((r) => r.reportStatus?.statusName === 'Reviewed').length
  const total     = reports.length
  const achievePct = total > 0 ? `${Math.round((submitted / total) * 100)}%` : '0%'

  // Monthly breakdown for current year
  const monthlyData = MONTH_LABELS.map((month, idx) => {
    const mm = String(idx + 1).padStart(2, '0')
    const key = `${mm}${currentYear}`
    const r = thisYearReports.find((rep) => rep.mmyyyy === key)
    return { month, report: r ?? null }
  })

  // Year groups for all-time history
  const yearSet = Array.from(new Set(reports.map((r) => r.mmyyyy?.slice(2)))).sort().reverse()

  const statusColor: Record<string, string> = {
    Submitted: '#10b981',
    Reviewed:  '#4f46e5',
    Pending:   '#f59e0b',
    Draft:     '#9ca3af',
  }

  return (
    <main className="page-content">
      {/* KPI Summary */}
      <div className="kpi-row emp-kpi-row">
        <KpiCard label="Total Reports" value={loading ? '…' : String(total)} sub="All time" icon={<IconFileText />} iconBg="#fdecea" iconColor="#c62828" />
        <KpiCard label="Submitted" value={loading ? '…' : String(submitted)} sub="Accepted by admin" icon={<IconArrowUp />} iconBg="#d1fae5" iconColor="#10b981" />
        <KpiCard label="Pending / Draft" value={loading ? '…' : String(pending)} sub="Awaiting review" icon={<IconClock />} iconBg="#fef3c7" iconColor="#f59e0b" />
        <KpiCard label="Achievement Rate" value={loading ? '…' : achievePct} sub="Submitted vs total" icon={<IconTarget />} iconBg="#ede9fe" iconColor="#7c3aed" />
      </div>

      {error && <p style={{ padding: 16, color: '#ef4444' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Monthly tracker — current year */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Monthly Tracker — {currentYear}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{thisYearReports.length} / 12 submitted</span>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {monthlyData.map(({ month, report }) => (
                  <div key={month} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 32, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{month}</span>
                    <div style={{ flex: 1 }}>
                      <ProgressBar
                        value={report ? 1 : 0}
                        max={1}
                        color={report ? (statusColor[report.reportStatus?.statusName ?? ''] ?? '#c62828') : '#e5e7eb'}
                      />
                    </div>
                    <span style={{ fontSize: 11, minWidth: 64, textAlign: 'right' }}>
                      {report ? (
                        <span className={`status-badge ${report.reportStatus?.statusName?.toLowerCase() ?? ''}`} style={{ fontSize: 10 }}>
                          {report.reportStatus?.statusName}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Not submitted</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All-time history by year */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Report History</span>
            <button className="card-action" type="button" onClick={() => onNavigate('monthly-reports')}>View all</button>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : reports.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>No reports yet. <button type="button" className="login-register-link" onClick={() => onNavigate('create-report')}>Create one</button></p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {yearSet.slice(0, 4).map((year) => {
                  const yearReports = reports.filter((r) => r.mmyyyy?.slice(2) === year)
                  return (
                    <div key={year}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{year}</span>
                        <span>{yearReports.length} report{yearReports.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {yearReports.map((r) => (
                          <span
                            key={r.id}
                            className={`status-badge ${r.reportStatus?.statusName?.toLowerCase() ?? ''}`}
                            style={{ fontSize: 11 }}
                            title={`${formatMmyyyy(r.mmyyyy)} — ${r.reportStatus?.statusName}`}
                          >
                            {formatMmyyyy(r.mmyyyy).split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submission rate bar */}
      {!loading && total > 0 && (
        <div className="card" style={{ marginTop: 0 }}>
          <div className="card-header"><span className="card-title">Overall Breakdown</span></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Submitted', count: submitted, color: '#10b981' },
                { label: 'Reviewed', count: reviewed, color: '#4f46e5' },
                { label: 'Pending / Draft', count: pending, color: '#f59e0b' },
              ].map(({ label, count, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 110, fontSize: 13, color: 'var(--text-primary)' }}>{label}</span>
                  <div style={{ flex: 1 }}><ProgressBar value={count} max={total} color={color} /></div>
                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
