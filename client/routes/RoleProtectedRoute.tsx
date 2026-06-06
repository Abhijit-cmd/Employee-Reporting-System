import { Navigate } from 'react-router-dom'
import { getStoredUser, hasActiveSession, isAdmin, isEmployee } from '../src/lib/auth'

interface Props {
  children: React.ReactNode
  role: 'Admin' | 'Employee'
}

export default function RoleProtectedRoute({ children, role }: Props) {
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
