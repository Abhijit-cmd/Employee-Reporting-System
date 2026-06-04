import { API_BASE_URL } from '../config'
import { getToken } from './auth'

export async function downloadWithToken(path: string, filename?: string): Promise<void> {
  const token = getToken()
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const err = await response.json()
      throw new Error(err.message ?? `Download failed with status ${response.status}`)
    }
    throw new Error(`Download failed with status ${response.status}`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl

  if (filename) {
    anchor.download = filename
  } else {
    const disposition = response.headers.get('content-disposition') ?? ''
    const match = disposition.match(/filename="?([^";\n]+)"?/)
    anchor.download = match?.[1] ?? 'download.pdf'
  }

  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}
