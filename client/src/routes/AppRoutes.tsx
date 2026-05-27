import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import AdminApp from '../pages/admin/AdminApp'
import EmployeeApp from '../pages/employee/EmployeeApp'

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<RequireAuth><AdminApp /></RequireAuth>} />
      <Route path="/employee/dashboard" element={<RequireAuth><EmployeeApp /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
