import { useState, useRef, useEffect } from 'react'
import {

  IconBell,
  IconChevronDown,
} from '../../shared/icons'
import { getStoredUser } from '../../../lib/auth'
import { initials } from '../../../lib/utils'

interface Props {
  page: string
  onNavigate: (page: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function IcoCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function NavCalendar() {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Date>(today)
  const [viewYear, setViewYear] = useState(today.getFullYear())
const [viewMonth, setViewMonth] = useState(today.getMonth())
  const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      function handleClickOutside(e: PointerEvent) {
        if (!ref.current) return
    
        const target = e.target as Node
    
        if (!ref.current.contains(target)) {
          setOpen(false)
        }
      }
    
      document.addEventListener('pointerdown', handleClickOutside)
    
      return () => {
        document.removeEventListener('pointerdown', handleClickOutside)
      }
    }, [])

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const label = `${MONTHS_SHORT[viewMonth]} ${viewYear}`

  return (
    <div className="navbar-date-picker" ref={ref}>
      <button className="navbar-date" type="button" onClick={() => setOpen((o) => !o)}>
        <IcoCalendar />
        {label}
        <IconChevronDown className="profile-chevron" />
      </button>
      {open && (
        <div className="rp-cal-popup navbar-cal-popup" onClick={(e) => e.stopPropagation()}>
          <div className="rp-cal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

<button
  type="button"
  onClick={() => {
    setViewMonth(prev => {
      if (prev === 0) {
        setViewYear(y => y - 1)
        return 11
      }
      return prev - 1
    })
  }}
>
  ‹
</button>

<span className="rp-cal-month">
  {MONTHS_SHORT[viewMonth]} {viewYear}
</span>

<button
  type="button"
  onClick={() => {
    setViewMonth(prev => {
      if (prev === 11) {
        setViewYear(y => y + 1)
        return 0
      }
      return prev + 1
    })
  }}
>
  ›
</button>

</div>
          <div className="rp-cal-grid">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="rp-cal-day-label">
                {d}
              </div>
            ))}
            {cells.map((day, i) =>
              day ? (
                <button
                  key={day}
                  type="button"
                  className="rp-cal-day"
                  onClick={() => {
                    setSelected(new Date(viewYear, viewMonth, day))
                  }}
                >
                  {day}
                </button>
              ) : (
                <div key={`e${i}`} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  dashboard: {
    title: 'Admin Dashboard',
    sub: "Welcome back! Here's what's happening today.",
  },
  employees: { title: 'Employees', sub: 'Dashboard / Employees' },
  reports: { title: 'Reports', sub: 'Dashboard / Reports' },
  'pending-reports': { title: 'Pending Reports', sub: 'Dashboard / Pending Reports' },
  settings: { title: 'Settings', sub: 'Dashboard / Settings' },
}

export default function AdminNavbar({
  page,
  onNavigate,
  searchQuery,
  onSearchChange,
}: Props) {
  const user = getStoredUser()
  const meta = PAGE_TITLES[page] ?? PAGE_TITLES.dashboard
  const displayName = user?.name ?? 'Admin'

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{meta.title}</h1>
        <p>
          {page === 'dashboard'
            ? `Welcome back, ${displayName}! ${meta.sub}`
            : meta.sub}
        </p>
      </div>

      <div className="navbar-search">
        <input
          className="navbar-search-input"
          type="text"
          placeholder="Search employees…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <NavCalendar />
      <div className="navbar-actions">
        <button
          className="icon-btn"
          type="button"
          aria-label="Notifications"
          onClick={() => onNavigate('reports')}
        >
          <IconBell />
          <span className="notif-dot" />
        </button>
      </div>
      <button
        className="navbar-profile"
        type="button"
        onClick={() => onNavigate('settings')}
        style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
      >
        <div className="avatar">{initials(displayName)}</div>
        <div className="profile-info">
          <strong>{displayName}</strong>
          <span>{typeof user?.role === 'string' ? user.role : user?.role?.roleName ?? 'Admin'}</span>
        </div>
        <IconChevronDown className="profile-chevron" />
      </button>
    </header>
  )
}
