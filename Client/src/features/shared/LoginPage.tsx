import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ConstructionIllustration,
  IcoEye,
  IcoLock,
  IcoMail,
  IcoShield,
  IcoSignIn,
  IcoUser,
} from './icons/index'
import { API_BASE_URL } from '../../config'
import { showToast } from '../../lib/feedback'
import '../../styles/login.css'

export default function LoginPage() {
  const navigate = useNavigate()

  const [role,       setRole]       = useState<'admin' | 'employee'>('admin')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [name,       setName]       = useState('')
  const [phone,      setPhone]      = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isRegister
        ? `${API_BASE_URL}/api/auth/register`
        : `${API_BASE_URL}/api/auth/login`

      const body = isRegister
        ? { employeeId, name, phone, email, password }
        : { email, password, role: role === 'admin' ? 'Admin' : 'Employee' }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || (isRegister ? 'Registration failed' : 'Login failed'))
        return
      }

      if (isRegister) {
        showToast('Registered successfully. Please log in.', 'success')
        setIsRegister(false)
        return
      }

      // Store tokens and user
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))

      const userRole =
        typeof data.user.role === 'string'
          ? data.user.role
          : data.user.role?.roleName ?? ''

      if (userRole.toLowerCase() === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/employee/dashboard')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Connection failed: ${err.message}`
          : 'Could not reach the server.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-logo">
            <div className="login-logo-icon">CM</div>
            <div className="login-logo-text">
              Constro<span>Mat</span>
              <span className="login-logo-tm">™</span>
            </div>
          </div>
          <div className="login-welcome">Welcome Back!</div>
          <div className="login-welcome-sub">
            Sign in to your account and continue managing reports efficiently.
          </div>
          <div className="login-illustration">
            <ConstructionIllustration />
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-card-title">Login to Your Account</div>
            <div className="login-card-sub">Choose your role and sign in to continue</div>

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

            <form onSubmit={handleSubmit} noValidate>
              {isRegister && (
                <>
                  <div className="login-field">
                    <label className="login-label">Employee ID</label>
                    <div className="login-input-wrap">
                      <input className="login-input" type="text" placeholder="Enter employee ID" value={employeeId} onChange={e => setEmployeeId(e.target.value)} />
                    </div>
                  </div>
                  <div className="login-field">
                    <label className="login-label">Full Name</label>
                    <div className="login-input-wrap">
                      <input className="login-input" type="text" placeholder="Enter full name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="login-field">
                    <label className="login-label">Phone Number</label>
                    <div className="login-input-wrap">
                      <input className="login-input" type="text" placeholder="10-digit phone number" value={phone} onChange={e => setPhone(e.target.value)} />
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
                  Already have an account?
                  <button type="button" className="login-register-link" onClick={() => setIsRegister(false)}>
                    Login
                  </button>
                </>
              ) : (
                role === 'employee' && (
                  <>
                    Don&apos;t have an account?
                    <button type="button" className="login-register-link" onClick={() => setIsRegister(true)}>
                      Register
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
