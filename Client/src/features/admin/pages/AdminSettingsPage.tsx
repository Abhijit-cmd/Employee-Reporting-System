import { useState, useRef, useEffect } from 'react'
import { Toggle, SectionHeader, ThemeModeCard } from '../../shared/settingsComponents'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { loadSettings, saveSettings } from '../../../lib/settingsStorage'
import LogoutButton from '../../shared/LogoutButton'

interface Props { onBack: () => void }

// ── Icons ─────────────────────────────────────────────────────────────────────
function IcoShield() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function IcoBell() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}
function IcoCamera() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
}
function IcoMail() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}
function IcoMegaphone() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
}
function IcoArrowLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}
function IcoSave() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
}

// ── Admin Settings ────────────────────────────────────────────────────────────
export default function AdminSettingsPage({ onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)

  
  // Profile
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [adminId, setAdminId] = useState('')
  

  // Notifications
  const [notifications, setNotifications] = useState(true)
  const [emailNotif,    setEmailNotif]    = useState(true)
  const [announceNotif, setAnnounceNotif] = useState(true)

  useEffect(() => {
    const prefs = loadSettings()
    if (prefs.notifications !== undefined) setNotifications(prefs.notifications)
    if (prefs.emailNotif !== undefined) setEmailNotif(prefs.emailNotif)
    if (prefs.announceNotif !== undefined) setAnnounceNotif(prefs.announceNotif)

    apiFetch<{ name?: string; email?: string; phone?: string; employeeId?: string }>(
      '/api/admin/profile',
    )
      .then((data) => {
        setFullName(data.name || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setAdminId(data.employeeId || '')
      })
      .catch(() => showToast('Could not load profile', 'error'))
  }, [])

  function handleSaveSettings() {
    saveSettings({ notifications, emailNotif, announceNotif })
    showToast('Settings saved', 'success')
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatarSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <main className="page-content st-page">

      {/* 1. Admin Profile */}
      <div className="card st-card">
        <SectionHeader
          icon={<IcoShield />}
          title="Admin Profile"
          sub="Update your admin account information"
          iconBg="#e0e7ff"
          iconColor="#6366f1"
        />
        <div className="st-card-body">
          <div className="st-profile-row">
            {/* Avatar */}
            <div className="st-avatar-col">
              <div className="st-avatar-wrap">
                {avatarSrc
                  ? <img src={avatarSrc} alt="Admin" className="st-avatar-img" />
                  : <div className="st-avatar-placeholder" style={{ background: '#4f46e5' }}>
                   {fullName ? fullName.charAt(0).toUpperCase() : "A"}
                  </div>
                }
                <button type="button" className="st-avatar-cam" onClick={() => fileRef.current?.click()} aria-label="Upload photo">
                  <IcoCamera />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <div className="st-avatar-hint">
                <span className="st-avatar-hint-label">Upload Photo</span>
                <span className="st-avatar-hint-sub">JPG, PNG or GIF. Max size 2MB</span>
              </div>
            </div>

            {/* Fields */}
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
              <div className="st-card-action-row">
                <button className="st-btn-outline" type="button"><IcoSave /> Update Profile</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Notifications */}
      <div className="card st-card">
        <SectionHeader
          icon={<IcoBell />}
          title="Notification Settings"
          sub="Manage how you receive notifications"
          iconBg="#fee2e2"
          iconColor="#ef4444"
        />
        <div className="st-card-body">
          {[{ icon: <IcoBell />,iconBg: '#e0e7ff',iconColor: '#6366f1',label: 'All Notifications', sub: 'Enable or disable all notifications', val: notifications, set: setNotifications,}
            ,{ icon: <IcoMail />,      iconBg: '#e0e7ff', iconColor: '#6366f1', label: 'Email Notifications',        sub: 'Receive email updates about reports and activities', val: emailNotif,    set: setEmailNotif },
            { icon: <IcoMegaphone />, iconBg: '#fce7f3', iconColor: '#ec4899', label: 'Announcement Notifications', sub: 'Receive notifications for new announcements',        val: announceNotif, set: setAnnounceNotif },
          ].map(n => (
            <div className="st-notif-row" key={n.label}>
              <div className="st-notif-left">
                <div className="st-notif-icon" style={{ background: n.iconBg, color: n.iconColor }}>{n.icon}</div>
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

      {/* 3. Appearance — shared card (same as employee) */}
      <ThemeModeCard />

      <div className="card st-card">
        <SectionHeader
          icon={<IcoShield />}
          title="Account"
          sub="Sign out of the admin dashboard"
          iconBg="#fee2e2"
          iconColor="#ef4444"
        />
        <div className="st-card-body">
          <LogoutButton className="st-btn-outline" />
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
