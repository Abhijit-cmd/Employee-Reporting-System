import type { ThemeMode } from '../hooks/useTheme'

type ThemeListener = (mode: ThemeMode) => void

let current: ThemeMode = (localStorage.getItem('theme') as ThemeMode) ?? 'light'
const listeners = new Set<ThemeListener>()

/** Apply the theme class to <html> */
function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

// Apply on load
applyTheme(current)

export function getTheme(): ThemeMode {
  return current
}

export function setTheme(mode: ThemeMode): void {
  current = mode
  localStorage.setItem('theme', mode)
  applyTheme(mode)
  listeners.forEach((fn) => fn(mode))
}

export function subscribeTheme(listener: ThemeListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
