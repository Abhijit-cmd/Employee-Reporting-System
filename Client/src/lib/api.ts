import { API_BASE_URL } from '../config'
import { getToken, logout } from './auth'

interface FetchOptions extends RequestInit {
  body?: BodyInit | null
}

/**
 * Authenticated fetch wrapper.
 * - Prepends API_BASE_URL to relative paths
 * - Attaches the JWT accessToken as a Bearer header
 * - Parses JSON responses
 * - Throws on non-2xx with the server's error message
 * - Auto-logs out on 401
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    logout()
    throw new Error('Session expired. Please sign in again.')
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const err = await response.json()
      throw new Error(err.message ?? `Request failed with status ${response.status}`)
    }
    throw new Error(`Request failed with status ${response.status}`)
  }

  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>
  }

  return response.text() as unknown as T
}
