import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from '../../../lib/api'
import { downloadWithToken } from '../../../lib/download'
import { showToast } from '../../../lib/feedback'
import { formatMmyyyy, initials } from '../../../lib/utils'
import type { ApiEmployee } from '../../../types'

interface Props {
  onNavigate: (page: string) => void
  initialSearch?: string
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoSearch() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IcoChevDown() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
}
function IcoFilter() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
}
function IcoDownload() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
function IcoPlus() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function IcoChevLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function IcoChevRight() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}
function IcoX() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function IcoTrash() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}
function IcoEye({ show }: { show: boolean }) {
  return show
    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
function IcoViewReports() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
function IcoPencil() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}

const STATUSES  = ['All Status', 'Active', 'Inactive']
const PAGE_SIZE = 10

const STATUS_BADGE: Record<string, string> = {
  Submitted: 'rp-badge-submitted',
  Reviewed:  'rp-badge-reviewed',
  Pending:   'rp-badge-pending',
}

// ── Password field with eye toggle ────────────────────────────────────────────
function PasswordField({
  value,
  onChange,
  placeholder = 'Enter password',
  label,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  label: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="emp-modal-field">
      <label className="emp-modal-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="emp-modal-input"
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ paddingRight: 38 }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 2,
          }}
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <IcoEye show={show} />
        </button>
      </div>
    </div>
  )
}

// ── Add Employee Modal ────────────────────────────────────────────────────────
function AddEmployeeModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim())  { showToast('Name is required', 'error'); return }
    if (!email.trim()) { showToast('Email is required', 'error'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Enter a valid email address', 'error'); return }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      showToast('Password must be at least 8 characters with uppercase, lowercase and a number', 'error')
      return
    }
    setSubmitting(true)
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, role: 'employee' }),
      })
      showToast('Employee registered successfully', 'success')
      onAdded()
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Registration failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="emp-modal-overlay" onClick={onClose}>
      <div className="emp-modal" onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header">
          <span className="emp-modal-title">Add New Employee</span>
          <button type="button" className="emp-modal-close" onClick={onClose}><IcoX /></button>
        </div>
        <form className="emp-modal-body" onSubmit={handleSubmit}>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Full Name *</label>
            <input className="emp-modal-input" type="text" placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Email Address *</label>
            <input className="emp-modal-input" type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Phone</label>
            <input className="emp-modal-input" type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <PasswordField label="Password *" value={password} onChange={setPassword} placeholder="Initial password" />
          <div className="emp-modal-footer">
            <button type="button" className="cnr-btn-back" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="cnr-btn-submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add Employee'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit Employee Modal ───────────────────────────────────────────────────────
