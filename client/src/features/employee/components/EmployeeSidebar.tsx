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
  IconTarget,
  IconCalendar,
  IconX,
} from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import { APP_VERSION } from '../../../config'
import type { Report } from '../../../types'

const LAST_VIEWED_KEY = 'lastViewedAnnouncementsAt'

const navItems = [
  { id: 'home',           label: 'Home',              icon: 'home' },
  { id: 'monthly-reports',label: 'Monthly Reports',   icon: 'reports' },
  { id: 'achievements',   label: 'Achievements',      icon: 'award' },
  { id: 'create-report',  label: 'Create New Report', icon: 'plus' },
  { id: 'my-targets',     label: 'My Targets',        icon: 'target' },
  { id: 'my-appraisals',  label: 'My Appraisals',     icon: 'calendar' },
  { id: 'notifications',  label: 'Notifications',     icon: 'bell',     badge: 'pending' as const },
  { id: 'announcements',  label: 'Announcements',     icon: 'announce', badge: 'announce' as const },
  { id: 'settings',       label: 'Profile',           icon: 'settings' },
]

function NavIcon({ id }: { id: string }) {
  switch (id) {
    case 'home':     return <IconHome />
    case 'reports':  return <IconFileText />
    case 'award':    return <IconAward />
    case 'plus':     return <IconPlus />
    case 'bell':     return <IconBell />
    case 'target':   return <IconTarget />
    case 'calendar': return <IconCalendar />
    case 'announce': return <IconMegaphone />
    case 'settings': return <IconSettings />
    default:         return <IconHome />
  }
}

interface Props {
  active: string
  onNav: (id: string) => void
  open?: boolean
  onClose?: () => void
}

export default function EmployeeSidebar({ active, onNav, open = false, onClose }: Props) {
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [pendingError, setPendingError] = useState('')
  const [announceBadge, setAnnounceBadge] = useState(0)

  // Pending reports badge
  const fetchPendingCount = async (signal?: AbortSignal) => {
    setPendingLoading(true)
    setPendingError('')
    try {
      const reports = await apiFetch<Report[]>('/api/reports/my-reports', { signal })
      const list = Array.isArray(reports) ? reports : []
      setPendingCount(list.filter(r => ['Pending', 'Draft'].includes(r.reportStatus?.statusName ?? '')).length)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setPendingError(err instanceof Error ? err.message : 'Error')
      setPendingCount(null)
    } finally {
      setPendingLoading(false)
    }
  }

  useEffect(() => {
    const ctrl = new AbortController()
    fetchPendingCount(ctrl.signal)
    return () => ctrl.abort()
  }, [])

  // Announcements badge — count items newer than last time user viewed announcements
  useEffect(() => {
    const lastViewed = Number(localStorage.getItem(LAST_VIEWED_KEY) || '0')
    apiFetch<{ id: number; createdAt: string }[]>('/api/admin/announcements')
      .then(data => {
        const list = Array.isArray(data) ? data : []
        const newCount = list.filter(a => new Date(a.createdAt).getTime() > lastViewed).length
        setAnnounceBadge(newCount)
      })
      .catch(() => {})
  }, [])

  function handleNav(id: string) {
    if (id === 'announcements') {
      localStorage.setItem(LAST_VIEWED_KEY, String(Date.now()))
      setAnnounceBadge(0)
    }
    onNav(id)
  }

  return (
    <aside className={`sidebar${open ? ' mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Logo" />
        <button className="sidebar-close-btn" type="button" aria-label="Close menu" onClick={onClose}>
          <IconX />
        </button>
      </div>
      <nav className="sidebar-nav" style={{ paddingTop: 8 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => handleNav(item.id)}
            type="button"
          >
            <NavIcon id={item.icon} />
            {item.label}

            {/* Pending reports badge */}
            {item.badge === 'pending' && (
              pendingLoading ? (
                <span className="nav-badge" style={{ background: '#9ca3af' }}>—</span>
              ) : pendingError ? (
                <span
                  className="nav-badge"
                  role="button"
                  tabIndex={0}
                  style={{ background: '#f87171', cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); fetchPendingCount() }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); fetchPendingCount() } }}
                  title="Retry"
                >!</span>
              ) : pendingCount !== null && pendingCount > 0 ? (
                <span className="nav-badge">{pendingCount}</span>
              ) : null
            )}

            {/* Announcements badge — dot with count if new announcements exist */}
            {item.badge === 'announce' && announceBadge > 0 && (
              <span className="nav-badge" style={{ background: '#c62828' }}>
                {announceBadge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-help">
          <div className="sidebar-help-icon"><IconHelpCircle /></div>
          <div className="sidebar-help-text"><strong>Version {APP_VERSION}</strong></div>
        </div>
      </div>
    </aside>
  )
}
