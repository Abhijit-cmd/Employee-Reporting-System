import { useState, useEffect } from 'react'
import { IconFileText, IconClock, IconTarget, IconMegaphone } from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import type { Report } from '../../../types'
import { formatMmyyyy, relativeTime } from '../../../lib/utils'

function NotifIcon({ type }: { type: string }) {
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

export default function NotificationsPanel() {
  const [items, setItems] = useState<
    Array<{
      id: number
      icon: string
      color: string
      iconColor: string
      title: string
      desc: string
      time: string
    }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<Report[]>('/api/reports/my-reports')
      .then((reports) => {
        const list = Array.isArray(reports) ? reports.slice(0, 4) : []
        setItems(
          list.map((r) => ({
            id: r.id,
            icon:
              r.reportStatus?.statusName === 'Pending' ||
              r.reportStatus?.statusName === 'Draft'
                ? 'pending'
                : 'report',
            color: '#d1fae5',
            iconColor: '#10b981',
            title: `Report for ${formatMmyyyy(r.mmyyyy)}`,
            desc: `Status: ${r.reportStatus?.statusName}`,
            time: relativeTime(r.createdAt),
          })),
        )
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Notifications</span>
        <button className="card-action" type="button">
          View all
        </button>
      </div>
      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {loading && (
          <p style={{ padding: 16, color: 'var(--text-muted)' }}>Loading…</p>
        )}
        {!loading && items.length === 0 && (
          <p style={{ padding: 16, color: 'var(--text-muted)' }}>No notifications.</p>
        )}
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
      </div>
    </div>
  )
}
