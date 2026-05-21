import { useState } from 'react'
import EmployeeSidebar from '../../features/employee/components/EmployeeSidebar'
import EmployeeNavbar from '../../features/employee/components/EmployeeNavbar'
import EmployeeDashboard from '../../features/employee/pages/EmployeeDashboard'
import CreateNewReport from '../../features/employee/pages/CreateNewReport'
import SettingsPage from '../../features/employee/pages/SettingsPage'

function EmployeePageContent({ page, onNavigate }: { page: string; onNavigate: (p: string) => void }) {
  switch (page) {
    case 'create-report':
      return <CreateNewReport onBack={() => onNavigate('home')} />
    case 'settings':
      return <SettingsPage onBack={() => onNavigate('home')} />
    default:
      return <EmployeeDashboard onNavigate={onNavigate} />
  }
}

export default function EmployeeApp() {
  const [empPage, setEmpPage] = useState('home')

  function handleNavigate(page: string) {
    setEmpPage(page)
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
