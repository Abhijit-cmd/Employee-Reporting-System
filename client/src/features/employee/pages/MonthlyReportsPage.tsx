import { useState, useEffect } from 'react'
import { apiFetch } from '../../../lib/api'
import type { Report } from '../../../types'
import { formatDateTime, formatMmyyyy, statusClass } from '../../../lib/utils'
import {
  IconChevronLeft,
  IconChevronRight,
  IconFileText,
  IconPlus,
} from '../../shared/icons'

const PAGE_SIZE = 10
const STATUSES = ['All', 'Submitted', 'Pending', 'Draft', 'Reviewed']

interface Props {
  onNavigate: (page: string) => void
}

function IcoSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

export default function MonthlyReportsPage({ onNavigate }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    apiFetch<Report[]>('/api/reports/my-reports')
      .then((data) => { if (!cancelled) setReports(Array.isArray(data) ? data : []) })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = reports.filter((r) => {
    const matchStatus = statusFilter === 'All' || r.reportStatus?.statusName === statusFilter
    const matchSearch = !search || formatMmyyyy(r.mmyyyy).toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <main className="page-content">
      <div className="card emp-page-card">
        <div className="emp-page-topbar">
          <div>
            <div className="emp-page-heading">My Monthly Reports</div>
            <div className="emp-page-sub">All reports you have submitted or drafted.</div>
          </div>
          <button className="cnr-btn-submit" type="button" onClick={() => onNavigate('create-report')}>
            <IconPlus /> New Report
          </button>
        </div>

        <div className="emp-filters">
          <div className="emp-search-wrap">
            <IcoSearch />
            <input
              className="emp-search-input"
              type="text"
              placeholder="Search by month (e.g. January 2025)…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="emp-select-wrap">
            <select
              className="emp-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading && <p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading reports…</p>}
        {error && !loading && <p style={{ padding: 24, color: '#ef4444' }}>{error}</p>}

        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table className="reports-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Month</th>
                  <th>Business Owner</th>
                  <th>Prepared By</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      <div style={{ width: 40, height: 40, margin: '0 auto 8px', opacity: 0.3, fontSize: 40 }}>
                        <IconFileText />
                      </div>
                      <p style={{ margin: 0 }}>No reports found.</p>
                    </td>
                  </tr>
                ) : rows.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {(safePage - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatMmyyyy(r.mmyyyy)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.businessOwner}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.preparedBy}</td>
                    <td>
                      <span className={`status-badge ${statusClass(r.reportStatus?.statusName ?? '')}`}>
                        {r.reportStatus?.statusName}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDateTime(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="table-footer">
            <span className="table-count">
              {filtered.length === 0 ? '0 reports' : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
            </span>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Previous page">
                  <IconChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`page-btn${safePage === p ? ' active' : ''}`} type="button" onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Next page">
                  <IconChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
