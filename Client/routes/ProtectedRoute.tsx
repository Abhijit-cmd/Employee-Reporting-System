import { Navigate } from 'react-router-dom'
import { getToken, getStoredUser, isTokenExpired, isAdmin, isEmployee } from '../src/lib/auth'

interface Props {
  role: 'admin' | 'employee'
  children: React.ReactNode
}

export default function ProtectedRoute({ role, children }: Props) {
  const token = getToken()
  const user = getStoredUser()

  if (!token || isTokenExpired(token) || !user) {
    return <Navigate to="/login" replace />
  }

  if (role === 'admin' && !isAdmin(user)) {
    return <Navigate to="/employee/dashboard" replace />
  }

  if (role === 'employee' && !isEmployee(user)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <>{children}</>
}
