import { IconFileText, IconClock, IconTarget, IconMegaphone } from '../../../components/icons'

const notifications = [
  {
    id: 1, icon: 'report',   color: '#d1fae5', iconColor: '#10b981',
    title: 'Your May 2025 report has been submitted',
    desc: '2 May 2025, 10:30 AM', time: '5m ago',
  },
  {
    id: 2, icon: 'pending',  color: '#fef3c7', iconColor: '#f59e0b',
    title: 'April 2025 report is pending review',
    desc: '1 May 2025, 04:15 PM', time: '1h ago',
  },
  {
    id: 3, icon: 'target',   color: '#e0e7ff', iconColor: '#6366f1',
    title: 'Your target has been updated',
    desc: '30 Apr 2025, 11:20 AM', time: '2h ago',
  },
  {
    id: 4, icon: 'announce', color: '#fce7f3', iconColor: '#ec4899',
    title: 'New announcement: Team meeting on Friday',
    desc: '29 Apr 2025, 09:00 AM', time: '1d ago',
  },
]

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case 'report':   return <IconFileText />
    case 'pending':  return <IconClock />
    case 'target':   return <IconTarget />
    case 'announce': return <IconMegaphone />
    default:         return <IconFileText />
  }
}

export default function NotificationsPanel() {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Recent Notifications</span>
        <button className="card-action" type="button">View all</button>
      </div>
      <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        <div className="notif-list">
          {notifications.map(n => (
            <div className="notif-item" key={n.id}>
              <div className="notif-icon-wrap" style={{ background: n.color, color: n.iconColor }}>
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
