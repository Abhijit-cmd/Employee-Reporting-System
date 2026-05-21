import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'

// ── Dummy credentials ─────────────────────────────────────────────────────────
const CREDENTIALS = {
  admin:    { email: 'admin@constromat.com',    password: 'admin123' },
  employee: { email: 'employee@constromat.com', password: 'emp123'   },
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function IcoMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
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

function IcoUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function IcoShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

function IcoSignIn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  )
}

// ── Construction illustration (inline SVG) ────────────────────────────────────
function ConstructionIllustration() {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sky / background */}
      <rect width="400" height="300" fill="#eef0f8"/>

      {/* Distant city silhouette */}
      <rect x="10"  y="180" width="30" height="80" rx="2" fill="#d1d5e8" opacity="0.5"/>
      <rect x="45"  y="160" width="25" height="100" rx="2" fill="#c7cce0" opacity="0.5"/>
      <rect x="75"  y="170" width="20" height="90" rx="2" fill="#d1d5e8" opacity="0.5"/>
      <rect x="340" y="175" width="28" height="85" rx="2" fill="#d1d5e8" opacity="0.5"/>
      <rect x="372" y="165" width="22" height="95" rx="2" fill="#c7cce0" opacity="0.5"/>

      {/* Building under construction */}
      <rect x="100" y="100" width="120" height="160" rx="3" fill="#c9cfe6"/>
      {/* Floors */}
      {[120,140,160,180,200,220,240].map(y => (
        <line key={y} x1="100" y1={y} x2="220" y2={y} stroke="#b0b8d4" strokeWidth="1"/>
      ))}
      {/* Columns */}
      {[120,140,160,180,200].map(x => (
        <line key={x} x1={x} y1="100" x2={x} y2="260" stroke="#b0b8d4" strokeWidth="1"/>
      ))}
      {/* Windows */}
      {[108,128,148,168,188,208].map(x =>
        [108,128,148,168,188,208,228].map(y => (
          <rect key={`${x}-${y}`} x={x} y={y} width="10" height="8" rx="1" fill="#a5b0cc" opacity="0.7"/>
        ))
      )}
      {/* Scaffolding */}
      <rect x="220" y="80" width="8" height="180" fill="#b0b8d4"/>
      <rect x="228" y="80" width="8" height="180" fill="#b0b8d4"/>
      {[90,110,130,150,170,190,210,230].map(y => (
        <line key={y} x1="220" y1={y} x2="236" y2={y} stroke="#9aa3be" strokeWidth="2"/>
      ))}

      {/* Tower crane */}
      {/* Mast */}
      <rect x="248" y="40" width="8" height="220" fill="#9aa3be"/>
      {/* Horizontal jib */}
      <rect x="180" y="38" width="140" height="6" rx="2" fill="#9aa3be"/>
      {/* Counter jib */}
      <rect x="248" y="38" width="72" height="4" rx="1" fill="#b0b8d4"/>
      {/* Cable */}
      <line x1="200" y1="44" x2="215" y2="100" stroke="#9aa3be" strokeWidth="1.5"/>
      {/* Hook block */}
      <rect x="210" y="98" width="10" height="8" rx="2" fill="#7c85a8"/>

      {/* Ground */}
      <rect x="0" y="258" width="400" height="42" fill="#d1d5e8"/>

      {/* Concrete mixer truck */}
      {/* Cab */}
      <rect x="155" y="220" width="55" height="38" rx="6" fill="#f0f2fa"/>
      {/* Windshield */}
      <rect x="160" y="224" width="30" height="18" rx="3" fill="#c7cce0"/>
      {/* Body */}
      <rect x="100" y="228" width="60" height="30" rx="4" fill="#e8eaf5"/>
      {/* Drum */}
      <ellipse cx="130" cy="235" rx="22" ry="18" fill="#e0e3f0"/>
      <ellipse cx="130" cy="235" rx="16" ry="13" fill="#d1d5e8"/>
      {/* Red stripe on drum */}
      <path d="M110 235 Q130 220 150 235" stroke="#c0392b" strokeWidth="4" fill="none"/>
      <path d="M110 235 Q130 250 150 235" stroke="#c0392b" strokeWidth="4" fill="none"/>
      {/* Wheels */}
      <circle cx="120" cy="260" r="12" fill="#6b7280"/>
      <circle cx="120" cy="260" r="7"  fill="#9ca3af"/>
      <circle cx="148" cy="260" r="12" fill="#6b7280"/>
      <circle cx="148" cy="260" r="7"  fill="#9ca3af"/>
      <circle cx="192" cy="260" r="12" fill="#6b7280"/>
      <circle cx="192" cy="260" r="7"  fill="#9ca3af"/>

      {/* Traffic cone */}
      <polygon points="270,258 280,258 276,238" fill="#e67e22"/>
      <rect x="268" y="256" width="14" height="4" rx="1" fill="#f39c12"/>

      {/* Hard hat */}
      <ellipse cx="310" cy="252" rx="18" ry="8" fill="#f1c40f"/>
      <rect x="296" y="248" width="28" height="6" rx="3" fill="#f39c12"/>
    </svg>
  )
}

// ── Login Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()

  const [role,       setRole]       = useState<'admin' | 'employee'>('admin')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [remember,   setRemember]   = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate a brief async check
    setTimeout(() => {
      const creds = CREDENTIALS[role]
      if (email === creds.email && password === creds.password) {
        if (role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/employee/dashboard')
        }
      } else {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="login-page">
      <div className="login-container">

        {/* ── Left panel ──────────────────────────────── */}
        <div className="login-left">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">CM</div>
            <div className="login-logo-text">
              Constro<span>Mat</span>
              <span className="login-logo-tm">™</span>
            </div>
          </div>

          {/* Welcome text */}
          <div className="login-welcome">Welcome Back!</div>
          <div className="login-welcome-sub">
            Sign in to your account and continue managing reports efficiently.
          </div>

          {/* Illustration */}
          <div className="login-illustration">
            <ConstructionIllustration />
          </div>
        </div>

        {/* ── Right panel ─────────────────────────────── */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-card-title">Login to Your Account</div>
            <div className="login-card-sub">Choose your role and sign in to continue</div>

            {/* Role selector */}
            <div className="login-roles">
              <button
                type="button"
                className={`login-role-btn${role === 'admin' ? ' active' : ''}`}
                onClick={() => { setRole('admin'); setError('') }}
              >
                <div className="login-role-icon"><IcoShield /></div>
                <div className="login-role-name">Admin</div>
                <div className="login-role-sub">Super Admin Access</div>
              </button>
              <button
                type="button"
                className={`login-role-btn${role === 'employee' ? ' active' : ''}`}
                onClick={() => { setRole('employee'); setError('') }}
              >
                <div className="login-role-icon"><IcoUser /></div>
                <div className="login-role-name">Employee</div>
                <div className="login-role-sub">Employee Access</div>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="login-field">
                <label className="login-label">Email Address</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon"><IcoMail /></span>
                  <input
                    className="login-input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-label">Password</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon"><IcoLock /></span>
                  <input
                    className="login-input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="login-pw-toggle"
                    onClick={() => setShowPw(s => !s)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <IcoEye show={showPw} />
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="login-row">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <button type="button" className="login-forgot">Forgot Password?</button>
              </div>

              {/* Error */}
              {error && <div className="login-error">{error}</div>}

              {/* Submit */}
              <button className="login-submit" type="submit" disabled={loading}>
                <IcoSignIn />
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Footer */}
            <div className="login-footer">
              Don't have an account?
              <a href="mailto:admin@constromat.com">Contact Administrator</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
