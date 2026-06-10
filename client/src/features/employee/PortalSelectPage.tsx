import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../../lib/auth'
import LogoutButton from '../shared/LogoutButton'
import { IconFileText, IconAward } from '../shared/icons'
import '../../styles/login.css'
import '../../styles/portal-select.css'

export default function PortalSelectPage() {
  const navigate = useNavigate()
  const user = getStoredUser()

  return (
    <div className="login-page">
      <div className="portal-select-container">
        <img src="/logo.png" alt="ConstroMat" className="portal-select-logo" />
        <h1 className="portal-select-title">Welcome back, {user?.name ?? 'there'}!</h1>
        <p className="portal-select-sub">What would you like to work on today?</p>

        <div className="portal-select-grid">
          <button
            type="button"
            className="portal-select-card"
            onClick={() => navigate('/employee/dashboard', { replace: true })}
          >
            <div className="portal-select-icon"><IconFileText /></div>
            <div className="portal-select-card-title">Monthly Report</div>
            <div className="portal-select-card-desc">
              Submit monthly reports, track your targets and view your achievements.
            </div>
          </button>

          <button
            type="button"
            className="portal-select-card"
            onClick={() => navigate('/employee/yearly-report', { replace: true })}
          >
            <div className="portal-select-icon"><IconAward /></div>
            <div className="portal-select-card-title">Yearly Report</div>
            <div className="portal-select-card-desc">
              View the yearly targets set for you this year.
            </div>
          </button>
        </div>

        <LogoutButton />
      </div>
    </div>
  )
}
