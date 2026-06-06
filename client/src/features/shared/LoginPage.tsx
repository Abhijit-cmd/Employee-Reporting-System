import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IcoEye,
  IcoLock,
  IcoMail,
  IcoShield,
  IcoSignIn,
  IcoUser,
} from './icons/index'

const BENEFITS = [
  { num: '01', title: 'Effortless Monthly Reporting', desc: 'Submit structured reports in minutes with a guided form.' },
  { num: '02', title: 'Real-Time Performance Tracking', desc: 'Monitor your targets and achievements as they happen.' },
  { num: '03', title: 'Centralized Records', desc: 'Every report stored securely — accessible anytime, anywhere.' },
  { num: '04', title: 'Instant Admin Visibility', desc: 'Management gets instant insight into team progress and activity.' },
  { num: '05', title: 'Data-Driven Decisions', desc: 'Analytics and trends help leadership make smarter choices.' },
]

const GREETINGS = [
  'Welcome Back!',
  'वापस आपका स्वागत है!',
  'স্বাগতম!',
  'மீண்டும் வரவேற்கிறோம்!',
  'తిరిగి స్వాగతం!',
  'ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ!',
  'ফিরে স্বাগত!',
  'ಮತ್ತೆ ಸ್ವಾಗತ!',
  'Bienvenido de nuevo!',
  'مرحباً بعودتك!',
  'Bienvenue!',
  'Willkommen zurück!',
  'お帰りなさい!',
  'Bem-vindo de volta!',
]
import { API_BASE_URL } from '../../config'
import { showToast } from '../../lib/feedback'

import '../../styles/login.css'
import { saveUser } from '../../lib/auth'

export default function LoginPage() {
  const navigate = useNavigate()

  const [greetingIdx, setGreetingIdx] = useState(0)
  const [greetingVisible, setGreetingVisible] = useState(true)
  const [benefitIdx, setBenefitIdx] = useState(0)
  const [benefitVisible, setBenefitVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingVisible(false)
      setTimeout(() => {
        setGreetingIdx((i) => (i + 1) % GREETINGS.length)
        setGreetingVisible(true)
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setBenefitVisible(false)
      setTimeout(() => {
        setBenefitIdx((i) => (i + 1) % BENEFITS.length)
        setBenefitVisible(true)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const [role,       setRole]       = useState<'admin' | 'employee'>('admin')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [name,       setName]       = useState('')
  const [phone,      setPhone]      = useState('')
  function resetAuthState() {
    setError('')
    setLoading(false)
  }
  function resetForm() {
    setName('')
    setPhone('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetAuthState()

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (name.trim().length === 0) {
        setError('Please enter your full name')
        return
      }
      const phoneRegex = /^\+?[1-9]\d{6,19}$/
      if (!phoneRegex.test(phone.trim())) {
        setError('Please enter a valid phone number (include country code if needed)')
        return
      }
    }

    setLoading(true)

    try {
      const url = isRegister
        ? `${API_BASE_URL}/api/auth/register`
        : `${API_BASE_URL}/api/auth/login`

      const body = isRegister
      ? { name, phone, email, password }
      : { email, password, role: role === 'admin' ? 'Admin' : 'Employee' }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include', // Critical: allows cookies to be set
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.message || 'Request failed')
        setLoading(false)
        return
      }

      if (isRegister) {
        showToast('Registered successfully. Please log in.', 'success')
        setIsRegister(false)
resetForm()
        return
      }

      if (!data?.user) {
        setError('Invalid login response')
        setLoading(false)
        return
      }

      saveUser(data.user)

      const userRole =
  typeof data.user?.role === 'string'
    ? data.user.role
    : data.user?.role?.roleName ?? ''

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
            <img src="/logo.png" alt="ConstroMat" className="login-logo-img" />
          </div>
          <div
            className="login-welcome"
            style={{ opacity: greetingVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}
          >
            {GREETINGS[greetingIdx]}
          </div>
          <div className="login-welcome-sub">
            Sign in to your account and continue managing reports efficiently.
          </div>

          <div className="login-benefits">
            <div className="login-benefits-label">WHY THIS SYSTEM?</div>
            <div
              className="login-benefits-card"
              style={{ opacity: benefitVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}
            >
              <div className="login-benefits-num">{BENEFITS[benefitIdx].num}</div>
              <div className="login-benefits-text">
                <div className="login-benefits-title">{BENEFITS[benefitIdx].title}</div>
                <div className="login-benefits-desc">{BENEFITS[benefitIdx].desc}</div>
              </div>
            </div>
            <div className="login-benefits-dots">
              {BENEFITS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`login-benefits-dot${i === benefitIdx ? ' active' : ''}`}
                  onClick={() => { setBenefitIdx(i); setBenefitVisible(true) }}
                  aria-label={`Benefit ${i + 1}`}
                />
              ))}
            </div>
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
                onClick={() => {
                  setRole('admin')
                  resetAuthState()
                }}
              >
                <div className="login-role-icon"><IcoShield /></div>
                <div className="login-role-name">Admin</div>
                <div className="login-role-sub">Super Admin Access</div>
              </button>
              <button
                type="button"
                className={`login-role-btn${role === 'employee' ? ' active' : ''}`}
                onClick={() => {
                  setRole('employee')
                  resetAuthState()
                }}
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
                    <label className="login-label">Full Name</label>
                    <div className="login-input-wrap">
                      <input className="login-input" type="text" placeholder="Enter full name" value={name} onChange={e => {
  setName(e.target.value)
  setError('')
}} />
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
                    onChange={e => {
                      setEmail(e.target.value)
                      setError('')
                    }}
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
                    onChange={e => {
                      setPassword(e.target.value)
                      setError('')
                    }}
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

              {isRegister && (
                <div className="login-field">
                  <label className="login-label">Confirm Password</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon"><IcoLock /></span>
                    <input
                      className="login-input"
                      type={showConfirmPw ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={e => {
                        setConfirmPassword(e.target.value)
                        setError('')
                      }}
                      required
                      autoComplete="new-password"
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      className="login-pw-toggle"
                      onClick={() => setShowConfirmPw(s => !s)}
                      aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                    >
                       <IcoEye show={showConfirmPw} />
    </button>
  </div>

  {/* ✅ FIX: inline validation message goes HERE */}
  {confirmPassword.length > 0 && password !== confirmPassword && (
    <div className="login-error">
      Passwords do not match
    </div>
  )}
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
                  Already have an account?
                  <button type="button" className="login-register-link" onClick={() => {
 setIsRegister(false)
 resetAuthState()
}}>
                    Login
                  </button>
                </>
              ) : (
                role === 'employee' && (
                  <>
                    Don&apos;t have an account?
                    <button type="button" className="login-register-link" onClick={() => {
  setIsRegister(true)
  resetAuthState()
}}>
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
