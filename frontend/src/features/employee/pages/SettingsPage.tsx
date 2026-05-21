import { useState, useRef } from 'react'

interface Props {
  onBack: () => void
}

// ── Tiny inline icons (no extra dep) ─────────────────────────────────────────

function IcoUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function IcoLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}
function IcoBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function IcoPalette() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a10 10 0 0 1 0 20c-2.76 0-5-2.24-5-5 0-1.1.9-2 2-2h6a2 2 0 0 0 2-2 7 7 0 0 0-7-7"/>
    </svg>
  )
}
function IcoEye({ show }: { show: boolean }) {
  return show ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
function IcoCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}
function IcoMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}
function IcoClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
function IcoMegaphone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  )
}
function IcoSun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function IcoMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function IcoCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IcoArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}
function IcoSave() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  )
}

// ── Toggle component ──────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`st-toggle${checked ? ' st-toggle-on' : ''}`}
    >
      <span className="st-toggle-thumb" />
    </button>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon, title, sub, iconBg, iconColor,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="st-section-header">
      <div className="st-section-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div>
        <div className="st-section-title">{title}</div>
        <div className="st-section-sub">{sub}</div>
      </div>
    </div>
  )
}

// ── Password field ────────────────────────────────────────────────────────────

function PasswordField({
  label, value, onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="st-field">
      <label className="st-label">{label}</label>
      <div className="st-pw-wrap">
        <input
          className="st-input"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
        />
        <button
          type="button"
          className="st-pw-eye"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <IcoEye show={show} />
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const THEME_COLORS = [
  { id: 'purple', hex: '#4f46e5' },
  { id: 'blue',   hex: '#3b82f6' },
  { id: 'green',  hex: '#10b981' },
  { id: 'pink',   hex: '#ec4899' },
  { id: 'orange', hex: '#f59e0b' },
  { id: 'gray',   hex: '#6b7280' },
]

export default function SettingsPage({ onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)

  // Profile
  const [fullName,    setFullName]    = useState('Anil')
  const [email,       setEmail]       = useState('anil.kumar@constromat.com')
  const [phone,       setPhone]       = useState('+91 98765 43210')
  const [empId,       setEmpId]       = useState('CM12345')
  const [designation, setDesignation] = useState('Sales Executive')

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  // Notifications
  const [emailNotif,    setEmailNotif]    = useState(true)
  const [reportRemind,  setReportRemind]  = useState(true)
  const [announceNotif, setAnnounceNotif] = useState(true)

  // Appearance
  const [themeMode,  setThemeMode]  = useState<'light' | 'dark'>('light')
  const [themeColor, setThemeColor] = useState('purple')

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatarSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <main className="page-content st-page">

      {/* ── 1. Profile Settings ─────────────────────────────── */}
      <div className="card st-card">
        <SectionHeader
          icon={<IcoUser />}
          title="Profile Settings"
          sub="Update your personal information"
          iconBg="#e0e7ff"
          iconColor="#6366f1"
        />
        <div className="st-card-body">
          <div className="st-profile-row">
            {/* Avatar */}
            <div className="st-avatar-col">
              <div className="st-avatar-wrap">
                {avatarSrc
                  ? <img src={avatarSrc} alt="Profile" className="st-avatar-img" />
                  : <div className="st-avatar-placeholder">A</div>
                }
                <button
                  type="button"
                  className="st-avatar-cam"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Upload photo"
                >
                  <IcoCamera />
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
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
                  <label className="st-label">Employee ID</label>
                  <input className="st-input" type="text" value={empId} onChange={e => setEmpId(e.target.value)} />
                </div>
                <div className="st-field st-field-full">
                  <label className="st-label">Designation</label>
                  <input className="st-input" type="text" value={designation} onChange={e => setDesignation(e.target.value)} />
                </div>
              </div>
              <div className="st-card-action-row">
                <button className="st-btn-outline" type="button">
                  <IcoSave />
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Password Settings ────────────────────────────── */}
      <div className="card st-card">
        <SectionHeader
          icon={<IcoLock />}
          title="Password Settings"
          sub="Update your password to keep your account secure"
          iconBg="#fef3c7"
          iconColor="#f59e0b"
        />
        <div className="st-card-body">
          <div className="st-pw-fields">
            <PasswordField label="Current Password" value={currentPw} onChange={setCurrentPw} />
            <PasswordField label="New Password"     value={newPw}     onChange={setNewPw} />
            <PasswordField label="Confirm Password" value={confirmPw} onChange={setConfirmPw} />
          </div>
          <div className="st-card-action-row">
            <button className="st-btn-outline" type="button">
              <IcoSave />
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Notification Settings ────────────────────────── */}
      <div className="card st-card">
        <SectionHeader
          icon={<IcoBell />}
          title="Notification Settings"
          sub="Manage how you receive notifications"
          iconBg="#fee2e2"
          iconColor="#ef4444"
        />
        <div className="st-card-body">
          {[
            {
              icon: <IcoMail />, iconBg: '#e0e7ff', iconColor: '#6366f1',
              label: 'Email Notifications',
              sub: 'Receive email updates about reports and activities',
              val: emailNotif, set: setEmailNotif,
            },
            {
              icon: <IcoClock />, iconBg: '#fef3c7', iconColor: '#f59e0b',
              label: 'Report Reminders',
              sub: 'Receive reminders for pending reports',
              val: reportRemind, set: setReportRemind,
            },
            {
              icon: <IcoMegaphone />, iconBg: '#fce7f3', iconColor: '#ec4899',
              label: 'Announcement Notifications',
              sub: 'Receive notifications for new announcements',
              val: announceNotif, set: setAnnounceNotif,
            },
          ].map(n => (
            <div className="st-notif-row" key={n.label}>
              <div className="st-notif-left">
                <div className="st-notif-icon" style={{ background: n.iconBg, color: n.iconColor }}>
                  {n.icon}
                </div>
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

      {/* ── 4. Appearance Settings ──────────────────────────── */}
      <div className="card st-card">
        <SectionHeader
          icon={<IcoPalette />}
          title="Appearance Settings"
          sub="Customize your experience"
          iconBg="#d1fae5"
          iconColor="#10b981"
        />
        <div className="st-card-body">
          {/* Theme mode */}
          <div className="st-appear-row">
            <div>
              <div className="st-appear-label">Theme Mode</div>
              <div className="st-appear-sub">Choose your preferred theme</div>
            </div>
            <div className="st-theme-btns">
              <button
                type="button"
                className={`st-theme-btn${themeMode === 'light' ? ' active' : ''}`}
                onClick={() => setThemeMode('light')}
              >
                <IcoSun /> Light
              </button>
              <button
                type="button"
                className={`st-theme-btn${themeMode === 'dark' ? ' active' : ''}`}
                onClick={() => setThemeMode('dark')}
              >
                <IcoMoon /> Dark
              </button>
            </div>
          </div>

          {/* Primary color */}
          <div className="st-appear-row">
            <div>
              <div className="st-appear-label">Primary Color</div>
              <div className="st-appear-sub">Choose your primary theme color</div>
            </div>
            <div className="st-color-swatches">
              {THEME_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`st-swatch${themeColor === c.id ? ' active' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => setThemeColor(c.id)}
                  aria-label={`Select ${c.id} theme`}
                >
                  {themeColor === c.id && <IcoCheck />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="cnr-footer">
        <button className="cnr-btn-back" type="button" onClick={onBack}>
          <IcoArrowLeft />
          Back to Dashboard
        </button>
        <div className="cnr-footer-right">
          <button className="cnr-btn-draft" type="button" onClick={onBack}>
            Cancel
          </button>
          <button className="cnr-btn-submit" type="button">
            <IcoSave />
            Save Settings
          </button>
        </div>
      </div>

    </main>
  )
}
