import { useState, useRef, useEffect } from 'react'
import { reportStore } from '../../../store/reportStore'
import type { Report, ReportStatus } from '../../../store/reportStore'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Props { onNavigate: (page: string) => void }

// ── Icons ─────────────────────────────────────────────────────────────────────
function IcoSearch() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IcoCalendar() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function IcoDownload() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
function IcoEye() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
function IcoChevLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function IcoChevRight() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}
function IcoChevDown() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
}
function IcoX() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function IcoArrowLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 1)
}

const STATUS_STYLES: Record<ReportStatus, string> = {
  Submitted: 'rp-badge-submitted',
  Pending:   'rp-badge-pending',
  Rejected:  'rp-badge-rejected',
  Draft:     'rp-badge-draft',
}

const STATUSES: Array<ReportStatus | 'All Status'> = ['All Status', 'Submitted', 'Pending', 'Rejected', 'Draft']
const PAGE_SIZE = 8

// ── Mini calendar ─────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

function MiniCalendar({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
  const today = new Date()
  const init  = value ? new Date(value) : today
  const [viewYear,  setViewYear]  = useState(init.getFullYear())
  const [viewMonth, setViewMonth] = useState(init.getMonth())

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

  const selDate = value ? new Date(value) : null

  return (
    <div className="rp-cal-popup" onClick={e => e.stopPropagation()}>
      <div className="rp-cal-header">
        <button type="button" className="rp-cal-nav" onClick={prevMonth}><IcoChevLeft /></button>
        <span className="rp-cal-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" className="rp-cal-nav" onClick={nextMonth}><IcoChevRight /></button>
      </div>
      <div className="rp-cal-grid">
        {DAYS.map(d => <div key={d} className="rp-cal-day-label">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />
          const isSel = selDate && selDate.getFullYear() === viewYear && selDate.getMonth() === viewMonth && selDate.getDate() === day
          const isTod = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
          return (
            <button key={day} type="button"
              className={`rp-cal-day${isSel ? ' selected' : ''}${isTod && !isSel ? ' today' : ''}`}
              onClick={() => { onChange(new Date(viewYear, viewMonth, day).toISOString().slice(0, 10)); onClose() }}
            >{day}</button>
          )
        })}
      </div>
      {value && (
        <div className="rp-cal-footer">
          <button type="button" className="rp-cal-clear" onClick={() => { onChange(''); onClose() }}>Clear</button>
        </div>
      )}
    </div>
  )
}

