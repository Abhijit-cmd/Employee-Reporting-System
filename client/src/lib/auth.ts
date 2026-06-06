import type { StoredUser } from '../types'
import { apiFetch } from './api'
import { safeSetItem, safeGetItem, safeRemoveItem } from './utils'

// Keys must match what LoginPage stores
const USER_KEY = 'user'
let refreshInterval: NodeJS.Timeout | null = null

// Function to refresh tokens
async function refreshTokens(): Promise<boolean> {
  try {
    await apiFetch('/api/auth/refresh', {
      method: 'POST',
    })
    return true
  } catch (error) {
    console.error('Token refresh failed:', error)
    return false
  }
}

// Function to start proactive refresh
function startProactiveRefresh(): void {
  // Clear existing interval if any
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }

  // Run check every 10 minutes (600,000 ms)
  refreshInterval = setInterval(async () => {
    if (getStoredUser()) {
      const success = await refreshTokens()
      if (!success) {
        // If refresh fails, try once more
        const retrySuccess = await refreshTokens()
        if (!retrySuccess) {
          logout()
        }
      }
    }
  }, 10 * 60 * 1000)
}

// Stop proactive refresh
function stopProactiveRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

export function saveUser(user: StoredUser): void {
  safeSetItem(USER_KEY, JSON.stringify(user))
  startProactiveRefresh()
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = safeGetItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Basic validation
    if (!parsed || typeof parsed !== 'object' || !parsed.role) {
      console.warn('Corrupted user in localStorage, clearing it')
      clearSession()
      return null
    }
    return parsed as StoredUser
  } catch (e) {
    console.warn('Corrupted user in localStorage, clearing it', e)
    clearSession()
    return null
  }
}

export function clearSession(): void {
  safeRemoveItem(USER_KEY)
  stopProactiveRefresh()
}

export async function logout(): Promise<void> {
  stopProactiveRefresh()
  try {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    // Ignore errors
  } finally {
    clearSession()
    window.location.href = '/login'
  }
}

export function isAdmin(user: any): boolean {
  if (!user) return false
  const role = typeof user?.role === 'string' 
    ? user.role 
    : user?.role?.roleName ?? ''
  return role.toLowerCase() === 'admin'
}

export function isEmployee(user: any): boolean {
  if (!user) return false
  const role = typeof user?.role === 'string' 
    ? user.role 
    : user?.role?.roleName ?? ''
  return role.toLowerCase() === 'employee'
}

export function hasActiveSession(): boolean {
  return getStoredUser() !== null
}

// Initialize proactive refresh on app load if user is already logged in
if (typeof window !== 'undefined' && getStoredUser()) {
  startProactiveRefresh()
}
