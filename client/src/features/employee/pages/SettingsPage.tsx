import { useState, useEffect, useRef } from 'react'
import { Toggle, ThemeToggle } from '../../shared/settingsComponents'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { loadSettings, saveSettings } from '../../../lib/settingsStorage'
import LogoutButton from '../../shared/LogoutButton'

interface Props { onBack: () => void }

function IcoArrowLeft() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> }
function IcoSave() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> }
function IcoEye({ show }: { show: boolean }) { return (
  show ?
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> :
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
) }

export default function SettingsPage({ onBack }: Props) {
  const [fullName,    setFullName]    = useState('')
  const [email,       setEmail]       = useState('')
  const [phone,       setPhone]       = useState('')
  const [empId,       setEmpId]       = useState('')
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  const [reportRemind,  setReportRemind]  = useState(true)
  const [announceNotif, setAnnounceNotif] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')

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
      setEmpId(data.employeeId || '')
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
    if (prefs.reportRemind !== undefined) setReportRemind(prefs.reportRemind)
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
        setEmpId(data.employeeId || '')
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

  async function handleChangePassword() {
    setPasswordError('')
    setChangePasswordLoading(true)
    try {
      await apiFetch('/api/reports/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword
        })
      })
      showToast('Password updated successfully.', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update password'
      setPasswordError(msg)
      showToast(msg, 'error')
    } finally {
      setChangePasswordLoading(false)
    }
  }

  function handleSaveSettings() {
    saveSettings({ reportRemind, announceNotif })
    showToast('Settings saved', 'success')
  }

  function initials() {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] ?? 'A'
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''
    return `${first}${last}`.toUpperCase()
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
                <div className="st-avatar-placeholder">{initials()}</div>
              </div>
              <div className="st-profile-fields">
                <div className="st-field-grid">
                  <div className="st-field"><label className="st-label">Full Name</label><input className="st-input" type="text" value={fullName} readOnly /></div>
                  <div className="st-field"><label className="st-label">Email Address</label><input className="st-input" type="email" value={email} readOnly /></div>
                  <div className="st-field"><label className="st-label">Phone Number</label><input className="st-input" type="tel" value={phone} readOnly /></div>
                  <div className="st-field"><label className="st-label">Employee ID</label><input className="st-input" type="text" value={empId} readOnly /></div>
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
            { label: 'Report Reminders', sub: 'Receive reminders for pending reports', val: reportRemind, set: setReportRemind },
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

      {/* Change Password Card */}
      <div className="card st-card">
        <div className="st-card-body">
          <div className="st-section-title" style={{ marginBottom: '16px' }}>Security Settings</div>
          <div className="st-section-sub" style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Change Password</div>
          
          {passwordError && (
            <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.875rem' }}>{passwordError}</div>
          )}
          
          <div className="st-field" style={{ marginBottom: '12px' }}>
            <label className="st-label">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="st-input"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <IcoEye show={showCurrentPassword} />
              </button>
            </div>
          </div>

          <div className="st-field" style={{ marginBottom: '12px' }}>
            <label className="st-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="st-input"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <IcoEye show={showNewPassword} />
              </button>
            </div>
          </div>

          <div className="st-field" style={{ marginBottom: '16px' }}>
            <label className="st-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="st-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <IcoEye show={showConfirmPassword} />
              </button>
            </div>
          </div>

          <button
            className="cnr-btn-submit"
            type="button"
            onClick={handleChangePassword}
            disabled={changePasswordLoading}
          >
            {changePasswordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

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
