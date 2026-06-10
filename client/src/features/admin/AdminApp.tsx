import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminSidebar from '../../features/admin/components/AdminSidebar'
import AdminNavbar from '../../features/admin/components/AdminNavbar'
import AdminDashboard from './AdminDashboard'
import EmployeesPage from './pages/EmployeesPage'
import ReportsPage from '../../features/admin/pages/ReportsPage'
import TargetsPage from '../../features/admin/pages/TargetsPage'
import AdminSettingsPage from '../../features/admin/pages/AdminSettingsPage'
import AdminAnnouncementsPage from '../../features/admin/pages/AnnouncementsPage'
import AnalyticsPage from '../../features/admin/pages/AnalyticsPage'

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
      return <ReportsPage onNavigate={onNavigate} initialTab="reports" />
    case 'targets':
      return <TargetsPage />
    case 'announcements':
      return <AdminAnnouncementsPage />
    case 'analytics':
      return <AnalyticsPage />
    case 'settings':
      return <AdminSettingsPage onBack={() => onNavigate('dashboard')} />
    default:
      return <AdminDashboard onNavigate={onNavigate} />
  }
}

export default function AdminApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const adminPage = location.pathname.replace(/^\/superadmin\/?/, '').split('/')[0] || 'dashboard'

  function handleNavigate(page: string) {
    navigate(`/superadmin/${page}`, { replace: true })
    setSidebarOpen(false)
  }

  function handleSearch(q: string) {
    setEmployeeSearch(q)
    navigate('/superadmin/employees', { replace: true })
  }

  return (
    <div className="layout">
      <AdminSidebar active={adminPage} onNav={handleNavigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <AdminNavbar
          page={adminPage}
          onNavigate={handleNavigate}
          searchQuery={employeeSearch}
          onSearchChange={handleSearch}
          onMenuClick={() => setSidebarOpen((o) => !o)}
        />
        <AdminPageContent
          page={adminPage}
          onNavigate={handleNavigate}
          employeeSearch={employeeSearch}
        />
      </div>
    </div>
  )
}
