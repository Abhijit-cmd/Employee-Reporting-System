import { useState, useEffect, useRef } from 'react'
import { Toggle, ThemeToggle } from '../../shared/settingsComponents'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { loadSettings, saveSettings } from '../../../lib/settingsStorage'
import LogoutButton from '../../shared/LogoutButton'
import { initials } from '../../../lib/utils'
import { getStoredUser, isLeadership } from '../../../lib/auth'
import type { ApiEmployee, Department } from '../../../types'

interface Props { onBack: () => void }

function IcoArrowLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}
function IcoSave() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
}
function IcoPlus() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function IcoX() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function IcoPencil() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function IcoEye({ show }: { show: boolean }) {
  return show
    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}

function PasswordField({ value, onChange, placeholder = 'Enter password', label }: { value: string; onChange: (v: string) => void; placeholder?: string; label: string }) {
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
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 2 }}
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <IcoEye show={show} />
        </button>
      </div>
    </div>
  )
}

function ModalSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  return (
    <div className="emp-modal-field">
      <label className="emp-modal-label">{label}</label>
      <div className="emp-select-wrap" style={{ position: 'relative' }}>
        <select
          className="emp-modal-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}

function AddManagerModal({
  onClose,
  onAdded,
  departments,
  leadership,
}: {
  onClose: () => void
  onAdded: () => void
  departments: Department[]
  leadership: ApiEmployee[]
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [designation, setDesignation] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { showToast('Name is required', 'error'); return }
    if (!email.trim()) { showToast('Email is required', 'error'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Enter a valid email address', 'error'); return }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/.test(password)) {
      showToast('Password must be 8–20 characters with uppercase, lowercase and a number', 'error')
      return
    }
    setSubmitting(true)
    try {
      await apiFetch('/api/admin/managers', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          departmentId: departmentId ? Number(departmentId) : null,
          managerId: managerId ? Number(managerId) : null,
          designation: designation.trim() || null,
          location: location.trim() || null,
        }),
      })
      showToast('Manager added successfully', 'success')
      onAdded()
      onClose()
    } catch {
      // apiFetch already shows an error toast for failed requests
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="emp-modal-overlay" onClick={onClose}>
      <div className="emp-modal" onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header">
          <span className="emp-modal-title">Add New Manager</span>
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
          <div className="emp-modal-field">
            <label className="emp-modal-label">Designation</label>
            <input className="emp-modal-input" type="text" placeholder="e.g. Sales Executive" value={designation} onChange={e => setDesignation(e.target.value)} />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Location/Region</label>
            <input className="emp-modal-input" type="text" placeholder="e.g. Mumbai" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <ModalSelect
            label="Department"
            value={departmentId}
            onChange={setDepartmentId}
            placeholder="— No department —"
            options={departments.map(d => ({ value: String(d.id), label: d.name }))}
          />
          <ModalSelect
            label="Manager (Leadership)"
            value={managerId}
            onChange={setManagerId}
            placeholder="— No manager —"
            options={leadership.map(m => ({ value: String(m.id), label: `${m.name} (${m.employeeId})` }))}
          />
          <div className="emp-modal-footer">
            <button type="button" className="cnr-btn-back" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="cnr-btn-submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add Manager'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditManagerModal({
  manager,
  onClose,
  onUpdated,
  departments,
  leadership,
}: {
  manager: ApiEmployee
  onClose: () => void
  onUpdated: (updated: Partial<ApiEmployee>) => void
  departments: Department[]
  leadership: ApiEmployee[]
}) {
  const [name, setName] = useState(manager.name)
  const [email, setEmail] = useState(manager.email)
  const [phone, setPhone] = useState(manager.phone ?? '')
  const [password, setPassword] = useState('')
  const [departmentId, setDepartmentId] = useState(manager.departmentId ? String(manager.departmentId) : '')
  const [managerId, setManagerId] = useState(manager.managerId ? String(manager.managerId) : '')
  const [designation, setDesignation] = useState(manager.designation ?? '')
  const [location, setLocation] = useState(manager.location ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { showToast('Name is required', 'error'); return }
    if (!email.trim()) { showToast('Email is required', 'error'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Enter a valid email address', 'error'); return }
    if (password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      showToast('Password must be at least 8 characters with uppercase, lowercase and a number', 'error')
      return
    }
    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        departmentId: departmentId ? Number(departmentId) : null,
        managerId: managerId ? Number(managerId) : null,
        designation: designation.trim() || null,
        location: location.trim() || null,
      }
      if (password) body.password = password
      await apiFetch(`/api/admin/managers/${manager.id}`, { method: 'PUT', body: JSON.stringify(body) })
      const updatedDept = departmentId ? departments.find(d => String(d.id) === departmentId) : null
      const updatedManager = managerId ? leadership.find(m => String(m.id) === managerId) : null
      onUpdated({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        departmentId: departmentId ? Number(departmentId) : null,
        department: updatedDept ? { id: updatedDept.id, name: updatedDept.name } : null,
        designation: designation.trim() || null,
        location: location.trim() || null,
        managerId: managerId ? Number(managerId) : null,
        manager: updatedManager ? { id: updatedManager.id, name: updatedManager.name, employeeId: updatedManager.employeeId } : null,
      })
      showToast('Manager updated successfully', 'success')
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update manager', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="emp-modal-overlay" onClick={onClose}>
      <div className="emp-modal" onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header">
          <div>
            <span className="emp-modal-title">Edit Manager</span>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {manager.employeeId} · {manager.name}
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
            Only fill in if you want to reset this manager's password.
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Designation</label>
            <input className="emp-modal-input" type="text" placeholder="e.g. Sales Manager" value={designation} onChange={e => setDesignation(e.target.value)} />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Location/Region</label>
            <input className="emp-modal-input" type="text" placeholder="e.g. Mumbai" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <ModalSelect
            label="Department"
            value={departmentId}
            onChange={setDepartmentId}
            placeholder="— No department —"
            options={departments.map(d => ({ value: String(d.id), label: d.name }))}
          />
          <ModalSelect
            label="Manager (Leadership)"
            value={managerId}
            onChange={setManagerId}
            placeholder="— No manager —"
            options={leadership.map(m => ({ value: String(m.id), label: `${m.name} (${m.employeeId})` }))}
          />
          <div className="emp-modal-footer">
            <button type="button" className="cnr-btn-back" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="cnr-btn-submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Admin Settings ────────────────────────────────────────────────────────────
export default function AdminSettingsPage({ onBack }: Props) {
  // Profile
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [adminId, setAdminId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  // Notifications
  const [notifications, setNotifications] = useState(true)
  const [announceNotif, setAnnounceNotif] = useState(true)

  // Manager management
  const isLeader = isLeadership(getStoredUser())
  const [managers, setManagers] = useState<ApiEmployee[]>([])
  const [managersLoading, setManagersLoading] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [leadership, setLeadership] = useState<ApiEmployee[]>([])
  const [showAddManagerModal, setShowAddManagerModal] = useState(false)
  const [editManager, setEditManager] = useState<ApiEmployee | null>(null)
  const [deleteManagerId, setDeleteManagerId] = useState<number | null>(null)
  const [deleteManagerName, setDeleteManagerName] = useState('')
  const [deletingManager, setDeletingManager] = useState(false)

  const fetchManagers = () => {
    setManagersLoading(true)
    apiFetch<ApiEmployee[]>('/api/admin/managers')
      .then(data => { if (mountedRef.current) setManagers(Array.isArray(data) ? data : []) })
      .catch(() => { if (mountedRef.current) setManagers([]) })
      .finally(() => { if (mountedRef.current) setManagersLoading(false) })
  }

  useEffect(() => {
    if (!isLeader) return
    fetchManagers()
    apiFetch<Department[]>('/api/admin/departments')
      .then(data => { if (mountedRef.current) setDepartments(Array.isArray(data) ? data : []) })
      .catch(() => {})
    apiFetch<ApiEmployee[]>('/api/admin/leadership')
      .then(data => { if (mountedRef.current) setLeadership(Array.isArray(data) ? data : []) })
      .catch(() => {})
  }, [])

  async function handleDeleteManager(id: number | null) {
    if (!id) return
    setDeletingManager(true)
    try {
      await apiFetch(`/api/admin/managers/${id}`, { method: 'DELETE' })
      showToast('Manager removed', 'success')
      setDeleteManagerId(null)
      setDeleteManagerName('')
      fetchManagers()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete manager', 'error')
    } finally {
      setDeletingManager(false)
    }
  }

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ name?: string; email?: string; phone?: string; employeeId?: string }>(
        '/api/auth/profile',
      )
      if (!mountedRef.current) return
      setFullName(data.name || '')
      setEmail(data.email || '')
      setPhone(data.phone || '')
      setAdminId(data.employeeId || '')
    } catch (err) {
      if (!mountedRef.current) return
      const msg = err instanceof Error ? err.message : 'Could not load profile'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    const prefs = loadSettings()
    if (prefs.notifications !== undefined) setNotifications(prefs.notifications)
    if (prefs.announceNotif !== undefined) setAnnounceNotif(prefs.announceNotif)

    let cancelled = false
    setLoading(true)
    setError('')
    apiFetch<{ name?: string; email?: string; phone?: string; employeeId?: string }>('/api/auth/profile')
      .then((data) => {
        if (cancelled) return
        setFullName(data.name || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setAdminId(data.employeeId || '')
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : 'Could not load profile'
        setError(msg)
        showToast(msg, 'error')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  function handleSaveSettings() {
    saveSettings({ notifications, announceNotif })
    showToast('Settings saved', 'success')
  }

  return (
    <main className="page-content st-page">
      <ThemeToggle />

      <div className="card st-card">
        <div className="st-card-body">
          {loading ? (
            <p style={{ padding: 16, color: 'var(--text-muted)' }}>Loading profile…</p>
          ) : error ? (
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
                onClick={fetchProfile}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="st-profile-row">
              <div className="st-avatar-col">
                <div className="st-avatar-placeholder">{initials(fullName)}</div>
              </div>

              <div className="st-profile-fields">
                <div className="st-field-grid">
                  <div className="st-field">
                    <label className="st-label">Full Name</label>
                    <input className="st-input" type="text" value={fullName} readOnly />
                  </div>
                  <div className="st-field">
                    <label className="st-label">Email Address</label>
                    <input className="st-input" type="email" value={email} readOnly />
                  </div>
                  <div className="st-field">
                    <label className="st-label">Phone Number</label>
                    <input className="st-input" type="tel" value={phone} readOnly />
                  </div>
                  <div className="st-field">
                    <label className="st-label">ID</label>
                    <input className="st-input" type="text" value={adminId} readOnly />
                  </div>
                </div>
                <div className="st-actions-row">
                  <LogoutButton className="st-btn-outline" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card st-card">
        <div className="st-card-body">
          {[
            { label: 'All Notifications', sub: 'Enable or disable all notifications', val: notifications, set: setNotifications },
            { label: 'Announcement Notifications', sub: 'Receive notifications for new announcements', val: announceNotif, set: setAnnounceNotif },
          ].map(n => (
            <div className="st-notif-row" key={n.label}>
              <div className="st-notif-left">
                <div>
                  <div className="st-notif-label">{n.label}</div>
                  <div className="st-notif-sub">{n.sub}</div>
                </div>
              </div>
              <Toggle checked={n.val} onChange={n.set} />
            </div>
          ))}
        </div>
      </div>

      {/* Manager Management */}
      {isLeader && (
        <div className="card st-card">
          <div className="st-card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Manager Management</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Manage manager accounts for this platform.</div>
              </div>
              <button className="cnr-btn-submit" type="button" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowAddManagerModal(true)}>
                <IcoPlus /> Add Manager
              </button>
            </div>

            {managersLoading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading managers…</p>
            ) : managers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No managers found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {managers.map(manager => (
                  <div key={manager.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-secondary, rgba(0,0,0,0.03))' }}>
                    <div className="emp-avatar" style={{ flexShrink: 0 }}>{initials(manager.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{manager.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{manager.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {manager.department?.name ?? 'No department'} · Reports to {manager.manager?.name ?? '—'}
                      </div>
                    </div>
                    {manager.employeeId && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'monospace' }}>{manager.employeeId}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditManager(manager)}
                      style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}
                      aria-label={`Edit ${manager.name}`}
                      title="Edit manager"
                    >
                      <IcoPencil />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeleteManagerId(manager.id); setDeleteManagerName(manager.name) }}
                      style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', padding: 4 }}
                      aria-label={`Delete ${manager.name}`}
                      title="Delete manager"
                    >
                      <IcoX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showAddManagerModal && (
        <AddManagerModal
          onClose={() => setShowAddManagerModal(false)}
          onAdded={fetchManagers}
          departments={departments}
          leadership={leadership}
        />
      )}

      {editManager && (
        <EditManagerModal
          manager={editManager}
          onClose={() => setEditManager(null)}
          onUpdated={(updated) => setManagers(prev => prev.map(m => m.id === editManager.id ? { ...m, ...updated } : m))}
          departments={departments}
          leadership={leadership}
        />
      )}

      {deleteManagerId !== null && (
        <div className="emp-modal-overlay" onClick={() => { setDeleteManagerId(null); setDeleteManagerName('') }}>
          <div className="emp-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="emp-modal-header">
              <span className="emp-modal-title">Remove Manager</span>
              <button type="button" className="emp-modal-close" onClick={() => { setDeleteManagerId(null); setDeleteManagerName('') }}><IcoX /></button>
            </div>
            <div className="emp-modal-body">
              <p style={{ margin: '0 0 20px', color: 'var(--text-primary)' }}>
                Are you sure you want to remove <strong>{deleteManagerName}</strong>? This action cannot be undone.
              </p>
              <div className="emp-modal-footer">
                <button type="button" className="cnr-btn-back" onClick={() => { setDeleteManagerId(null); setDeleteManagerName('') }} disabled={deletingManager}>Cancel</button>
                <button type="button" className="cnr-btn-submit" style={{ background: '#ef4444' }} onClick={() => handleDeleteManager(deleteManagerId)} disabled={deletingManager}>
                  {deletingManager ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="cnr-footer">
        <button className="cnr-btn-back" type="button" onClick={onBack}><IcoArrowLeft /> Back to Dashboard</button>
        <div className="cnr-footer-right">
          <button className="cnr-btn-draft" type="button" onClick={onBack}>Cancel</button>
          <button className="cnr-btn-submit" type="button" onClick={handleSaveSettings}><IcoSave /> Save Settings</button>
        </div>
      </div>

    </main>
  )
}
