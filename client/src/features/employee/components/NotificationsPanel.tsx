import { useState, useEffect } from 'react'
import { IconFileText, IconClock, IconTarget, IconMegaphone } from '../../../components/icons'

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
    case 'report':   return <IconFileText />
    case 'pending':  return <IconClock />
    case 'target':   return <IconTarget />
    case 'announce': return <IconMegaphone />
    default:         return <IconFileText />
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  report:   { bg: '#d1fae5', color: '#10b981' },
  pending:  { bg: '#fef3c7', color: '#f59e0b' },
  target:   { bg: '#e0e7ff', color: '#6366f1' },
  announce: { bg: '#fce7f3', color: '#ec4899' },
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/profile`,
          { headers: { Authorization: token ? `Bearer ${token}` : '' } }
        )
        if (!res.ok) return
        // Notifications endpoint not yet available; show empty state gracefully
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Notifications</span>
        <button className="card-action" type="button">View all</button>
      </div>
      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>Loading…</p>
        ) : notifications.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>No notifications yet</p>
        ) : (
          <div className="notif-list">
            {notifications.map(n => {
              const style = TYPE_STYLES[n.notificationType] ?? TYPE_STYLES['report']
              return (
                <div className="notif-item" key={n.id}>
                  <div className="notif-icon-wrap" style={{ background: style.bg, color: style.color }}>
                    <NotifIcon type={n.notificationType} />
                  </div>
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-desc">{n.message}</div>
                  </div>
                  <div className="notif-time">{timeAgo(n.createdAt)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
