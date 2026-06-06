import { useState, useEffect } from 'react'
import { IconEye } from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import type { Report } from '../../../types'
import { formatDateTime, formatMmyyyy, initials, statusClass } from '../../../lib/utils'

interface Props {
  onNavigate: (page: string) => void
}

export default function ReportsTable({ onNavigate }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch<Report[]>('/api/admin/reports')
        if (!cancelled) {
          const list = Array.isArray(data) ? data : []
          setReports(list.slice(0, 5))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load')
          setReports([])
        }
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
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Reports</span>
        <button
          className="card-action"
          type="button"
          onClick={() => onNavigate('reports')}
        >
          View all
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {loading && (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading…</p>
        )}
        {error && !loading && (
          <p style={{ padding: 24, color: '#ef4444' }}>{error}</p>
        )}
        {!loading && !error && (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Status</th>
                <th>Submitted on</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#6b7280' }}>
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="emp-cell">
                        <div className="emp-avatar">
                          {initials(r.user?.name ?? '?')}
                        </div>
                        {r.user?.name ?? '—'}
                      </div>
                    </td>
                    <td>{formatMmyyyy(r.mmyyyy)}</td>
                    <td>
                      <span
                        className={`status-badge ${statusClass(r.reportStatus?.statusName ?? '')}`}
                      >
                        {r.reportStatus?.statusName}
                      </span>
                    </td>
                    <td style={{ color: '#6b7280' }}>
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        type="button"
                        aria-label="View report"
                        onClick={() => onNavigate('reports')}
                      >
                        <IconEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
