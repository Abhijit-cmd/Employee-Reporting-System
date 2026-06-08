export function formatMmyyyy(mmyyyy: string): string {
  if (!mmyyyy || mmyyyy.length !== 6) return mmyyyy
  const month = mmyyyy.slice(0, 2)
  const year = mmyyyy.slice(2)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const monthIndex = Number(month) - 1
  if (monthIndex >= 0 && monthIndex <= 11) {
    return `${monthNames[monthIndex]} ${year}`
  }
  return mmyyyy
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString()
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function relativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function statusClass(status: string): string {
  switch (status) {
    case 'Submitted': return 'submitted'
    case 'Pending': return 'pending'
    default: return 'pending'
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    return false
  }
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    return null
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    // Ignore errors
  }
}
