import {
  IconUserPlus, IconMegaphone, IconDownload, IconFileText, IconChevronRight,
} from '../../shared/icons'

interface Props {
  onNavigate: (page: string) => void
}

const quickActions = [
  { id: 1, icon: 'add-emp',    page: 'employees', color: '#fdecea', iconColor: '#c62828', label: 'Add Employee',        desc: 'Add new employee to the system' },
  { id: 2, icon: 'announce',   page: '',          color: '#fce7f3', iconColor: '#ec4899', label: 'Create Announcement', desc: 'Send announcement to employees' },
  { id: 3, icon: 'export',     page: 'reports',   color: '#d1fae5', iconColor: '#10b981', label: 'Export Reports',      desc: 'Export reports in Excel/PDF' },
  { id: 4, icon: 'manage-rep', page: 'reports',   color: '#fef3c7', iconColor: '#f59e0b', label: 'Manage Reports',      desc: 'View and manage all reports' },
]

function QAIcon({ id }: { id: string }) {
  switch (id) {
    case 'add-emp':    return <IconUserPlus />
    case 'announce':   return <IconMegaphone />
    case 'export':     return <IconDownload />
    case 'manage-rep': return <IconFileText />
    default:           return <IconFileText />
  }
}

export default function AdminQuickActions({ onNavigate }: Props) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <span className="card-title">Quick Actions</span>
      </div>
      <div className="quick-actions-grid">
        {quickActions.map(qa => (
          <button
            className="qa-item"
            key={qa.id}
            type="button"
            onClick={() => qa.page && onNavigate(qa.page)}
          >
            <div className="qa-icon" style={{ background: qa.color, color: qa.iconColor }}>
              <QAIcon id={qa.icon} />
            </div>
            <div className="qa-text">
              <strong>{qa.label}</strong>
              <span>{qa.desc}</span>
            </div>
            <IconChevronRight className="qa-arrow" />
          </button>
        ))}
      </div>
    </div>
  )
}
