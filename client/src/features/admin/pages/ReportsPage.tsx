import { useState, useRef, useEffect, useCallback } from 'react'
import { apiFetch } from '../../../lib/api'
import { downloadWithToken } from '../../../lib/download'
import { showToast } from '../../../lib/feedback'
import { formatMmyyyy, initials } from '../../../lib/utils'
import type { Report } from '../../../types'
import {
  IconSearch,
  IconCalendar,
  IconDownload,
  IconEye,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconX,
  IconArrowLeft
} from '../../shared/icons'

type ReportStatus = "Submitted" | "Pending" | "Reviewed" | "Rejected" | "Draft"

const STATUS_STYLES: Record<string, string> = {
  Submitted: 'rp-badge-submitted',
  Pending:   'rp-badge-pending',
  Reviewed:  'rp-badge-reviewed',
  Rejected:  'rp-badge-rejected',
  Draft:     'rp-badge-draft',
}

const STATUSES: Array<ReportStatus | 'All Status'> = ['All Status', 'Submitted', 'Pending', 'Reviewed', 'Rejected', 'Draft']
const PAGE_SIZE = 8
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

function currentMmyyyy(): string {
  const now = new Date()
  return String(now.getMonth() + 1).padStart(2, '0') + String(now.getFullYear())
}

function generateMonthOptions(): { label: string; value: string }[] {
  const now = new Date()
  const opts = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = String(d.getFullYear())
    opts.push({
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: mm + yyyy,
    })
  }
  return opts
}

// ── Mini calendar ─────────────────────────────────────────────────────────────
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
        <button type="button" className="rp-cal-nav" onClick={prevMonth}><IconChevronLeft /></button>
        <span className="rp-cal-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" className="rp-cal-nav" onClick={nextMonth}><IconChevronRight /></button>
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

