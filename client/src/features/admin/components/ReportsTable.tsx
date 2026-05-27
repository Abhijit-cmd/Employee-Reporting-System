import { IconEye } from '../../../components/icons'

interface Props {
  onNavigate: (page: string) => void
}

const reports = [
  { id: 1, name: 'Anil Kumar',    month: 'May 2025',   status: 'submitted', date: '02 May 2025, 10:30 AM' },
  { id: 2, name: 'Ahas Verma',    month: 'May 2025',   status: 'pending',   date: '01 May 2025, 04:15 PM' },
  { id: 3, name: 'Imran Khan',    month: 'April 2025', status: 'submitted', date: '30 Apr 2025, 11:20 AM' },
  { id: 4, name: 'Fatima Shaikh', month: 'April 2025', status: 'submitted', date: '29 Apr 2025, 09:45 AM' },
  { id: 5, name: 'Usman Ali',     month: 'April 2025', status: 'rejected',  date: '28 Apr 2025, 03:10 PM' },
]

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 1)
}

export default function ReportsTable({ onNavigate }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Reports</span>
        <button className="card-action" type="button" onClick={() => onNavigate('reports')}>View all</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
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
                    <div className="emp-avatar">{initials(r.name)}</div>
                    {r.name}
                  </div>
                </td>
                <td>{r.month}</td>
                <td>
                  <span className={`status-badge ${r.status}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </td>
                <td style={{ color: '#6b7280' }}>{r.date}</td>
                <td>
                  <button className="action-btn" type="button" aria-label="View report" onClick={() => onNavigate('reports')}>
                    <IconEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
