import { useNavigate, useLocation } from 'react-router-dom'
import EmployeeSidebar from './components/EmployeeSidebar'
import EmployeeNavbar from './components/EmployeeNavbar'
import EmployeeDashboard from '../../features/employee/EmployeeDashboard'
import CreateNewReport from './pages/CreateNewReport'
import SettingsPage from './pages/SettingsPage'
import MonthlyReportsPage from './pages/MonthlyReportsPage'
import AchievementsPage from './pages/AchievementsPage'
import NotificationsPage from './pages/NotificationsPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import MyTargetsPage from './pages/MyTargetsPage'

function EmployeePageContent({
  page,
  onNavigate,
}: {
  page: string
  onNavigate: (p: string) => void
}) {
  switch (page) {
    case 'create-report':
      return <CreateNewReport onBack={() => onNavigate('home')} />
    case 'settings':
      return <SettingsPage onBack={() => onNavigate('home')} />
    case 'monthly-reports':
      return <MonthlyReportsPage onNavigate={onNavigate} />
    case 'achievements':
      return <AchievementsPage onNavigate={onNavigate} />
    case 'notifications':
      return <NotificationsPage />
    case 'announcements':
      return <AnnouncementsPage />
    case 'my-targets':
      return <MyTargetsPage />
    default:
      return <EmployeeDashboard onNavigate={onNavigate} />
  }
}

export default function EmployeeApp() {
  const location = useLocation()
  const navigate = useNavigate()

  const empPage = location.pathname.replace(/^\/employee\/?/, '').split('/')[0] || 'home'

  function handleNavigate(page: string) {
    navigate(`/employee/${page}`, { replace: true })
  }

  return (
    <div className="layout">
      <EmployeeSidebar active={empPage} onNav={handleNavigate} />
      <div className="main-wrapper">
        <EmployeeNavbar page={empPage} onNavigate={handleNavigate} />
        <EmployeePageContent page={empPage} onNavigate={handleNavigate} />
      </div>
    </div>
  )
}
