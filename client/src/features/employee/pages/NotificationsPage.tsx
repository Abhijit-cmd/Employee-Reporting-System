import { useState, useEffect } from 'react'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { relativeTime } from '../../../lib/utils'
import { IconClock, IconFileText, IconTarget, IconMegaphone } from '../../shared/icons'

interface Notification {
  id: number
  title: string
  message: string
  notificationType: string
  isRead: boolean
  createdAt: string
}

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case 'pending':  return <IconClock />
    case 'reviewed': return <IconTarget />
    case 'report':   return <IconFileText />
    default:         return <IconMegaphone />
  }
}

function iconStyle(type: string): { bg: string; color: string } {
  switch (type) {
    case 'pending':  return { bg: '#fef3c7', color: '#f59e0b' }
    case 'reviewed': return { bg: '#d1fae5', color: '#10b981' }
    default:         return { bg: '#fdecea', color: '#c62828' }
  }
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    apiFetch<Notification[]>('/api/notifications')
      .then((data) => { if (!cancelled) setItems(Array.isArray(data) ? data : []) })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function markAllRead() {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PATCH' })
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
      showToast('All notifications marked as read', 'success')
    } catch {
      showToast('Failed to mark as read', 'error')
    }
  }

  const unreadCount = items.filter((n) => !n.isRead).length

  return (
    <main className="page-content">
      <div className="card emp-page-card">
        <div className="emp-page-topbar">
          <div>
            <div className="emp-page-heading">Notifications</div>
            <div className="emp-page-sub">
              {loading ? 'Loading…' : `${items.length} total · ${unreadCount} unread`}
            </div>
          </div>
          {unreadCount > 0 && (
            <button className="cnr-btn-draft" type="button" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {loading && <p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading notifications…</p>}
        {error && !loading && <p style={{ padding: 24, color: '#ef4444' }}>{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <IconMegaphone />
            <p style={{ marginTop: 12 }}>No notifications yet.</p>
            <p style={{ fontSize: 13 }}>You'll be notified when an admin reviews your reports.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="notif-list" style={{ padding: '8px 0' }}>
            {items.map((n) => {
              const style = iconStyle(n.notificationType)
              return (
                <div
                  key={n.id}
                  className="notif-item"
                  style={{
                    padding: '14px 20px',
                    background: n.isRead ? 'transparent' : 'rgba(198,40,40,0.04)',
                    borderLeft: n.isRead ? '3px solid transparent' : '3px solid #c62828',
                  }}
                >
                  <div className="notif-icon-wrap" style={{ background: style.bg, color: style.color }}>
                    <NotifIcon type={n.notificationType} />
                  </div>
                  <div className="notif-content">
                    <div className="notif-title" style={{ fontWeight: n.isRead ? 500 : 700 }}>{n.title}</div>
                    <div className="notif-desc">{n.message}</div>
                  </div>
                  <div className="notif-time">{relativeTime(n.createdAt)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
