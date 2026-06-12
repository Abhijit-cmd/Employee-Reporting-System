import { useState } from 'react'
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
  reportId,
  onNavigate,
}: {
  page: string
  reportId?: string
  onNavigate: (p: string) => void
}) {
  switch (page) {
    case 'create-report':
      return <CreateNewReport reportId={reportId} onBack={() => onNavigate('home')} />
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pathParts = location.pathname.replace(/^\/employee\/?/, '').split('/')
  const empPage = pathParts[0] || 'home'
  const reportId = pathParts[1]

  function handleNavigate(page: string) {
    navigate(`/employee/${page}`, { replace: true })
    setSidebarOpen(false)
  }

  return (
    <div className="layout">
      <EmployeeSidebar active={empPage} onNav={handleNavigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <EmployeeNavbar page={empPage} onNavigate={handleNavigate} onMenuClick={() => setSidebarOpen((o) => !o)} />
        <EmployeePageContent page={empPage} reportId={reportId} onNavigate={handleNavigate} />
      </div>
    </div>
  )
}
