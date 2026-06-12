import { useEffect, useRef, useState } from 'react'
import { IconBell, IconChevronDown, IconPlus, IconMenu } from '../../shared/icons'
import { getStoredUser } from '../../../lib/auth'
import { apiFetch } from '../../../lib/api'

interface Props {
  page: string
  onNavigate: (page: string) => void
  onMenuClick?: () => void
}

const pageTitles: Record<string, { title: string; sub: string }> = {
  home: { title: 'Employee Dashboard', sub: '' },
  'create-report': { title: 'Create New Report', sub: 'Home / Create New Report' },
  'monthly-reports': { title: 'Monthly Reports', sub: 'View all your monthly reports' },
  achievements: { title: 'Achievements', sub: 'Your achievements and milestones' },
  'my-targets': { title: 'My Targets', sub: 'View and update your assigned targets' },
  notifications: { title: 'Notifications', sub: 'Your recent notifications' },
  announcements: { title: 'Announcements', sub: 'Latest announcements' },
  settings: {
    title: 'Settings',
    sub: 'Manage your account preferences and system settings.',
  },
}

export default function EmployeeNavbar({ page, onNavigate, onMenuClick }: Props) {
  const user = getStoredUser()
  const meta = pageTitles[page] ?? pageTitles.home
  const [unreadCount, setUnreadCount] = useState(0)
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  useEffect(() => {
    apiFetch<{ isRead: boolean }[]>('/api/notifications')
      .then((data) => {
        if (!mountedRef.current) return
        const count = Array.isArray(data) ? data.filter((n) => !n.isRead).length : 0
        setUnreadCount(count)
      })
      .catch(() => {})
  }, [page])

  return (
    <header className="navbar">
      <button className="menu-btn" type="button" aria-label="Open menu" onClick={onMenuClick}>
        <IconMenu />
      </button>
      <div className="navbar-title">
        <h1>{meta.title}</h1>
        <p>
          {page === 'home'
            ? `Welcome back, ${user?.name ?? 'User'}! Here's your overview.`
            : meta.sub}
        </p>
      </div>

      {(page === 'home' || page === 'create-report') && (
        <button
          className="emp-create-btn"
          type="button"
          onClick={() => onNavigate('create-report')}
        >
          <IconPlus />
          <span>Create New Report</span>
        </button>
      )}

      <div className="navbar-actions">
        <button
          className="icon-btn"
          type="button"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          onClick={() => onNavigate('notifications')}
        >
          <IconBell />
          {unreadCount > 0 && (
            <span className="notif-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <button
        className="navbar-profile"
        type="button"
        onClick={() => onNavigate('settings')}
        aria-label="Open settings"
      >
        <div className="avatar">
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
