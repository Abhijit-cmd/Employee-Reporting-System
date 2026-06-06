import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../src/features/shared/LoginPage'
import AdminApp from '../src/features/admin/AdminApp'
import EmployeeApp from '../src/features/employee/EmployeeApp'
import RoleProtectedRoute from './RoleProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin — matches /admin/dashboard and any sub-path */}
      <Route
        path="/admin/*"
        element={
          <RoleProtectedRoute role="Admin">
            <AdminApp />
          </RoleProtectedRoute>
        }
      />

      {/* Employee — matches /employee/dashboard and any sub-path */}
      <Route
        path="/employee/*"
        element={
          <RoleProtectedRoute role="Employee">
            <EmployeeApp />
          </RoleProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
