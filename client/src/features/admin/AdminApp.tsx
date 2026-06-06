import { useState } from 'react'
import AdminSidebar from '../../features/admin/components/AdminSidebar'
import AdminNavbar from '../../features/admin/components/AdminNavbar'
import AdminDashboard from './AdminDashboard'
import EmployeesPage from './pages/EmployeesPage'
import ReportsPage from '../../features/admin/pages/ReportsPage'
import TargetsPage from '../../features/admin/pages/TargetsPage'
import AdminSettingsPage from '../../features/admin/pages/AdminSettingsPage'

function AdminPageContent({
  page,
  onNavigate,
  employeeSearch,
}: {
  page: string
  onNavigate: (p: string) => void
  employeeSearch: string
}) {
  switch (page) {
    case 'employees':
      return <EmployeesPage onNavigate={onNavigate} initialSearch={employeeSearch} />
    case 'reports':
    case 'pending-reports':
    case 'export-reports':
      return <ReportsPage onNavigate={onNavigate} />
    case 'targets':
      return <TargetsPage />
    case 'settings':
      return <AdminSettingsPage onBack={() => onNavigate('dashboard')} />
    default:
      return <AdminDashboard onNavigate={onNavigate} />
  }
}

export default function AdminApp() {
  const [adminPage, setAdminPage] = useState('dashboard')
  const [employeeSearch, setEmployeeSearch] = useState('')

  function handleSearch(q: string) {
    setEmployeeSearch(q)
    if (adminPage !== 'employees') {
      setAdminPage('employees')
    }
  }

  return (
    <div className="layout">
      <AdminSidebar active={adminPage} onNav={setAdminPage} />
      <div className="main-wrapper">
        <AdminNavbar
          page={adminPage}
          onNavigate={setAdminPage}
          searchQuery={employeeSearch}
          onSearchChange={handleSearch}
        />
        <AdminPageContent
          page={adminPage}
          onNavigate={setAdminPage}
          employeeSearch={employeeSearch}
        />
      </div>
    </div>
  )
}
