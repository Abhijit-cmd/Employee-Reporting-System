import { useState } from 'react'
import { ToastContainer } from '../../lib/feedback'
import AdminSidebar from '../../features/admin/components/AdminSidebar'
import AdminNavbar from '../../features/admin/components/AdminNavbar'
import AdminDashboard from '../../features/admin/pages/AdminDashboard'
import EmployeesPage from '../../features/admin/pages/EmployeesPage'
import ReportsPage from '../../features/admin/pages/ReportsPage'
import AdminSettingsPage from '../../features/admin/pages/AdminSettingsPage'

function AdminPageContent({ page, onNavigate }: { page: string; onNavigate: (p: string) => void }) {
  switch (page) {
    case 'employees':
      return <EmployeesPage onNavigate={onNavigate} />
    case 'reports':
    case 'pending-reports':
    case 'export-reports':
      return <ReportsPage onNavigate={onNavigate} />
    case 'settings':
      return <AdminSettingsPage onBack={() => onNavigate('dashboard')} />
    default:
      return <AdminDashboard onNavigate={onNavigate} />
  }
}

export default function AdminApp() {
  const [adminPage, setAdminPage] = useState('dashboard')

  return (
    <div className="layout">
      <ToastContainer />
      <AdminSidebar active={adminPage} onNav={setAdminPage} />
      <div className="main-wrapper">
        <AdminNavbar page={adminPage} onNavigate={setAdminPage} />
        <AdminPageContent page={adminPage} onNavigate={setAdminPage} />
      </div>
    </div>
  )
}
