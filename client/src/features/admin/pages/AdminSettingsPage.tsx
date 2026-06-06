import { useState, useEffect } from 'react'
import { Toggle, ThemeToggle } from '../../shared/settingsComponents'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { loadSettings, saveSettings } from '../../../lib/settingsStorage'
import LogoutButton from '../../shared/LogoutButton'

interface Props { onBack: () => void }

function IcoArrowLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}
function IcoSave() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
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

  // Notifications
  const [notifications, setNotifications] = useState(true)
  const [announceNotif, setAnnounceNotif] = useState(true)

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ name?: string; email?: string; phone?: string; employeeId?: string }>(
        '/api/auth/profile',
      )
      setFullName(data.name || '')
      setEmail(data.email || '')
      setPhone(data.phone || '')
      setAdminId(data.employeeId || '')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load profile'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const prefs = loadSettings()
    if (prefs.notifications !== undefined) setNotifications(prefs.notifications)
    if (prefs.announceNotif !== undefined) setAnnounceNotif(prefs.announceNotif)

    fetchProfile()
  }, [])

  function handleSaveSettings() {
    saveSettings({ notifications, announceNotif })
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
                  <div className="st-field">
                    <label className="st-label">Full Name</label>
                    <input className="st-input" type="text" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div className="st-field">
                    <label className="st-label">Email Address</label>
                    <input className="st-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="st-field">
                    <label className="st-label">Phone Number</label>
                    <input className="st-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="st-field">
                    <label className="st-label">Admin ID</label>
                    <input className="st-input" type="text" value={adminId} onChange={e => setAdminId(e.target.value)} />
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