// ── Date picker ───────────────────────────────────────────────────────────────
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
        <span className="rp-datepicker-icon"><IconCalendar /></span>
        <span className={display ? 'rp-datepicker-val' : 'rp-datepicker-placeholder'}>{display || placeholder}</span>
        {value && <button type="button" className="rp-datepicker-clear" onClick={e => { e.stopPropagation(); onChange('') }}><IconX /></button>}
      </div>
      {open && <MiniCalendar value={value} onChange={onChange} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ── Download Dropdown ─────────────────────────────────────────────────────────
function DownloadDropdown({ reportId }: { reportId: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    if (open) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const dl = useCallback(async (format: 'pdf' | 'xlsx') => {
    setOpen(false)
    try {
      await downloadWithToken(`/api/admin/reports/${reportId}/download?format=${format}`, `report-${reportId}.${format}`)
      showToast('Downloaded', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Download failed', 'error')
    }
  }, [reportId])

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className={`action-btn rp-action-btn${open ? ' active' : ''}`}
        type="button"
        title="Download"
        onClick={() => setOpen(o => !o)}
      >
        <IconDownload />
      </button>
      {open && (
        <div className="rp-dl-dropdown">
          <button type="button" onClick={() => dl('pdf')}>
            <span style={{ fontSize: 14 }}>📄</span> PDF
          </button>
          <button type="button" onClick={() => dl('xlsx')}>
            <span style={{ fontSize: 14 }}>📊</span> Excel
          </button>
        </div>
      )}
    </div>
  )
}

// ── View Report Drawer ────────────────────────────────────────────────────────
function ViewReportDrawer({
  report,
  onClose,
  onStatusChange,
}: {
  report: Report
  onClose: () => void
  onStatusChange: (id: number, newStatus: string) => void
}) {
  const MAX = 1000
  const [currentStatus, setCurrentStatus] = useState(report.reportStatus?.statusName ?? '')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleMarkReviewed() {
    setUpdatingStatus(true)
    try {
      await apiFetch(`/api/reports/reviewed/${report.id}`, { method: 'PUT' })
      setCurrentStatus('Reviewed')
      onStatusChange(report.id, 'Reviewed')
      showToast('Report marked as Reviewed', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleMarkPending() {
    setUpdatingStatus(true)
    try {
      await apiFetch(`/api/reports/pending/${report.id}`, { method: 'PUT' })
      setCurrentStatus('Pending')
      onStatusChange(report.id, 'Pending')
      showToast('Report marked as Pending', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleDownload(format: 'pdf' | 'xlsx') {
    try {
      await downloadWithToken(
        `/api/admin/reports/${report.id}/download?format=${format}`,
        `report-${report.id}.${format}`
      )
      showToast('Report downloaded successfully', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to download report', 'error')
    }
  }

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

  function ReadonlyTextarea({ label, value }: { label?: string; value?: string | null }) {
    return (
      <div className="vr-textarea-section">
        {label && <div className="vr-textarea-label">{label}</div>}
        <div className="vr-textarea-wrap">
          <textarea className="vr-textarea" readOnly value={value ?? ''} />
          <div className="vr-char-count">{(value ?? '').length} / {MAX}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="vr-backdrop" onClick={onClose} />
      <div className="vr-drawer">

        <div className="vr-drawer-header">
          <div className="vr-drawer-title-wrap">
            <h2 className="vr-drawer-title">Monthly Overview – Indithrive Infratech Pvt LTD</h2>
            <span className={`status-badge rp-badge ${STATUS_STYLES[currentStatus] ?? ''}`}>
              {currentStatus}
            </span>
          </div>
          <button className="vr-drawer-close" type="button" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        <div className="vr-drawer-body">

          <div className="vr-drawer-section">
            <div className="vr-header-fields-2col">
              <ReadonlyField label="MMYYYY *"        value={report.mmyyyy} />
              <ReadonlyField label="Business Owner *" value={report.businessOwner} />
              <ReadonlyField label="Prepared by: *"   value={report.preparedBy} />
              <ReadonlyField label="Reviewed by: *"   value={report.reviewedBy} />
            </div>
          </div>

          <div className="vr-drawer-section">
            <div className="vr-section-header">
              <SectionBadge num={1} />
            </div>
            <div className="vr-section-body">
              <ReadonlyNumber label="No of Customer Registration :" value={report.customersRegistered} required />
              <ReadonlyNumber label="No of Supplier Registration :" value={report.suppliersRegistered} required />
              <ReadonlyNumber label="Name of Products /Brand added :" value={report.newBrandProducts} required />
              <ReadonlyNumber label="New Success Stories :" value={report.successStories} />
              <ReadonlyNumber label="No of Visits to new site :" value={report.websiteVisitors} />
            </div>
          </div>

          <div className="vr-drawer-section">
            <div className="vr-section-header">
              <SectionBadge num={2} />
              <span className="vr-section-title">Customer/Supplier/logistics/Finance Challenges</span>
            </div>
            <div className="vr-section-body">
              <ReadonlyTextarea value={report.challenges} />
            </div>
          </div>

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

        <div className="vr-drawer-footer">
          <button className="cnr-btn-back" type="button" onClick={onClose}>
            <IconArrowLeft /> Close
          </button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {currentStatus !== 'Pending' && (
              <button
                className="vr-status-btn vr-status-btn-pending"
                type="button"
                disabled={updatingStatus}
                onClick={handleMarkPending}
              >
                Mark Pending
              </button>
            )}
            {currentStatus !== 'Reviewed' && (
              <button
                className="vr-status-btn vr-status-btn-reviewed"
                type="button"
                disabled={updatingStatus}
                onClick={handleMarkReviewed}
              >
                Mark Reviewed
              </button>
            )}
            <button
              className="rp-export-btn-pdf"
              type="button"
              onClick={() => handleDownload('pdf')}
            >
              <IconDownload /> PDF
            </button>
            <button
              className="rp-export-btn-xlsx"
              type="button"
              onClick={() => handleDownload('xlsx')}
            >
              <IconDownload /> Excel
            </button>
          </div>
        </div>

      </div>
    </>
  )
}

interface ReportsResponse {
  reports: Report[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// ── Reports list ──────────────────────────────────────────────────────────────
function ReportsListContent({ onView, refreshTick }: { onView: (r: Report) => void; refreshTick: number }) {
  const [search,       setSearch]       = useState('')
  const [startDate,    setStartDate]    = useState('')
  const [endDate,      setEndDate]      = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'All Status'>('All Status')
  const [page,         setPage]         = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)
  const [totalReports, setTotalReports] = useState(0)
  const [reports,      setReports]      = useState<Report[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchReports() {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch<ReportsResponse>(
          `/api/admin/reports?page=${page}&pageSize=${PAGE_SIZE}`
        )
        if (!cancelled) {
          setReports(data.reports || [])
          setTotalPages(data.totalPages || 1)
          setTotalReports(data.total || 0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load reports')
          setReports([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReports()
    return () => { cancelled = true }
  }, [page, refreshTick])

  const filtered = reports.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (r.user?.name?.toLowerCase().includes(q) ?? false) ||
      (r.user?.employeeId?.toLowerCase().includes(q) ?? false)
    const matchStatus =
      statusFilter === 'All Status' ||
      r.reportStatus?.statusName === statusFilter
    let matchDate = true
    if (startDate || endDate) {
      const rDate = new Date(r.createdAt)
      if (startDate && rDate < new Date(startDate)) matchDate = false
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (rDate > end) matchDate = false
      }
    }
    return matchSearch && matchStatus && matchDate
  })

  const safePage = Math.min(page, totalPages)
  const rows = filtered

  function pageNumbers(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const nums: (number | '...')[] = [1]
    if (safePage > 3) nums.push('...')
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) nums.push(i)
    if (safePage < totalPages - 2) nums.push('...')
    nums.push(totalPages)
    return nums
  }

  async function exportAll(format: 'pdf' | 'xlsx') {
    try {
      await downloadWithToken(
        `/api/admin/reports/download/all?format=${format}`,
        `all-reports.${format}`
      )
      showToast('Reports exported successfully', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to export reports', 'error')
    }
  }

  return (
    <div className="card rp-card">
      <div className="rp-topbar">
        <div className="emp-page-heading">Reports</div>
        <div className="rp-export-group">
          <button type="button" className="rp-export-btn-pdf" onClick={() => exportAll('pdf')}>
            <IconDownload /> Export PDF
          </button>
          <button type="button" className="rp-export-btn-xlsx" onClick={() => exportAll('xlsx')}>
            <IconDownload /> Export Excel
          </button>
        </div>
      </div>

      <div className="rp-filters">
        <div className="emp-search-wrap rp-search">
          <IconSearch />
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
          <IconChevronDown />
        </div>
      </div>

      {loading && <p style={{ padding: 16, color: 'var(--text-muted)' }}>Loading reports…</p>}
      {error && !loading && <p style={{ padding: 16, color: '#ef4444' }}>{error}</p>}

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
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                  No reports found.
                </td>
              </tr>
            ) : rows.map(r => (
              <tr key={r.id}>
                <td>
                  <div className="emp-cell">
                    <div className="emp-avatar rp-avatar">{initials(r.user?.name || "")}</div>
                    <div>
                      <div className="rp-emp-name">{r.user?.name}</div>
                      <div className="rp-emp-id">{r.user?.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatMmyyyy(r.mmyyyy)}</td>
                <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <span className={`status-badge rp-badge ${STATUS_STYLES[r.reportStatus?.statusName ?? ''] ?? ''}`}>
                    {r.reportStatus?.statusName}
                  </span>
                </td>
                <td>
                  <div className="rp-actions">
                    <button className="action-btn rp-action-btn" type="button" title="View report" onClick={() => onView(r)}>
                      <IconEye />
                    </button>
                    <DownloadDropdown reportId={r.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="table-count">
          Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {totalReports} reports
        </span>
        <div className="pagination">
          <button className="page-btn" type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
            <IconChevronLeft />
          </button>
          {pageNumbers().map((p, i) =>
            p === '...'
              ? <span key={`e${i}`} className="rp-ellipsis">...</span>
              : <button key={p} className={`page-btn${safePage === p ? ' active' : ''}`} type="button" onClick={() => setPage(p as number)}>{p}</button>
          )}
          <button className="page-btn" type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Not Submitted Tab ─────────────────────────────────────────────────────────
interface NotSubmittedEmployee {
  id: number
  name: string
  employeeId: string
  email: string
}

function NotSubmittedTab() {
  const monthOptions = generateMonthOptions()
  const [selectedMonth, setSelectedMonth] = useState(currentMmyyyy())
  const [employees, setEmployees] = useState<NotSubmittedEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remindingId, setRemindingId] = useState<number | null>(null)
  const [remindingAll, setRemindingAll] = useState(false)
  const [remindedIds, setRemindedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setRemindedIds(new Set())
    apiFetch<{ notSubmitted: NotSubmittedEmployee[]; total: number }>(
      `/api/admin/reports/not-submitted?month=${selectedMonth}`
    )
      .then(d => { if (!cancelled) setEmployees(d.notSubmitted) })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedMonth])

  async function sendReminder(employeeId: number, name: string) {
    setRemindingId(employeeId)
    try {
      await apiFetch('/api/admin/reports/remind', {
        method: 'POST',
        body: JSON.stringify({ userId: employeeId, month: selectedMonth }),
      })
      setRemindedIds(prev => new Set([...prev, employeeId]))
      showToast(`Reminder sent to ${name}`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send reminder', 'error')
    } finally {
      setRemindingId(null)
    }
  }

  async function sendReminderAll() {
    if (employees.length === 0) return
    setRemindingAll(true)
    let sent = 0
    for (const e of employees) {
      try {
        await apiFetch('/api/admin/reports/remind', {
          method: 'POST',
          body: JSON.stringify({ userId: e.id, month: selectedMonth }),
        })
        setRemindedIds(prev => new Set([...prev, e.id]))
        sent++
      } catch {
        // continue with others
      }
    }
    setRemindingAll(false)
    showToast(`Reminders sent to ${sent} employee${sent !== 1 ? 's' : ''}`, 'success')
  }

  const displayMonth = monthOptions.find(m => m.value === selectedMonth)?.label ?? selectedMonth

  return (
    <div className="card rp-card">
      <div className="rp-ns-toolbar">
        <div className="emp-page-heading" style={{ marginBottom: 0 }}>Not Submitted</div>
        <select
          className="rp-ns-month-select"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {monthOptions.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        {!loading && employees.length > 0 && (
          <button
            className="rp-remind-all-btn"
            type="button"
            disabled={remindingAll}
            onClick={sendReminderAll}
          >
            {remindingAll ? 'Sending…' : `Remind All (${employees.length})`}
          </button>
        )}
        {!loading && (
          <span className="rp-ns-count">
            {employees.length} employee{employees.length !== 1 ? 's' : ''} haven&apos;t submitted for {displayMonth}
          </span>
        )}
      </div>

      {loading && <p style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>Loading…</p>}
      {error && !loading && <p style={{ padding: '16px 20px', color: '#ef4444' }}>{error}</p>}

      {!loading && !error && (
        employees.length === 0 ? (
          <div className="rp-ns-empty">
            <span style={{ fontSize: 32, display: 'block', marginBottom: 10, opacity: 0.4 }}>✅</span>
            All employees have submitted their reports for {displayMonth}.
          </div>
        ) : (
          <div className="rp-ns-list">
            {employees.map(e => {
              const reminded = remindedIds.has(e.id)
              return (
                <div key={e.id} className="rp-ns-row">
                  <div className="rp-ns-avatar">{initials(e.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="rp-ns-name">{e.name}</div>
                    <div className="rp-ns-sub">{e.employeeId} · {e.email}</div>
                  </div>
                  <button
                    className={`rp-remind-btn${reminded ? ' reminded' : ''}`}
                    type="button"
                    disabled={remindingId === e.id || remindingAll}
                    onClick={() => sendReminder(e.id, e.name)}
                  >
                    {remindingId === e.id ? 'Sending…' : reminded ? '✓ Reminded' : 'Send Reminder'}
                  </button>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
interface ReportsPageProps {
  onNavigate?: (page: string) => void
  initialTab?: 'reports' | 'not-submitted'
}

export default function ReportsPage({ onNavigate: _onNavigate, initialTab = 'reports' }: ReportsPageProps) {
  const [viewReport, setViewReport] = useState<Report | null>(null)
  const [tab, setTab] = useState<'reports' | 'not-submitted'>(initialTab)
  const [refreshTick, setRefreshTick] = useState(0)

  function handleStatusChange(id: number, newStatus: string) {
    setViewReport(prev => {
      if (!prev || prev.id !== id) return prev
      return { ...prev, reportStatus: { ...(prev.reportStatus ?? {}), statusName: newStatus } }
    })
    setRefreshTick(t => t + 1)
  }

  return (
    <main className="page-content">
      <div className="rp-page-tabs">
        <button
          className={`rp-page-tab${tab === 'reports' ? ' active' : ''}`}
          type="button"
          onClick={() => setTab('reports')}
        >
          Reports
        </button>
        <button
          className={`rp-page-tab${tab === 'not-submitted' ? ' active' : ''}`}
          type="button"
          onClick={() => setTab('not-submitted')}
        >
          Not Submitted
        </button>
      </div>

      {tab === 'reports' && (
        <ReportsListContent onView={r => setViewReport(r)} refreshTick={refreshTick} />
      )}
      {tab === 'not-submitted' && <NotSubmittedTab />}

      {viewReport && (
        <ViewReportDrawer
          report={viewReport}
          onClose={() => setViewReport(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </main>
  )
}
