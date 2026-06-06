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
import { showToast } from '../../../lib/feedback'
import { APP_VERSION } from '../../../config'
import type { Report } from '../../../types'

const navItems = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'monthly-reports', label: 'Monthly Reports', icon: 'reports' },
  { id: 'achievements', label: 'Achievements', icon: 'award' },
  { id: 'create-report', label: 'Create New Report', icon: 'plus' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', badgeKey: 'pending' as const },
  { id: 'announcements', label: 'Announcements', icon: 'announce' },
  { id: 'settings', label: 'Profile', icon: 'settings' },
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
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPendingCount = async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const reports = await apiFetch<Report[]>('/api/reports/my-reports', { signal })
      const list = Array.isArray(reports) ? reports : []
      const count = list.filter((r) =>
        ['Pending', 'Draft'].includes(r.reportStatus?.statusName ?? ''),
      ).length
      setPendingCount(count)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Failed to load pending count:', err)
      const msg = err instanceof Error ? err.message : 'Failed to load pending count'
      setError(msg)
      setPendingCount(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchPendingCount(controller.signal)
    return () => controller.abort()
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
            {item.badgeKey === 'pending' && (
              loading ? (
                <span className="nav-badge" style={{ background: '#9ca3af' }}>—</span>
              ) : error ? (
                <span
                  className="nav-badge"
                  style={{ background: '#f87171' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    fetchPendingCount()
                  }}
                  title="Retry"
                >!</span>
              ) : pendingCount !== null && pendingCount > 0 ? (
                <span className="nav-badge">{pendingCount}</span>
              ) : null
            )}
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
