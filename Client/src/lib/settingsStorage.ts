/**
 * Persists user preference settings to localStorage.
 * Only non-sensitive UI preferences are stored here (no tokens or secrets).
 */

const SETTINGS_KEY = 'app_settings'

export interface AppSettings {
  notifications?: boolean
  emailNotif?: boolean
  announceNotif?: boolean
  reportRemind?: boolean
}

/** Load saved settings. Returns an empty object if nothing is stored yet. */
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as AppSettings
  } catch {
    return {}
  }
}

/** Merge and persist settings. Existing keys not in the update are preserved. */
export function saveSettings(update: AppSettings): void {
  const current = loadSettings()
  const merged = { ...current, ...update }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged))
}

/** Clear all stored settings. */
export function clearSettings(): void {
  localStorage.removeItem(SETTINGS_KEY)
}