function DatePicker({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const display = value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  return (
    <div className="rp-datepicker" ref={ref}>
      <div className="rp-datepicker-input" onClick={() => setOpen(o => !o)}>
        <span className="rp-datepicker-icon"><IcoCalendar /></span>
        <span className={display ? 'rp-datepicker-val' : 'rp-datepicker-placeholder'}>{display || placeholder}</span>
        {value && <button type="button" className="rp-datepicker-clear" onClick={e => { e.stopPropagation(); onChange('') }}><IcoX /></button>}
      </div>
      {open && <MiniCalendar value={value} onChange={onChange} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ── View Report — slide-over drawer card ─────────────────────────────────────
function ViewReportDrawer({ report, onClose }: { report: Report; onClose: () => void }) {
  const MAX = 1000

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function SectionBadge({ num }: { num: number }) {
    return <div className="vr-badge">{num}</div>
  }

  function ReadonlyField({ label, value }: { label: string; value: string }) {
    return (
      <div className="vr-field">
        <label className="vr-label">{label}</label>
        <input className="vr-input" type="text" readOnly value={value} />
      </div>
    )
  }

  function ReadonlyNumber({ label, value, required }: { label: string; value: number; required?: boolean }) {
    return (
      <div className="vr-row">
        <span className="vr-row-label">{label}{required && <span className="vr-req"> *</span>}</span>
        <div className="vr-number-wrap">
          <input className="vr-input vr-number" type="number" readOnly value={value} />
        </div>
      </div>
    )
  }

  function ReadonlyTextarea({ label, value }: { label?: string; value: string }) {
    return (
      <div className="vr-textarea-section">
        {label && <div className="vr-textarea-label">{label}</div>}
        <div className="vr-textarea-wrap">
          <textarea className="vr-textarea" readOnly value={value} />
          <div className="vr-char-count">{value.length} / {MAX}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Dim backdrop */}
      <div className="vr-backdrop" onClick={onClose} />

      {/* Drawer card */}
      <div className="vr-drawer">

        {/* ── Drawer header ─────────────────────────────── */}
        <div className="vr-drawer-header">
          <div className="vr-drawer-title-wrap">
            <h2 className="vr-drawer-title">Monthly Overview – Indithrive Infratech Pvt LTD</h2>
            <span className={`status-badge rp-badge ${STATUS_STYLES[report.status]}`}>{report.status}</span>
          </div>
          <button className="vr-drawer-close" type="button" onClick={onClose} aria-label="Close">
            <IcoX />
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────── */}
        <div className="vr-drawer-body">

          {/* Header fields */}
          <div className="vr-drawer-section">
            <div className="vr-header-fields-2col">
              <ReadonlyField label="MMYYYY *"         value={report.mmyyyy} />
              <ReadonlyField label="Business Owner *"  value={report.businessOwner} />
              <ReadonlyField label="Prepared by: *"    value={report.preparedBy} />
              <ReadonlyField label="Reviewed by: *"    value={report.reviewedBy} />
            </div>
          </div>

          {/* Section 1 */}
          <div className="vr-drawer-section">
            <div className="vr-section-header">
              <SectionBadge num={1} />
            </div>
            <div className="vr-section-body">
              <ReadonlyNumber label="No of Customer Registration :"    value={report.customerReg}   required />
              <ReadonlyNumber label="No of Supplier Registration :"    value={report.supplierReg}   required />
              <ReadonlyNumber label="Name of Products /Brand added :"  value={report.productsAdded} required />
              <ReadonlyNumber label="New Success Stories :"            value={report.successStories} />
              <ReadonlyNumber label="No of Visits to new site :"       value={report.siteVisits} />
            </div>
          </div>

          {/* Section 2 */}
          <div className="vr-drawer-section">
            <div className="vr-section-header">
              <SectionBadge num={2} />
              <span className="vr-section-title">Customer/Supplier/logistics/Finance Challenges</span>
            </div>
            <div className="vr-section-body">
              <ReadonlyTextarea value={report.challenges} />
            </div>
          </div>

          {/* Section 3 */}
          <div className="vr-drawer-section">
            <div className="vr-section-header">
              <SectionBadge num={3} />
              <span className="vr-section-title">Your individual metrics and YTD achievement</span>
            </div>
            <div className="vr-section-body">
              <ReadonlyTextarea label="Sales Booking Productwise Quantity & Value" value={report.salesBooking} />
              <ReadonlyTextarea label="Target Vs Achievement" value={report.targetVsAchievement} />
            </div>
          </div>

          {/* Section 4 */}
          <div className="vr-drawer-section">
            <div className="vr-section-header">
              <SectionBadge num={4} />
              <span className="vr-section-title">Your top accomplishments YTD (and any comments on your strengths)</span>
            </div>
            <div className="vr-section-body">
              <ReadonlyTextarea value={report.accomplishments} />
            </div>
          </div>

        </div>

        {/* ── Drawer footer ─────────────────────────────── */}
        <div className="vr-drawer-footer">
          <button className="cnr-btn-back" type="button" onClick={onClose}>
            <IcoArrowLeft /> Close
          </button>
          <button className="cnr-btn-submit" type="button">
            <IcoDownload /> Download
          </button>
        </div>

      </div>
    </>
  )
}

// ── Reports list ──────────────────────────────────────────────────────────────
function ReportsList({
  onView,
}: {
  onView: (r: Report) => void
}) {
  const [search,       setSearch]       = useState('')
  const [startDate,    setStartDate]    = useState('')
  const [endDate,      setEndDate]      = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'All Status'>('All Status')
  const [page,         setPage]         = useState(1)

  const filtered = reportStore.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.empName.toLowerCase().includes(q) || r.empId.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All Status' || r.status === statusFilter
    let matchDate = true
    if (startDate || endDate) {
      const parts = r.submittedOn.split(',')[0].trim().split(' ')
      const rDate = new Date(`${parts[1]} ${parts[0]} ${parts[2]}`)
      if (startDate && rDate < new Date(startDate)) matchDate = false
      if (endDate   && rDate > new Date(endDate))   matchDate = false
    }
    return matchSearch && matchStatus && matchDate
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const rows       = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function pageNumbers(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const nums: (number | '...')[] = [1]
    if (safePage > 3) nums.push('...')
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) nums.push(i)
    if (safePage < totalPages - 2) nums.push('...')
    nums.push(totalPages)
    return nums
  }

  return (
    <main className="page-content">
      <div className="card rp-card">

        {/* Top bar */}
        <div className="rp-topbar">
          <div className="emp-page-heading">Reports</div>
          <button className="cnr-btn-submit rp-export-btn" type="button">
            <IcoDownload /> Export All
          </button>
        </div>

        {/* Filters */}
        <div className="rp-filters">
          <div className="emp-search-wrap rp-search">
            <IcoSearch />
            <input
              className="emp-search-input"
              type="text"
              placeholder="Search by employee name or ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <DatePicker value={startDate} onChange={v => { setStartDate(v); setPage(1) }} placeholder="Start Date" />
          <span className="rp-date-sep">to</span>
          <DatePicker value={endDate}   onChange={v => { setEndDate(v);   setPage(1) }} placeholder="End Date" />
          <div className="emp-select-wrap">
            <select
              className="emp-select rp-status-select"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as ReportStatus | 'All Status'); setPage(1) }}
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <IcoChevDown />
          </div>
        </div>

        {/* Table */}
        <div className="rp-table-wrap">
          <table className="reports-table rp-table">
            <thead className="rp-thead">
              <tr>
                <th>Employee</th>
                <th>Month</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    No reports found.
                  </td>
                </tr>
              ) : rows.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="emp-cell">
                      <div className="emp-avatar rp-avatar">{initials(r.empName)}</div>
                      <div>
                        <div className="rp-emp-name">{r.empName}</div>
                        <div className="rp-emp-id">{r.empId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.month}</td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.submittedOn}</td>
                  <td>
                    <span className={`status-badge rp-badge ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                  </td>
                  <td>
                    <div className="rp-actions">
                      <button className="action-btn rp-action-btn" type="button" title="View report" onClick={() => onView(r)}>
                        <IcoEye />
                      </button>
                      <button className="action-btn rp-action-btn" type="button" title="Download">
                        <IcoDownload />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="table-footer">
          <span className="table-count">
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} reports
          </span>
          <div className="pagination">
            <button className="page-btn" type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
              <IcoChevLeft />
            </button>
            {pageNumbers().map((p, i) =>
              p === '...'
                ? <span key={`e${i}`} className="rp-ellipsis">...</span>
                : <button key={p} className={`page-btn${safePage === p ? ' active' : ''}`} type="button" onClick={() => setPage(p as number)}>{p}</button>
            )}
            <button className="page-btn" type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
              <IcoChevRight />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function ReportsPage({ onNavigate: _onNavigate }: Props) {
  const [viewReport, setViewReport] = useState<Report | null>(null)

  return (
    <>
      <ReportsList onView={r => setViewReport(r)} />
      {viewReport && (
        <ViewReportDrawer report={viewReport} onClose={() => setViewReport(null)} />
      )}
    </>
  )
}
