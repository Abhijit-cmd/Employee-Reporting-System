import { API_BASE_URL } from '../config'
import { logout } from './auth'
import { showToast } from './feedback'

interface FetchOptions extends RequestInit {
  body?: BodyInit | null
}

async function tryRefreshTokens(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

// Global error handler function
function handleGlobalError(error: unknown, path: string) {
  console.error(`API Error for ${path}:`, error)
  // Show toast for errors, except 401 which we already handle with logout
  if (
    error instanceof Error &&
    !error.message.includes('Session expired') &&
    !error.message.includes('aborted')
  ) {
    showToast(error.message, 'error')
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/**
 * Authenticated fetch wrapper.
 * - Prepends API_BASE_URL to relative paths
 * - Uses httpOnly cookies for auth
 * - Handles standard { success, data } response format
 * - Supports AbortController for request cancellation
 * - Throws on non-2xx with the server's error message
 * - Auto-logs out on 401 after trying refresh
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions & { signal?: AbortSignal } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Critical: includes httpOnly cookies
  })

  if (response.status === 401) {
    // Try to refresh tokens first
    const refreshSuccess = await tryRefreshTokens()
    if (refreshSuccess) {
      // Retry the original request
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })
    } else {
      logout()
      throw new Error('Session expired. Please sign in again.')
    }
  }

  // Handle 403 errors
  if (response.status === 403) {
    let errorMsg = 'Access denied.'
    if (response.headers.get('content-type')?.includes('application/json')) {
      const err = await response.json()
      errorMsg = err.message ?? errorMsg
    }
    showToast(errorMsg, 'error')
    throw new Error(errorMsg)
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`
    if (contentType.includes('application/json')) {
      const err = await response.json()
      errorMsg = err.message ?? errorMsg
    }
    handleGlobalError(errorMsg, path)
    throw new Error(errorMsg)
  }

  if (contentType.includes('application/json')) {
    const json = await response.json()
    // Check for standard { success, data } format
    if (json && typeof json === 'object' && 'success' in json) {
      if (!json.success) {
        const errorMsg = json.message || 'Request failed'
        handleGlobalError(errorMsg, path)
        throw new Error(errorMsg)
      }
      return json.data as T
    }
    // If not standard format, just return the json directly for backward compatibility
    return json as T
  }

  return response.text() as unknown as T
}
