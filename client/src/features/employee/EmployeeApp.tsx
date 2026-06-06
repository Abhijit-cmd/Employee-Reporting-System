import { useState } from 'react'
import EmployeeSidebar from './components/EmployeeSidebar'
import EmployeeNavbar from './components/EmployeeNavbar'
import EmployeeDashboard from '../../features/employee/EmployeeDashboard'
import CreateNewReport from './pages/CreateNewReport'
import SettingsPage from './pages/SettingsPage'
import MonthlyReportsPage from './pages/MonthlyReportsPage'
import AchievementsPage from './pages/AchievementsPage'
import NotificationsPage from './pages/NotificationsPage'
import AnnouncementsPage from './pages/AnnouncementsPage'

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
    default:
      return <EmployeeDashboard onNavigate={onNavigate} />
  }
}

export default function EmployeeApp() {
  const [empPage, setEmpPage] = useState('home')

  return (
    <div className="layout">
      <EmployeeSidebar active={empPage} onNav={setEmpPage} />
      <div className="main-wrapper">
        <EmployeeNavbar page={empPage} onNavigate={setEmpPage} />
        <EmployeePageContent page={empPage} onNavigate={setEmpPage} />
      </div>
    </div>
  )
}
