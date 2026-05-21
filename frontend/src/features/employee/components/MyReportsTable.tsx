import { useState } from 'react'
import { IconEye, IconEdit, IconChevronLeft, IconChevronRight } from '../../../components/icons'

const allReports = [
  { id: 1, month: 'May 2025',   title: 'Monthly Performance Report', status: 'submitted', date: '02 May 2025, 10:30 AM', action: 'view' },
  { id: 2, month: 'May 2025',   title: 'Sales & Activity Report',    status: 'pending',   date: '01 May 2025, 04:15 PM', action: 'edit' },
  { id: 3, month: 'April 2025', title: 'Monthly Performance Report', status: 'submitted', date: '30 Apr 2025, 11:20 AM', action: 'view' },
  { id: 4, month: 'April 2025', title: 'Sales & Activity Report',    status: 'draft',     date: '28 Apr 2025, 03:10 PM', action: 'edit' },
  { id: 5, month: 'March 2025', title: 'Monthly Performance Report', status: 'submitted', date: '02 Apr 2025, 09:45 AM', action: 'view' },
]

const PAGE_SIZE = 5

export default function MyReportsTable() {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(allReports.length / PAGE_SIZE)
  const rows = allReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">My Recent Reports</span>
        <button className="card-action" type="button">View all</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Month</th><th>Report Title</th><th>Status</th><th>Submitted On</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ color: '#6b7280' }}>{r.month}</td>
                <td style={{ fontWeight: 500 }}>{r.title}</td>
                <td>
                  <span className={`status-badge ${r.status}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </td>
                <td style={{ color: '#6b7280' }}>{r.date}</td>
                <td>
                  <button className="action-btn" type="button" aria-label={r.action === 'view' ? 'View report' : 'Edit report'}>
                    {r.action === 'view' ? <IconEye /> : <IconEdit />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span className="table-count">Showing {rows.length} of {allReports.length} reports</span>
        <div className="pagination">
          <button
            className="page-btn"
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <IconChevronLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}
