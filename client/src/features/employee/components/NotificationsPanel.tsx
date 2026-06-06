import { useState, useEffect } from 'react'
import {
  IconFileText,
  IconClock,
  IconTarget,
  IconMegaphone,
} from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import type { Report } from '../../../types'
import { formatMmyyyy, relativeTime } from '../../../lib/utils'

type NotifType = 'report' | 'pending' | 'target' | 'default'

function NotifIcon({ type }: { type: NotifType }) {
  switch (type) {
    case 'report':
      return <IconFileText />
    case 'pending':
      return <IconClock />
    case 'target':
      return <IconTarget />
    default:
      return <IconMegaphone />
  }
}

type NotificationItem = {
  id: number
  icon: NotifType
  color: string
  iconColor: string
  title: string
  desc: string
  time: string
}

export default function NotificationsPanel() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const reports = await apiFetch<Report[]>('/api/reports/my-reports')
      const list = Array.isArray(reports) ? reports.slice(0, 4) : []
      const mapped: NotificationItem[] = list.map((r) => {
        const status = (r.reportStatus?.statusName || '').toLowerCase()
        const icon: NotifType =
          status === 'pending' || status === 'draft' ? 'pending' : 'report'
        return {
          id: r.id,
          icon,
          color: '#d1fae5',
          iconColor: '#10b981',
          title: `Report for ${formatMmyyyy(r.mmyyyy)}`,
          desc: `Status: ${r.reportStatus?.statusName}`,
          time: relativeTime(r.createdAt),
        }
      })
      setItems(mapped)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      const msg = err instanceof Error ? err.message : 'Failed to load notifications'
      setError(msg)
      showToast(msg, 'error')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const reports = await apiFetch<Report[]>('/api/reports/my-reports')
        if (cancelled) return
        const list = Array.isArray(reports) ? reports.slice(0, 4) : []
        const mapped: NotificationItem[] = list.map((r) => {
          const status = (r.reportStatus?.statusName || '').toLowerCase()
          const icon: NotifType =
            status === 'pending' || status === 'draft' ? 'pending' : 'report'
          return {
            id: r.id,
            icon,
            color: '#d1fae5',
            iconColor: '#10b981',
            title: `Report for ${formatMmyyyy(r.mmyyyy)}`,
            desc: `Status: ${r.reportStatus?.statusName}`,
            time: relativeTime(r.createdAt),
          }
        })
        setItems(mapped)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to load notifications:', err)
        const msg = err instanceof Error ? err.message : 'Failed to load notifications'
        setError(msg)
        showToast(msg, 'error')
        setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Notifications</span>
        {error ? (
          <button className="card-action" type="button" onClick={fetchNotifications}>
            Retry
          </button>
        ) : (
          <button className="card-action" type="button">
            View all
          </button>
        )}
      </div>

      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {loading && (
          <p style={{ padding: 16, color: 'var(--text-muted)' }}>Loading…</p>
        )}

        {error && !loading && (
          <div style={{ padding: 16, textAlign: 'center' }}>
            <p style={{ color: '#ef4444', marginBottom: '8px' }}>{error}</p>
            <button
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              type="button"
              onClick={fetchNotifications}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p style={{ padding: 16, color: 'var(--text-muted)' }}>
            No notifications.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="notif-list">
            {items.map((n) => (
              <div className="notif-item" key={n.id}>
                <div
                  className="notif-icon-wrap"
                  style={{ background: n.color, color: n.iconColor }}
                >
                  <NotifIcon type={n.icon} />
                </div>

                <div className="notif-content">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-desc">{n.desc}</div>
                </div>

                <div className="notif-time">{n.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}