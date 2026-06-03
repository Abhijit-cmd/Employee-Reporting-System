import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'

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

function IcoSignIn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [remember,   setRemember]   = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [name,       setName]       = useState('')
  const [phone,      setPhone]      = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isRegister
        ? `${import.meta.env.VITE_API_URL}/api/auth/register`
        : `${import.meta.env.VITE_API_URL}/api/auth/login`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, role: 'employee' }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || (isRegister ? 'Registration failed' : 'Login failed'))
        return
      }

      if (isRegister) {
        alert('Account created successfully. Please sign in.')
        setIsRegister(false)
        return
      }

      localStorage.setItem('token', data.token)
      const u = data.user
      localStorage.setItem('user', JSON.stringify({
        id: u.id, name: u.name, email: u.email, employeeId: u.employeeId, role: u.role
      }))
      navigate('/employee/dashboard')

    } catch {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <video className="login-bg-video" autoPlay loop muted playsInline>
        <source src="https://archive.org/download/CityTimelapse/city%20timelapse.mp4" type="video/mp4" />
        <source src="/construction.webm" type="video/webm" />
      </video>
      <div className="login-bg-overlay" />

      <div className="login-container">

        {/* ── Left panel ── */}
        <div className="login-left">
          <div className="login-logo">
            <img src="/logo.png" alt="ConstroMat" className="login-logo-img" />
          </div>
          <div className="login-welcome">Welcome Back!</div>
          <div className="login-welcome-sub">
            Sign in to your employee account and continue managing reports efficiently.
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="login-card">
            <div className="login-card-title">
              {isRegister ? 'Create an Account' : 'Employee Sign In'}
            </div>
            <div className="login-card-sub">
              {isRegister ? 'Fill in your details to register' : 'Enter your credentials to continue'}
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {isRegister && (
                <>
                  <div className="login-field">
                    <label className="login-label">Full Name</label>
                    <div className="login-input-wrap">
                      <input
                        className="login-input"
                        type="text"
                        placeholder="Enter full name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ paddingLeft: 12 }}
                      />
                    </div>
                  </div>
                  <div className="login-field">
                    <label className="login-label">Phone Number</label>
                    <div className="login-input-wrap">
                      <input
                        className="login-input"
                        type="text"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={{ paddingLeft: 12 }}
                      />
                    </div>
                  </div>
                </>
              )}

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

              {!isRegister && (
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
              )}

              {error && <div className="login-error">{error}</div>}

              <button className="login-submit" type="submit" disabled={loading}>
                <IcoSignIn />
                {loading
                  ? isRegister ? 'Registering...' : 'Signing in...'
                  : isRegister ? 'Register' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              {isRegister ? (
                <>
                  Already have an account?{' '}
                  <button type="button" className="login-register-link" onClick={() => setIsRegister(false)}>
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button type="button" className="login-register-link" onClick={() => setIsRegister(true)}>
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
