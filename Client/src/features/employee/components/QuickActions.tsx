import {
  IconPlus, IconFileText, IconEdit, IconTarget, IconChevronRight,
} from '../../shared/icons'

interface Props {
  onNavigate: (page: string) => void
}

const actions = [
  { id: 1, icon: 'create', page: 'create-report',    color: '#e0e7ff', iconColor: '#6366f1', label: 'Create New Report', desc: 'Create and submit your monthly report' },
  { id: 2, icon: 'view',   page: 'monthly-reports',  color: '#d1fae5', iconColor: '#10b981', label: 'View My Reports',   desc: 'View all your submitted reports' },
  { id: 3, icon: 'draft',  page: 'monthly-reports',  color: '#fef3c7', iconColor: '#f59e0b', label: 'Draft Reports',     desc: 'Continue your draft reports' },
  { id: 4, icon: 'target', page: 'achievements',     color: '#fce7f3', iconColor: '#ec4899', label: 'Update Targets',    desc: 'View and update your targets' },
]

function ActionIcon({ id }: { id: string }) {
  switch (id) {
    case 'create': return <IconPlus />
    case 'view':   return <IconFileText />
    case 'draft':  return <IconEdit />
    case 'target': return <IconTarget />
    default:       return <IconPlus />
  }
}

export default function QuickActions({ onNavigate }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Quick Actions</span>
      </div>
      <div className="card-body" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {actions.map(a => (
          <button className="qa-item" key={a.id} type="button" onClick={() => onNavigate(a.page)}>
            <div className="qa-icon" style={{ background: a.color, color: a.iconColor }}>
              <ActionIcon id={a.icon} />
            </div>
            <div className="qa-text">
              <strong>{a.label}</strong>
              <span>{a.desc}</span>
            </div>
            <IconChevronRight className="qa-arrow" />
          </button>
        ))}
      </div>
    </div>
  )
}
