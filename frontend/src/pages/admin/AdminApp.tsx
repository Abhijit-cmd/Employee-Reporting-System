import { useState } from 'react'
import AdminSidebar from '../../features/admin/components/AdminSidebar'
import AdminNavbar from '../../features/admin/components/AdminNavbar'
import AdminDashboard from '../../features/admin/pages/AdminDashboard'
import EmployeesPage from '../../features/admin/pages/EmployeesPage'
import ReportsPage from '../../features/admin/pages/ReportsPage'

function AdminPageContent({ page, onNavigate }: { page: string; onNavigate: (p: string) => void }) {
  switch (page) {
    case 'employees':
      return <EmployeesPage onNavigate={onNavigate} />
    case 'reports':
    case 'pending-reports':
    case 'export-reports':
      return <ReportsPage onNavigate={onNavigate} />
    default:
      return <AdminDashboard onNavigate={onNavigate} />
  }
}

export default function AdminApp() {
  const [adminPage, setAdminPage] = useState('dashboard')

  return (
    <div className="layout">
      <AdminSidebar active={adminPage} onNav={setAdminPage} />
      <div className="main-wrapper">
        <AdminNavbar page={adminPage} onNavigate={setAdminPage} />
        <AdminPageContent page={adminPage} onNavigate={setAdminPage} />
      </div>
    </div>
  )
}
