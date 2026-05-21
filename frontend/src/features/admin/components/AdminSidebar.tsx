import {
  IconDashboard, IconUsers, IconFileText, IconClock,
  IconBell, IconBarChart, IconTrendingUp, IconDownload, IconSettings, IconHelpCircle,
} from '../../../components/icons'

const navItems = [
  { id: 'dashboard',       label: 'Dashboard',       section: 'MANAGEMENT' },
  { id: 'employees',       label: 'Employees',        section: 'MANAGEMENT' },
  { id: 'reports',         label: 'Reports',          section: 'MANAGEMENT' },
  { id: 'pending-reports', label: 'Pending Reports',  section: 'MANAGEMENT', badge: 12 },
  { id: 'targets',         label: 'Targets',          section: 'MANAGEMENT' },
  { id: 'notifications',   label: 'Notifications',    section: 'MANAGEMENT' },
  { id: 'analytics',       label: 'Analytics',        section: 'ANALYTICS' },
  { id: 'performance',     label: 'Performance',      section: 'ANALYTICS' },
  { id: 'export-reports',  label: 'Export Reports',   section: 'SYSTEM' },
  { id: 'settings',        label: 'Settings',         section: 'SYSTEM' },
]

function NavIcon({ id }: { id: string }) {
  switch (id) {
    case 'dashboard':       return <IconDashboard />
    case 'employees':       return <IconUsers />
    case 'reports':         return <IconFileText />
    case 'pending-reports': return <IconClock />
    case 'notifications':   return <IconBell />
    case 'analytics':       return <IconBarChart />
    case 'performance':     return <IconTrendingUp />
    case 'export-reports':  return <IconDownload />
    case 'settings':        return <IconSettings />
    default:                return <IconDashboard />
  }
}

interface Props {
  active: string
  onNav: (id: string) => void
}

export default function AdminSidebar({ active, onNav }: Props) {
  const sections = ['MANAGEMENT', 'ANALYTICS', 'SYSTEM']

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">logo</div>
      <nav className="sidebar-nav">
        {sections.map(section => {
          const items = navItems.filter(n => n.section === section)
          if (!items.length) return null
          return (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item${active === item.id ? ' active' : ''}`}
                  onClick={() => onNav(item.id)}
                  type="button"
                >
                  <NavIcon id={item.id} />
                  {item.label}
                  {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </button>
              ))}
            </div>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-help">
          <div className="sidebar-help-icon"><IconHelpCircle /></div>
          <div className="sidebar-help-text">
            <strong>Need Help?</strong>
            <span>Contact Support</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
