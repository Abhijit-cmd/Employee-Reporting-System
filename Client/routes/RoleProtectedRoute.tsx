import { Navigate } from 'react-router-dom'
import { getStoredUser, hasActiveSession, isAdmin, isEmployee } from '../src/lib/auth'

interface Props {
  children: React.ReactNode
  role: 'admin' | 'employee'
}

export default function RoleProtectedRoute({ children, role }: Props) {
  console.log('RoleProtectedRoute called with role:', role)
  const user = getStoredUser()
  console.log('RoleProtectedRoute user:', user)

  if (!hasActiveSession() || !user) {
    console.log('RoleProtectedRoute: No active session, navigating to login')
    return <Navigate to="/login" replace />
  }

  if (role === 'admin' && !isAdmin(user)) {
    console.log('RoleProtectedRoute: Not admin, navigating to employee dashboard')
    return <Navigate to="/employee/dashboard" replace />
  }

  if (role === 'employee' && !isEmployee(user)) {
    console.log('RoleProtectedRoute: Not employee, navigating to admin dashboard')
    return <Navigate to="/admin/dashboard" replace />
  }

  console.log('RoleProtectedRoute: Allowing access')
  return <>{children}</>
}