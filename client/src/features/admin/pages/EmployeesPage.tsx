import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { initials } from '../../../lib/utils'
import type { ApiEmployee } from '../../../types'

interface Props {
  onNavigate: (page: string) => void
  initialSearch?: string
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function IcoChevDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function IcoFilter() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  )
}
function IcoDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function IcoPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function IcoChevLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
function IcoChevRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}
function IcoX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function IcoTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

const STATUSES    = ['All Status', 'Active', 'Inactive']
const PAGE_SIZE   = 10

// ── Add Employee Modal ────────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void
  onAdded: () => void
}

function AddEmployeeModal({ onClose, onAdded }: ModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
  
    if (!name.trim()) {
      showToast('Name is required', 'error')
      return
    }
  
    if (!email.trim()) {
      showToast('Email is required', 'error')
      return
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
    if (!emailRegex.test(email)) {
      showToast('Enter a valid email address', 'error')
      return
    }
  
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }
  
    setSubmitting(true)
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          employeeId: employeeId.trim() || `EMP${Date.now()}`,
          phone: phone.trim(),
          password,
          role: 'employee',
        }),
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
            <label className="emp-modal-label">Employee ID</label>
            <input className="emp-modal-input" type="text" placeholder="Employee ID" value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Phone</label>
            <input className="emp-modal-input" type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Password *</label>
            <input className="emp-modal-input" type="password" placeholder="Initial password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="emp-modal-footer">
            <button type="button" className="cnr-btn-back" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="cnr-btn-submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add Employee'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const columns = [
  'Employee ID',
  'Name',
  'Email',
  'Status',
  'Joined On',
  'Actions'
]

export default function EmployeesPage({ onNavigate, initialSearch = '' }: Props) {
  const [employees, setEmployees] = useState<ApiEmployee[]>([])
  const [search, setSearch] = useState(initialSearch)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteEmployeeName, setDeleteEmployeeName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

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
      console.error('Failed to fetch employees:', err)
      setError(err instanceof Error ? err.message : 'Failed to load employees')
      setEmployees([])
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const abortController = new AbortController()
    fetchEmployees(abortController.signal)
    return () => {
      abortController.abort()
    }
  }, [search, fetchEmployees])

  async function handleDelete(id: number | null) {
    if (!id) {
      showToast("Invalid employee ID", "error")
      return
    }

    setDeleting(true)

    try {
      await apiFetch(`/api/auth/employees/${id}`, {
        method: 'DELETE',
      })

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

  // Server already filters by search; only apply status filter client-side
  const filtered = employees.filter((e) => {
    return (
      statusFilter === 'All Status' ||
      (statusFilter === 'Active' && e.status === 'active') ||
      (statusFilter === 'Inactive' && e.status === 'inactive')
    )
  })

const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
const safePage = Math.min(page, totalPages)

const rows = filtered.slice(
  (safePage - 1) * PAGE_SIZE,
  safePage * PAGE_SIZE
)
  return (
    <main className="page-content">
      <div className="card emp-page-card">
        {/* ── Top bar ─────────────────────────────────────── */}
        <div className="emp-page-topbar">
          <div>
            <div className="emp-page-heading">Employee Management</div>
            <div className="emp-page-sub">Add, view, edit or remove employees from the system.</div>
          </div>
          <div className="emp-page-actions">
           
            <button className="cnr-btn-submit" type="button" onClick={() => setShowModal(true)}>
              <IcoPlus /> Add Employee
            </button>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────── */}
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
            <select
              className="emp-select"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            >
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

        {/* ── Table ───────────────────────────────────────── */}
        <div style={{ overflowX: 'auto' }}>
          <table className="reports-table emp-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                    No employees found.
                  </td>
                </tr>
              ) : rows.map(emp => (
                <tr key={emp.id.toString()}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{emp.employeeId}</td>
                  <td>
                    <div className="emp-cell">
                      <div className="emp-avatar">
                        {initials(emp.name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                  <td>
                    <span className={`status-badge ${emp.status === 'active' ? 'active' : 'inactive'}`}>
                      {emp.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(emp.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="action-btn emp-delete-btn"
                      type="button"
                      aria-label={`Delete ${emp.name}`}
                      onClick={() => {
                        setDeleteId(emp.id)
                        setDeleteEmployeeName(emp.name)
                      }}
                    >
                      <IcoTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────── */}
        <div className="table-footer">
          <span className="table-count">
            Showing {rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} employees
          </span>
          <div className="pagination">
            <button className="page-btn" type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Previous">
              <IcoChevLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn${safePage === p ? ' active' : ''}`} type="button" onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button className="page-btn" type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Next">
              <IcoChevRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── Back button ─────────────────────────────────── */}
      <div style={{ display: 'flex' }}>
        <button className="cnr-btn-back" type="button" onClick={() => onNavigate('dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* ── Modal ───────────────────────────────────────── */}
      {showModal && (
        <AddEmployeeModal
          onClose={() => setShowModal(false)}
          onAdded={fetchEmployees}
        />
      )}

      {/* ── Delete confirmation ──────────────────────────── */}
      {deleteId !== null && (
        <div className="emp-modal-overlay" onClick={() => { setDeleteId(null); setDeleteEmployeeName(''); }}>
          <div className="emp-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="emp-modal-header">
              <span className="emp-modal-title">Remove Employee</span>
              <button type="button" className="emp-modal-close" onClick={() => { setDeleteId(null); setDeleteEmployeeName(''); }}><IcoX /></button>
            </div>
            <div className="emp-modal-body">
              <p style={{ margin: '0 0 20px', color: 'var(--text-primary)' }}>
                Are you sure you want to remove <strong>{deleteEmployeeName}</strong>? This will also permanently delete all their submitted reports. This action cannot be undone.
              </p>
              <div className="emp-modal-footer">
                <button
                  type="button"
                  className="cnr-btn-back"
                  onClick={() => { setDeleteId(null); setDeleteEmployeeName(''); }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="cnr-btn-submit"
                  style={{ background: '#ef4444' }}
                  onClick={() => handleDelete(deleteId)}
                  disabled={deleting}
                >
                  {deleting ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
