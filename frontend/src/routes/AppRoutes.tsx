import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import AdminApp from '../pages/admin/AdminApp'
import EmployeeApp from '../pages/employee/EmployeeApp'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin dashboard (all sub-pages handled internally) */}
      <Route path="/admin/dashboard" element={<AdminApp />} />

      {/* Employee dashboard (all sub-pages handled internally) */}
      <Route path="/employee/dashboard" element={<EmployeeApp />} />

      {/* Catch-all → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
