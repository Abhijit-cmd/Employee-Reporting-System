import { IconBell, IconChevronDown, IconPlus } from '../../../components/icons'

interface Props {
  page: string
  onNavigate: (page: string) => void
}

const pageTitles: Record<string, { title: string; sub: string }> = {
  home:              { title: 'Employee Dashboard', sub: "Welcome back, Anil! Here's your overview." },
  'create-report':   { title: 'Create New Report',  sub: 'Home / Create New Report' },
  'monthly-reports': { title: 'Monthly Reports',    sub: 'View all your monthly reports' },
  achievements:      { title: 'Achievements',        sub: 'Your achievements and milestones' },
  notifications:     { title: 'Notifications',       sub: 'Your recent notifications' },
  announcements:     { title: 'Announcements',       sub: 'Latest announcements' },
  settings:          { title: 'Settings',            sub: 'Manage your account preferences and system settings.' },
}

const user =
  JSON.parse(
    localStorage.getItem("user") || "{}"
  )

  

export default function EmployeeNavbar({ page, onNavigate }: Props) {
  const meta = pageTitles[page] ?? pageTitles['home']

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{meta.title}</h1>
        <p>{meta.sub}</p>
      </div>

      <button className="emp-create-btn" type="button" onClick={() => onNavigate('create-report')}>
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

      {/* Clicking the profile navigates to settings */}
      <button
        className="navbar-profile"
        type="button"
        onClick={() => onNavigate('settings')}
        aria-label="Open settings"
      >
        <div className="avatar" style={{ background: '#7c3aed' }}>{user.name?.charAt(0)}</div>
        <div className="profile-info">
          <strong>{user.name}</strong>
          <span>{user.employeeId}</span>
        </div>
        <IconChevronDown className="profile-chevron" />
      </button>
    </header>
  )
}