function EditEmployeeModal({
  employee,
  onClose,
  onUpdated,
}: {
  employee: ApiEmployee
  onClose: () => void
  onUpdated: (updated: Partial<ApiEmployee>) => void
}) {
  const [name,     setName]     = useState(employee.name)
  const [email,    setEmail]    = useState(employee.email)
  const [phone,    setPhone]    = useState(employee.phone ?? '')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim())  { showToast('Name is required', 'error'); return }
    if (!email.trim()) { showToast('Email is required', 'error'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Enter a valid email address', 'error'); return }
    if (password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      showToast('Password must be at least 8 characters with uppercase, lowercase and a number', 'error')
      return
    }
    setSubmitting(true)
    try {
      const body: Record<string, string> = { name: name.trim(), email: email.trim(), phone: phone.trim() }
      if (password) body.password = password
      await apiFetch(`/api/auth/employees/${employee.id}`, { method: 'PUT', body: JSON.stringify(body) })
      onUpdated({ name: name.trim(), email: email.trim(), phone: phone.trim() || null })
      showToast('Employee updated successfully', 'success')
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update employee', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="emp-modal-overlay" onClick={onClose}>
      <div className="emp-modal" onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header">
          <div>
            <span className="emp-modal-title">Edit Employee</span>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {employee.employeeId} · {employee.name}
            </div>
          </div>
          <button type="button" className="emp-modal-close" onClick={onClose}><IcoX /></button>
        </div>
        <form className="emp-modal-body" onSubmit={handleSubmit}>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Full Name *</label>
            <input className="emp-modal-input" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Email Address *</label>
            <input className="emp-modal-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Phone</label>
            <input className="emp-modal-input" type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <PasswordField
            label="New Password (leave blank to keep current)"
            value={password}
            onChange={setPassword}
            placeholder="Leave blank to keep unchanged"
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -8, paddingLeft: 2 }}>
            Only fill in if you want to reset this employee's password.
          </div>
          <div className="emp-modal-footer">
            <button type="button" className="cnr-btn-back" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="cnr-btn-submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Employee Reports Drawer ───────────────────────────────────────────────────

interface EmpReport {
  id: number
  mmyyyy: string
  createdAt: string
  reportStatus: { statusName: string }
}

interface EmpReportsData {
  employee: { id: number; name: string; employeeId: string; email: string }
  reports: EmpReport[]
}

function EmpDownloadDropdown({ reportId }: { reportId: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    if (open) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  async function dl(format: 'pdf' | 'xlsx') {
    setOpen(false)
    try {
      await downloadWithToken(`/api/admin/reports/${reportId}/download?format=${format}`, `report-${reportId}.${format}`)
      showToast('Downloaded', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Download failed', 'error')
    }
  }

  return (
    <div style={{ position: 'relative', marginLeft: 'auto', flexShrink: 0 }} ref={ref}>
      <button
        className={`action-btn rp-action-btn${open ? ' active' : ''}`}
        type="button"
        title="Download"
        onClick={() => setOpen(o => !o)}
        style={{ padding: '5px 8px' }}
      >
        <IcoDownload />
      </button>
      {open && (
        <div className="rp-dl-dropdown">
          <button type="button" onClick={() => dl('pdf')}><span style={{ fontSize: 14 }}>📄</span> PDF</button>
          <button type="button" onClick={() => dl('xlsx')}><span style={{ fontSize: 14 }}>📊</span> Excel</button>
        </div>
      )}
    </div>
  )
}

function EmployeeReportsDrawer({ employeeId, onClose }: { employeeId: number; onClose: () => void }) {
  const [data, setData] = useState<EmpReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    apiFetch<EmpReportsData>(`/api/admin/employees/${employeeId}/reports`)
      .then(d => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch(err => { if (!cancelled) { setError(err instanceof Error ? err.message : 'Failed to load'); setLoading(false) } })
    return () => { cancelled = true }
  }, [employeeId])

  const emp = data?.employee
  const reports = data?.reports ?? []
  const reviewedCount = reports.filter(r => r.reportStatus?.statusName === 'Reviewed').length
  const latestMonth = reports[0]?.mmyyyy ?? null

  return (
    <>
      <div className="emp-rd-backdrop" onClick={onClose} />
      <div className="emp-rd-drawer">
        <div className="emp-rd-header">
          <div className="emp-rd-avatar">{initials(emp?.name ?? '')}</div>
          <div className="emp-rd-info">
            <div className="emp-rd-name">{loading ? 'Loading…' : emp?.name}</div>
            <div className="emp-rd-sub">
              {emp?.employeeId && <span>{emp.employeeId}</span>}
              {emp?.email && <span style={{ marginLeft: 6 }}>· {emp.email}</span>}
            </div>
          </div>
          <button className="emp-rd-close" type="button" onClick={onClose}><IcoX /></button>
        </div>

        {!loading && !error && (
          <div className="emp-rd-stats">
            <div className="emp-rd-stat">
              <div className="emp-rd-stat-val">{reports.length}</div>
              <div className="emp-rd-stat-lbl">Total Reports</div>
            </div>
            <div className="emp-rd-stat">
              <div className="emp-rd-stat-val">{reviewedCount}</div>
              <div className="emp-rd-stat-lbl">Reviewed</div>
            </div>
            <div className="emp-rd-stat">
              <div className="emp-rd-stat-val">{latestMonth ? formatMmyyyy(latestMonth) : '—'}</div>
              <div className="emp-rd-stat-lbl">Latest</div>
            </div>
          </div>
        )}

        <div className="emp-rd-body">
          {loading && <p style={{ padding: '20px 24px', color: 'var(--text-muted)' }}>Loading reports…</p>}
          {error && <p style={{ padding: '20px 24px', color: '#ef4444' }}>{error}</p>}
          {!loading && !error && reports.length === 0 && (
            <div className="emp-rd-empty">
              <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>📄</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No reports yet</div>
              <div style={{ fontSize: 13 }}>This employee hasn&apos;t submitted any reports.</div>
            </div>
          )}
          {!loading && !error && reports.map(r => {
            const statusName = r.reportStatus?.statusName ?? ''
            return (
              <div key={r.id} className="emp-rd-report-row">
                <div>
                  <div className="emp-rd-month">{formatMmyyyy(r.mmyyyy)}</div>
                  <div className="emp-rd-date">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
                <span className={`status-badge rp-badge ${STATUS_BADGE[statusName] ?? ''}`} style={{ fontSize: 11 }}>
                  {statusName}
                </span>
                <EmpDownloadDropdown reportId={r.id} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const columns = ['Employee ID', 'Name', 'Email', 'Status', 'Joined On', 'Actions']

export default function EmployeesPage({ onNavigate, initialSearch = '' }: Props) {
  const [employees, setEmployees] = useState<ApiEmployee[]>([])
  const [search, setSearch] = useState(initialSearch)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editEmployee, setEditEmployee] = useState<ApiEmployee | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteEmployeeName, setDeleteEmployeeName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [viewEmployeeId, setViewEmployeeId] = useState<number | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  useEffect(() => { setSearch(initialSearch) }, [initialSearch])

  const fetchEmployees = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<ApiEmployee[]>(`/api/auth/employees?search=${encodeURIComponent(search)}`, { signal })
      if (!mountedRef.current) return
      setEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (!mountedRef.current) return
      setError(err instanceof Error ? err.message : 'Failed to load employees')
      setEmployees([])
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const ctrl = new AbortController()
    fetchEmployees(ctrl.signal)
    return () => ctrl.abort()
  }, [fetchEmployees])

  async function handleDelete(id: number | null) {
    if (!id) { showToast('Invalid employee ID', 'error'); return }
    setDeleting(true)
    try {
      await apiFetch(`/api/auth/employees/${id}`, { method: 'DELETE' })
      showToast('Employee removed', 'success')
      setDeleteId(null)
      setDeleteEmployeeName('')
      fetchEmployees()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete employee', 'error')
    } finally {
      setDeleting(false)
    }
  }

  function handleUpdated(id: number, patch: Partial<ApiEmployee>) {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }

  const filtered = employees.filter(e =>
    statusFilter === 'All Status' ||
    (statusFilter === 'Active' && e.status === 'active') ||
    (statusFilter === 'Inactive' && e.status === 'inactive')
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <main className="page-content">
      <div className="card emp-page-card">

        {/* Top bar */}
        <div className="emp-page-topbar">
          <div>
            <div className="emp-page-heading">Employee Management</div>
            <div className="emp-page-sub">Click on any employee name or the eye icon to view their reports.</div>
          </div>
          <div className="emp-page-actions">
            <button className="cnr-btn-submit" type="button" onClick={() => setShowAddModal(true)}>
              <IcoPlus /> Add Employee
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="emp-filters">
          <div className="emp-search-wrap">
            <IcoSearch />
            <input
              className="emp-search-input"
              type="text"
              placeholder="Search by name, email or ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="emp-select-wrap">
            <select className="emp-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <IcoChevDown />
          </div>
          <button className="emp-filter-btn" type="button">
            <IcoFilter /> Filters
          </button>
        </div>

        {loading && <p style={{ padding: 16, color: 'var(--text-muted)' }}>Loading employees…</p>}
        {error && !loading && <p style={{ padding: 16, color: '#ef4444' }}>{error}</p>}

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="reports-table emp-table">
            <thead>
              <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                    No employees found.
                  </td>
                </tr>
              ) : rows.map(emp => (
                <tr key={emp.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{emp.employeeId}</td>
                  <td>
                    <div className="emp-cell" style={{ cursor: 'pointer' }} onClick={() => setViewEmployeeId(emp.id)} title="View reports">
                      <div className="emp-avatar">{initials(emp.name)}</div>
                      <span style={{ fontWeight: 500, color: 'var(--primary)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                        {emp.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                  <td>
                    <span className={`status-badge ${emp.status === 'active' ? 'active' : 'inactive'}`}>
                      {emp.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(emp.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button className="action-btn emp-edit-btn" type="button" title="View reports" onClick={() => setViewEmployeeId(emp.id)}>
                        <IcoViewReports />
                      </button>
                      <button className="action-btn emp-edit-btn" type="button" title="Edit employee" onClick={() => setEditEmployee(emp)}>
                        <IcoPencil />
                      </button>
                      <button
                        className="action-btn emp-delete-btn"
                        type="button"
                        title="Delete employee"
                        onClick={() => { setDeleteId(emp.id); setDeleteEmployeeName(emp.name) }}
                      >
                        <IcoTrash />
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
            Showing {rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} employees
          </span>
          <div className="pagination">
            <button className="page-btn" type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}><IcoChevLeft /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn${safePage === p ? ' active' : ''}`} type="button" onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}><IcoChevRight /></button>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div style={{ display: 'flex', marginTop: 12 }}>
        <button className="cnr-btn-back" type="button" onClick={() => onNavigate('dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Add modal */}
      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} onAdded={fetchEmployees} />}

      {/* Edit modal */}
      {editEmployee && (
        <EditEmployeeModal
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onUpdated={patch => handleUpdated(editEmployee.id, patch)}
        />
      )}

      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="emp-modal-overlay" onClick={() => { setDeleteId(null); setDeleteEmployeeName('') }}>
          <div className="emp-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="emp-modal-header">
              <span className="emp-modal-title">Remove Employee</span>
              <button type="button" className="emp-modal-close" onClick={() => { setDeleteId(null); setDeleteEmployeeName('') }}><IcoX /></button>
            </div>
            <div className="emp-modal-body">
              <p style={{ margin: '0 0 20px', color: 'var(--text-primary)' }}>
                Are you sure you want to remove <strong>{deleteEmployeeName}</strong>? This will also permanently delete all their submitted reports. This action cannot be undone.
              </p>
              <div className="emp-modal-footer">
                <button type="button" className="cnr-btn-back" onClick={() => { setDeleteId(null); setDeleteEmployeeName('') }} disabled={deleting}>Cancel</button>
                <button type="button" className="cnr-btn-submit" style={{ background: '#ef4444' }} onClick={() => handleDelete(deleteId)} disabled={deleting}>
                  {deleting ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee reports drawer */}
      {viewEmployeeId !== null && (
        <EmployeeReportsDrawer employeeId={viewEmployeeId} onClose={() => setViewEmployeeId(null)} />
      )}
    </main>
  )
}
