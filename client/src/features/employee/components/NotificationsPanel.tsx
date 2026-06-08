import { useState, useEffect } from 'react'
import { IconFileText, IconClock, IconTarget, IconMegaphone } from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import { relativeTime } from '../../../lib/utils'

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
    case 'target':   return <IconTarget />
    case 'report':   return <IconFileText />
    default:         return <IconMegaphone />
  }
}

function iconStyle(type: string) {
  switch (type) {
    case 'pending':  return { bg: '#fef3c7', color: '#f59e0b' }
    case 'reviewed': return { bg: '#d1fae5', color: '#10b981' }
    case 'target':   return { bg: '#ede9fe', color: '#7c3aed' }
    default:         return { bg: '#fdecea', color: '#c62828' }
  }
}

export default function NotificationsPanel({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch<Notification[]>('/api/notifications')
      .then((data) => { if (!cancelled) setItems(Array.isArray(data) ? data.slice(0, 4) : []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Notifications</span>
        <button className="card-action" type="button" onClick={() => onNavigate?.('notifications')}>
          View all
        </button>
      </div>

      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {loading && <p style={{ padding: 16, color: 'var(--text-muted)' }}>Loading…</p>}

        {!loading && items.length === 0 && (
          <p style={{ padding: 16, color: 'var(--text-muted)' }}>No notifications.</p>
        )}

        {!loading && items.length > 0 && (
          <div className="notif-list">
            {items.map((n) => {
              const s = iconStyle(n.notificationType)
              return (
                <div
                  className="notif-item"
                  key={n.id}
                  style={{
                    background: n.isRead ? 'transparent' : 'rgba(198,40,40,0.04)',
                    borderLeft: n.isRead ? '3px solid transparent' : '3px solid #c62828',
                  }}
                >
                  <div className="notif-icon-wrap" style={{ background: s.bg, color: s.color }}>
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
    </div>
  )
}
