import { useNavigate } from 'react-router-dom'
import { IconAward } from '../shared/icons'
import '../../styles/login.css'
import '../../styles/portal-select.css'

export default function AppraisalComingSoonPage() {
  const navigate = useNavigate()

  return (
    <div className="login-page">
      <div className="portal-select-container" style={{ maxWidth: 480 }}>
        <div className="portal-select-icon" style={{ width: 64, height: 64, margin: '0 auto 20px' }}>
          <IconAward />
        </div>
        <h1 className="portal-select-title">Yearly Target</h1>
        <p className="portal-select-sub">
          This feature is being built. Soon you'll be able to view the yearly targets set for you here.
        </p>
        <button
          type="button"
          className="login-submit"
          onClick={() => navigate('/employee/select', { replace: true })}
        >
          Back to Selection
        </button>
      </div>
    </div>
  )
}
