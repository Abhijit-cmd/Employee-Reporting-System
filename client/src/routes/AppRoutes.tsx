import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminApp from '../pages/admin/AdminApp'
import EmployeeApp from '../pages/employee/EmployeeApp'
import { getToken, isTokenExpired, getStoredUser, isAdmin, isEmployee } from '../lib/auth'

function RequireAdmin({ children }: { children: JSX.Element }) {
  const token = getToken()
  const user = getStoredUser()
  if (!token || isTokenExpired(token) || !user) return <Navigate to="/login" replace />
  if (!isAdmin(user)) return <Navigate to="/employee/dashboard" replace />
  return children
}

function RequireEmployee({ children }: { children: JSX.Element }) {
  const token = getToken()
  const user = getStoredUser()
  if (!token || isTokenExpired(token) || !user) return <Navigate to="/login" replace />
  if (!isEmployee(user)) return <Navigate to="/admin/dashboard" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/superadmin" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminApp /></RequireAdmin>} />
      <Route path="/employee/dashboard" element={<RequireEmployee><EmployeeApp /></RequireEmployee>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
