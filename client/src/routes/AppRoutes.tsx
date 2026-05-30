import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminApp from '../pages/admin/AdminApp'
import EmployeeApp from '../pages/employee/EmployeeApp'

function decodeToken(token: string): { exp?: number; role?: { roleName?: string } } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function getAuthState(): { valid: boolean; roleName: string | null } {
  const token = localStorage.getItem('token')
  if (!token) return { valid: false, roleName: null }

  const payload = decodeToken(token)
  if (!payload) return { valid: false, roleName: null }

  // Check expiry
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return { valid: false, roleName: null }
  }

  return { valid: true, roleName: payload.role?.roleName ?? null }
}

function RequireAuth({ children, role }: { children: JSX.Element; role: 'Admin' | 'Employee' }) {
  const { valid, roleName } = getAuthState()
  if (!valid) return <Navigate to="/login" replace />
  if (roleName !== role) return <Navigate to="/login" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"           element={<Navigate to="/login" replace />} />
      <Route path="/login"      element={<LoginPage />} />
      <Route path="/superadmin" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={<RequireAuth role="Admin"><AdminApp /></RequireAuth>}
      />
      <Route
        path="/employee/dashboard"
        element={<RequireAuth role="Employee"><EmployeeApp /></RequireAuth>}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
