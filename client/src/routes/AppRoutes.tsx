import { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getStoredUser, hasActiveSession, isAdmin, isEmployee } from '../lib/auth'
import LoginPage from '../features/shared/LoginPage'
import AdminApp from '../features/admin/AdminApp'
import EmployeeApp from '../features/employee/EmployeeApp'

// ── GUARD ─────────────────────────────────────────────────────────────────────

interface GuardProps {
  children: ReactNode
  role: 'Admin' | 'Employee'
}

function RoleProtectedRoute({ children, role }: GuardProps) {
  const user = getStoredUser()

  if (!hasActiveSession() || !user) {
    return <Navigate to="/login" replace />
  }

  if (role === 'Admin' && !isAdmin(user)) {
    return <Navigate to="/employee/dashboard" replace />
  }

  if (role === 'Employee' && !isEmployee(user)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <>{children}</>
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

export default function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC ── no auth required */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ADMIN ── requires Admin role */}
      <Route
        path="/admin/*"
        element={
          <RoleProtectedRoute role="Admin">
            <AdminApp />
          </RoleProtectedRoute>
        }
      />

      {/* EMPLOYEE ── requires Employee role */}
      <Route
        path="/employee/*"
        element={
          <RoleProtectedRoute role="Employee">
            <EmployeeApp />
          </RoleProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  )
}
