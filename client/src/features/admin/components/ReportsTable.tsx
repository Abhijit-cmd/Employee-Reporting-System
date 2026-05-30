import { useState, useEffect } from 'react'
import { IconEye } from '../../../components/icons'

interface Props {
  onNavigate: (page: string) => void
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 1)
}

interface ReportRow {
  id: number
  user?: { name?: string; employeeId?: string }
  mmyyyy?: string
  reportStatus?: { statusName?: string }
  createdAt?: string
}

export default function ReportsTable({ onNavigate }: Props) {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    async function fetchRecent() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reports`,
          { headers: { Authorization: token ? `Bearer ${token}` : '' } }
        )
        const data = await res.json()
        if (Array.isArray(data)) {
          setReports(data.slice(0, 5))
        } else {
          setError('Failed to load reports')
        }
      } catch {
        setError('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    fetchRecent()
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Reports</span>
        <button className="card-action" type="button" onClick={() => onNavigate('reports')}>View all</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>Loading…</p>
        ) : error ? (
          <p style={{ padding: '20px', color: '#ef4444', textAlign: 'center' }}>{error}</p>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Employee</th><th>Month</th><th>Status</th><th>Submitted on</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="emp-cell">
                      <div className="emp-avatar">{initials(r.user?.name || '?')}</div>
                      {r.user?.name}
                    </div>
                  </td>
                  <td>{r.mmyyyy}</td>
                  <td>
                    <span className={`status-badge ${r.reportStatus?.statusName?.toLowerCase()}`}>
                      {r.reportStatus?.statusName}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280' }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                  </td>
                  <td>
                    <button className="action-btn" type="button" aria-label="View report" onClick={() => onNavigate('reports')}>
                      <IconEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
