import { useState, useEffect } from 'react'
import {
  IconHome,
  IconFileText,
  IconAward,
  IconPlus,
  IconBell,
  IconMegaphone,
  IconSettings,
  IconHelpCircle,
} from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import { APP_VERSION } from '../../../config'
import type { Report } from '../../../types'

const navItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'monthly-reports', label: 'Monthly Reports', icon: 'reports' },
  { id: 'achievements', label: 'Achievements', icon: 'award' },
  { id: 'create-report', label: 'Create New Report', icon: 'plus' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', badgeKey: 'pending' as const },
  { id: 'announcements', label: 'Announcements', icon: 'announce' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function NavIcon({ id }: { id: string }) {
  switch (id) {
    case 'home':
      return <IconHome />
    case 'reports':
      return <IconFileText />
    case 'award':
      return <IconAward />
    case 'plus':
      return <IconPlus />
    case 'bell':
      return <IconBell />
    case 'announce':
      return <IconMegaphone />
    case 'settings':
      return <IconSettings />
    default:
      return <IconHome />
  }
}

interface Props {
  active: string
  onNav: (id: string) => void
}

export default function EmployeeSidebar({ active, onNav }: Props) {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    apiFetch<Report[]>('/api/reports/my-reports')
      .then((reports) => {
        const list = Array.isArray(reports) ? reports : []
        setPendingCount(
          list.filter((r) =>
            ['Pending', 'Draft'].includes(r.reportStatus?.statusName ?? ''),
          ).length,
        )
      })
      .catch(() => setPendingCount(0))
  }, [])

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Logo" />
      </div>
      <nav className="sidebar-nav" style={{ paddingTop: 8 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onNav(item.id)}
            type="button"
          >
            <NavIcon id={item.icon} />
            {item.label}
            {item.badgeKey === 'pending' && pendingCount > 0 ? (
              <span className="nav-badge">{pendingCount}</span>
            ) : null}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-help">
          <div className="sidebar-help-icon">
            <IconHelpCircle />
          </div>
          <div className="sidebar-help-text">
            <strong>Version {APP_VERSION}</strong>
          </div>
        </div>
      </div>
    </aside>
  )
}
