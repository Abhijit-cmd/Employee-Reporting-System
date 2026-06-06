import { IconBell, IconChevronDown, IconPlus } from '../../shared/icons'
import { getStoredUser } from '../../../lib/auth'

interface Props {
  page: string
  onNavigate: (page: string) => void
}

const pageTitles: Record<string, { title: string; sub: string }> = {
  home: { title: 'Employee Dashboard', sub: '' },
  'create-report': { title: 'Create New Report', sub: 'Home / Create New Report' },
  'monthly-reports': { title: 'Monthly Reports', sub: 'View all your monthly reports' },
  achievements: { title: 'Achievements', sub: 'Your achievements and milestones' },
  notifications: { title: 'Notifications', sub: 'Your recent notifications' },
  announcements: { title: 'Announcements', sub: 'Latest announcements' },
  settings: {
    title: 'Settings',
    sub: 'Manage your account preferences and system settings.',
  },
}

export default function EmployeeNavbar({ page, onNavigate }: Props) {
  const user = getStoredUser()
  const meta = pageTitles[page] ?? pageTitles.home

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{meta.title}</h1>
        <p>
          {page === 'home'
            ? `Welcome back, ${user?.name ?? 'User'}! Here's your overview.`
            : meta.sub}
        </p>
      </div>

      <button
        className="emp-create-btn"
        type="button"
        onClick={() => onNavigate('create-report')}
      >
        <IconPlus />
        Create New Report
      </button>

      <div className="navbar-actions">
        <button
          className="icon-btn"
          type="button"
          aria-label="Notifications"
          onClick={() => onNavigate('notifications')}
        >
          <IconBell />
          <span className="notif-dot" />
        </button>
      </div>

      <button
        className="navbar-profile"
        type="button"
        onClick={() => onNavigate('settings')}
        aria-label="Open settings"
      >
        <div className="avatar" style={{ background: '#7c3aed' }}>
          {user?.name?.charAt(0) ?? 'U'}
        </div>
        <div className="profile-info">
          <strong>{user?.name ?? 'User'}</strong>
          <span>{user?.employeeId ?? ''}</span>
        </div>
        <IconChevronDown className="profile-chevron" />
      </button>
    </header>
  )
}
