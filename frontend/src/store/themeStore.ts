// ── Global theme store (no React context needed) ──────────────────────────────
// Applies data-theme attribute to <html> so CSS variables cascade everywhere.

type ThemeMode = 'light' | 'dark'

let _mode: ThemeMode = 'light'
const _listeners: Array<(m: ThemeMode) => void> = []

function apply(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
}

export function getTheme(): ThemeMode {
  return _mode
}

export function setTheme(mode: ThemeMode) {
  _mode = mode
  apply(mode)
  _listeners.forEach(fn => fn(mode))
}

export function subscribeTheme(fn: (m: ThemeMode) => void): () => void {
  _listeners.push(fn)
  return () => {
    const i = _listeners.indexOf(fn)
    if (i !== -1) _listeners.splice(i, 1)
  }
}

// Apply on load (respects saved preference)
const saved = localStorage.getItem('theme') as ThemeMode | null
if (saved === 'dark' || saved === 'light') {
  _mode = saved
}
apply(_mode)
