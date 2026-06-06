import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { apiFetch } from '../../../lib/api'

interface AnalyticsData {
  totalReports: number
  totalEmployees: number
  monthlyTrend: { month: string; total: number; reviewed: number; pending: number; submitted: number }[]
  byEmployee: { name: string; count: number }[]
  byStatus: { name: string; value: number }[]
  targetData: { name: string; target: number; achieved: number }[]
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function shortMonth(mmyyyy: string): string {
  if (!mmyyyy || mmyyyy.length !== 6) return mmyyyy
  const idx = parseInt(mmyyyy.slice(0, 2), 10) - 1
  const yr = mmyyyy.slice(4)
  return (idx >= 0 && idx <= 11) ? `${MONTH_SHORT[idx]} '${yr}` : mmyyyy
}

const STATUS_META: Record<string, { color: string; bg: string; icon: string }> = {
  Submitted: { color: '#3b82f6', bg: '#dbeafe', icon: '📄' },
  Reviewed:  { color: '#10b981', bg: '#d1fae5', icon: '✅' },
  Pending:   { color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
}

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="card" style={{ padding: '20px 24px', flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e5e7eb)', fontWeight: 700, fontSize: 15 }}>{title}</div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Must be before any early returns — Rules of Hooks
  const targetRows = useMemo(() => {
    if (!data) return []
    const map = new Map<string, { target: number; achieved: number }>()
    for (const d of data.targetData) {
      const cur = map.get(d.name) ?? { target: 0, achieved: 0 }
      map.set(d.name, { target: cur.target + d.target, achieved: cur.achieved + d.achieved })
    }
    return Array.from(map.entries()).map(([name, v]) => {
      const pct = v.target > 0 ? Math.min(100, Math.round((v.achieved / v.target) * 100)) : 0
      const color = pct >= 100 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'
      const label = pct >= 100 ? 'On Target' : pct >= 60 ? 'In Progress' : 'Behind'
      return { name, ...v, pct, color, label }
    })
  }, [data])

  useEffect(() => {
    let cancelled = false
    apiFetch<AnalyticsData>('/api/admin/analytics')
      .then((d) => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : 'Failed to load'); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  if (loading) return <main className="page-content"><p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading analytics…</p></main>
  if (error) return <main className="page-content"><p style={{ padding: 24, color: '#ef4444' }}>{error}</p></main>
  if (!data) return null

  const reviewedCount = data.byStatus.find((s) => s.name === 'Reviewed')?.value ?? 0
  const reviewRate = data.totalReports > 0 ? Math.round((reviewedCount / data.totalReports) * 100) : 0
  const topEmployee = data.byEmployee[0]

  // Stacked bar chart data: one bar per month, stacked by status
  const trendData = data.monthlyTrend.map((m) => ({
    label: shortMonth(m.month),
    Submitted: m.submitted,
    Reviewed: m.reviewed,
    Pending: m.pending,
  }))

  // Status distribution with totals for percentage
  const statusTotal = data.byStatus.reduce((s, x) => s + x.value, 0)
  const statusRows = data.byStatus.map((s) => {
    const meta = STATUS_META[s.name] ?? { color: '#9ca3af', bg: '#f3f4f6', icon: '📋' }
    const pct = statusTotal > 0 ? Math.round((s.value / statusTotal) * 100) : 0
    return { ...s, ...meta, pct }
  })

  return (
    <main className="page-content">
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <KpiCard label="Total Reports"    value={data.totalReports}  sub="All time"        color="#c62828" />
        <KpiCard label="Total Employees"  value={data.totalEmployees} sub="Active accounts" color="#7c3aed" />
        <KpiCard label="Review Rate"      value={`${reviewRate}%`}   sub="Reports reviewed" color="#10b981" />
        <KpiCard
          label="Top Contributor"
          value={topEmployee ? topEmployee.name : '—'}
          sub={topEmployee ? `${topEmployee.count} report${topEmployee.count !== 1 ? 's' : ''}` : 'No reports yet'}
          color="#f59e0b"
        />
      </div>

      {/* Monthly Trend — stacked bar chart */}
      <div style={{ marginBottom: 20 }}>
        <ChartCard title="Monthly Report Submissions">
          {trendData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No report data yet.</p>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, marginTop: 0 }}>
                Showing {trendData.length} month{trendData.length !== 1 ? 's' : ''} of activity — bars show submitted, reviewed and pending counts stacked.
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="Submitted" stackId="a" fill="#3b82f6" name="Submitted" radius={[0,0,0,0]} />
                  <Bar dataKey="Reviewed"  stackId="a" fill="#10b981" name="Reviewed"  radius={[0,0,0,0]} />
                  <Bar dataKey="Pending"   stackId="a" fill="#f59e0b" name="Pending"   radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* Reports by Employee */}
        <ChartCard title="Reports by Employee">
          {data.byEmployee.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.byEmployee} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={72} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="count" fill="#c62828" name="Reports" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Status Distribution — horizontal progress bars */}
        <ChartCard title="Status Breakdown">
          {statusRows.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 4 }}>
              {statusRows.map((s) => (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: s.bg, color: s.color }}>{s.pct}%</span>
                      <span style={{ fontWeight: 800, fontSize: 15, color: s.color }}>{s.value}</span>
                    </div>
                  </div>
                  <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.pct}%`, background: s.color,
                      borderRadius: 5, transition: 'width 0.5s ease', minWidth: s.value > 0 ? 6 : 0 }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    {s.value} of {statusTotal} total report{statusTotal !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Target Progress */}
        <ChartCard title="Target Progress">
          {targetRows.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No targets set yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {targetRows.map((r) => (
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
        </ChartCard>
      </div>
    </main>
  )
}
