import { useState,useEffect } from 'react'
import { employeeStore } from '../../../store/employeeStore'
import type { Employee } from '../../../store/employeeStore'

interface Props {
  onNavigate: (page: string) => void
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
function IcoEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}
function IcoTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 1)
}

const DEPARTMENTS = ['All Departments', 'Sales', 'Marketing', 'Operations', 'Finance', 'Logistics', 'HR', 'IT']
const STATUSES    = ['All Status', 'Active', 'Inactive']
const PAGE_SIZE   = 10

// ── Add Employee Modal ────────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void
  onAdd: (emp: Employee) => void
  existingCount: number
}

function AddEmployeeModal({ onClose, onAdd, existingCount }: ModalProps) {
  const [name,   setName]   = useState('')
  const [email,  setEmail]  = useState('')
  const [dept,   setDept]   = useState('Sales')
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    const newId = `EMP${String(existingCount + 1).padStart(3, '0')}`
    const today = new Date()
    const joined = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')
    onAdd({ id: newId, name: name.trim(), email: email.trim(), department: dept, status, joinedOn: joined })
    onClose()
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
            <label className="emp-modal-label">Department</label>
            <select className="emp-modal-input" value={dept} onChange={e => setDept(e.target.value)}>
              {DEPARTMENTS.slice(1).map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Status</label>
            <select className="emp-modal-input" value={status} onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="emp-modal-footer">
            <button type="button" className="cnr-btn-back" onClick={onClose}>Cancel</button>
            <button type="submit" className="cnr-btn-submit">Add Employee</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EmployeesPage({ onNavigate }: Props) {
  const [employees, setEmployees] = useState<any[]>([])
  const [search,    setSearch]    = useState('')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {

  async function fetchEmployees() {

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/employees`,
          {
            headers: {
              Authorization:
                token || "",
            },
          }
        );

      const data =
        await response.json();

      setEmployees(data);

    } catch (error) {

      console.log(error);

    }
  }

  fetchEmployees();

}, []);

  // Sync additions back to the shared store so KpiCards picks them up
  function handleAdd(emp: Employee) {
    employeeStore.push(emp)
    setEmployees([...employeeStore])
  }

  function handleDelete(id: string) {
    const idx = employeeStore.findIndex(e => e.id === id)
    if (idx !== -1) employeeStore.splice(idx, 1)
    setEmployees([...employeeStore])
  }

  // Filter
  const filtered = employees.filter(e => {
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
    const matchDept   = deptFilter   === 'All Departments' || e.department === deptFilter
    const matchStatus = statusFilter === 'All Status'      || e.status     === statusFilter
    return matchSearch && matchDept && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const rows       = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

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
            <button className="cnr-btn-back emp-export-btn" type="button">
              <IcoDownload /> Export
            </button>
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
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1) }}
            >
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <IcoChevDown />
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
              
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                    No employees found.
                  </td>
                </tr>
              ) : rows.map(emp => (
                <tr key={emp.employeeId}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{emp.employeeId}</td>
                  <td>
                    <div className="emp-cell">
                      <div className="emp-avatar" style={{ background: '#e0e7ff', color: '#6366f1' }}>
                        {initials(emp.name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                 
                  <td>
                    <span className={`status-badge ${emp.status === 'Active' ? 'submitted' : 'draft'}`}>
                      Active
                    </span>
                  </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(emp.createdAt)
                        .toLocaleDateString()}
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
          onAdd={handleAdd}
          existingCount={employees.length}
        />
      )}
    </main>
  )
}
