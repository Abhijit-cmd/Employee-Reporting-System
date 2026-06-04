import type { StoredUser } from '../types'

const USER_KEY          = 'user'
const ACCESS_TOKEN_KEY  = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

interface JwtPayload {
  exp?: number
  id?: number
  role?: string
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 <= Date.now()
}

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function saveUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredUser
  } catch {
    clearSession()
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function logout(): void {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {})
  }
  clearSession()
  window.location.href = '/login'
}

export function getRoleName(user: StoredUser | null): string {
  if (!user) return ''
  const role = user.role
  return typeof role === 'string' ? role : role?.roleName ?? ''
}

export function isAdmin(user: StoredUser | null): boolean {
  return getRoleName(user).toLowerCase() === 'admin'
}

export function isEmployee(user: StoredUser | null): boolean {
  return getRoleName(user).toLowerCase() === 'employee'
}

export function hasActiveSession(): boolean {
  const token = getToken()
  if (!token || isTokenExpired(token)) return false
  return getStoredUser() !== null
}
