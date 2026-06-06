import { useState, useEffect } from 'react'
import {
  IconEye,
  IconEdit,
  IconChevronLeft,
  IconChevronRight,
} from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import type { Report } from '../../../types'
import { formatDateTime, formatMmyyyy, statusClass } from '../../../lib/utils'

const PAGE_SIZE = 5

export default function MyReportsTable() {
  const [page, setPage] = useState(1)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchReports() {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch<Report[]>('/api/reports/my-reports')
        if (!cancelled) {
          setReports(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load reports')
          setReports([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchReports()
    return () => {
      cancelled = true
    }
  }, [])

  const totalPages = Math.ceil(reports.length / PAGE_SIZE) || 1
  const rows = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Monthly Reports</span>
        <button className="card-action" type="button">
          View all
        </button>
      </div>
      <div style={{ overflowX: 'auto', minHeight: 200 }}>
  {loading ? (
    <p style={{ padding: 24, color: 'var(--text-muted)' }}>
      Loading reports…
    </p>
  ) : error ? (
    <p style={{ padding: 24, color: '#ef4444' }}>
      {error}
    </p>
  ) : (
    <table className="reports-table">
      <thead>
        <tr>
          <th>Month</th>
          <th>Reviewed By</th>
          <th>Status</th>
          <th>Submitted On</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>
              No reports yet.
            </td>
          </tr>
        ) : (
          rows.map((r) => (
            <tr key={r.id}>
              <td>{formatMmyyyy(r.mmyyyy)}</td>
              <td>{r.reviewedBy}</td>
              <td>
                <span className={`status-badge ${statusClass(r.reportStatus?.statusName ?? '')}`}>
                  {r.reportStatus?.statusName}
                </span>
              </td>
              <td>{formatDateTime(r.createdAt)}</td>
              <td>
                <button type="button" className="action-btn">
                  {r.reportStatus?.statusName === 'Draft' ? <IconEdit /> : <IconEye />}
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )}
</div>
            

{!loading && !error && reports.length > 0 && totalPages > 1 && (
        <div className="table-footer">
          <span className="table-count">
            Showing {rows.length} of {reports.length} reports
          </span>
          <div className="pagination">
            <button
              className="page-btn"
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <IconChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn${page === p ? ' active' : ''}`}
                type="button"
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="page-btn"
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
