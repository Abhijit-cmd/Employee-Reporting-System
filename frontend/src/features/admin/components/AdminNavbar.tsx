import { useState, useRef, useEffect } from 'react'
import {
  IconSearch, IconBell, IconChevronDown,
} from '../../../components/icons'

interface Props {
  page: string
  onNavigate: (page: string) => void
}

// ── Mini calendar ─────────────────────────────────────────────────────────────
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_SHORT   = ['Su','Mo','Tu','We','Th','Fr','Sa']

function IcoCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IcoChevLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function IcoChevRight() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}

function NavCalendar() {
  const today = new Date()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<Date>(today)
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }
  function selectDay(day: number) {
    setSelected(new Date(viewYear, viewMonth, day))
    setOpen(false)
  }

  const label = `${MONTHS_SHORT[selected.getMonth()]} ${selected.getFullYear()}`

  return (
    <div className="navbar-date-picker" ref={ref}>
      <button className="navbar-date" type="button" onClick={() => setOpen(o => !o)}>
        <IcoCalendar />
        {label}
        <IconChevronDown className="profile-chevron" />
      </button>
      {open && (
        <div className="rp-cal-popup navbar-cal-popup" onClick={e => e.stopPropagation()}>
          <div className="rp-cal-header">
            <button type="button" className="rp-cal-nav" onClick={prevMonth}><IcoChevLeft /></button>
            <span className="rp-cal-month">{MONTHS_SHORT[viewMonth]} {viewYear}</span>
            <button type="button" className="rp-cal-nav" onClick={nextMonth}><IcoChevRight /></button>
          </div>
          <div className="rp-cal-grid">
            {DAYS_SHORT.map(d => <div key={d} className="rp-cal-day-label">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`} />
              const isSel = selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day
              const isTod = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
              return (
                <button
                  key={day}
                  type="button"
                  className={`rp-cal-day${isSel ? ' selected' : ''}${isTod && !isSel ? ' today' : ''}`}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page title map ────────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  dashboard:        { title: 'Admin Dashboard',  sub: "Welcome back, Admin! Here's what's happening today..!" },
  employees:        { title: 'Employees',         sub: 'Dashboard / Employees' },
  reports:          { title: 'Reports',           sub: 'Dashboard / Reports' },
  'pending-reports':{ title: 'Pending Reports',   sub: 'Dashboard / Pending Reports' },
  targets:          { title: 'Targets',           sub: 'Dashboard / Targets' },
  notifications:    { title: 'Notifications',     sub: 'Dashboard / Notifications' },
  analytics:        { title: 'Analytics',         sub: 'Dashboard / Analytics' },
  performance:      { title: 'Performance',       sub: 'Dashboard / Performance' },
  'export-reports': { title: 'Export Reports',    sub: 'Dashboard / Export Reports' },
  settings:         { title: 'Settings',          sub: 'Dashboard / Settings' },
}

export default function AdminNavbar({ page, onNavigate }: Props) {
  const meta = PAGE_TITLES[page] ?? PAGE_TITLES['dashboard']

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{meta.title}</h1>
        <p>{meta.sub}</p>
      </div>
      <div className="navbar-search">
        <IconSearch />
        <input type="text" placeholder="Search employee..." />
      </div>
      <NavCalendar />
      <div className="navbar-actions">
        <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => onNavigate('notifications')}>
          <IconBell />
          <span className="notif-dot" />
        </button>
      </div>
      <div className="navbar-profile">
        <div className="avatar">A</div>
        <div className="profile-info">
          <strong>Admin User</strong>
          <span>Super Admin</span>
        </div>
        <IconChevronDown className="profile-chevron" />
      </div>
    </header>
  )
}
