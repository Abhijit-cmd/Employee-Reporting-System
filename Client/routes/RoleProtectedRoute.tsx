import { Navigate } from 'react-router-dom'
import { getToken, isTokenExpired } from '../src/lib/auth'

interface Props {
  children: React.ReactNode
  role: string
}

/**
 * Redirects to /login if:
 * - No accessToken in localStorage
 * - Token is expired
 * - Stored user's role does not match the required role
 */
export default function RoleProtectedRoute({ children, role }: Props) {
  const token = getToken()

  // No token or expired → force login
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />
  }

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userRole =
      typeof user.role === 'string'
        ? user.role
        : user.role?.roleName ?? ''

    if (userRole.toLowerCase() !== role.toLowerCase()) {
      return <Navigate to="/login" replace />
    }
  } catch {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
