const SETTINGS_KEY = 'app_settings'

export interface AppSettings {
  notifications?: boolean
  emailNotif?: boolean
  announceNotif?: boolean
  reportRemind?: boolean
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as AppSettings
  } catch {
    return {}
  }
}

export function saveSettings(update: AppSettings): void {
  const merged = { ...loadSettings(), ...update }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged))
}

export function clearSettings(): void {
  localStorage.removeItem(SETTINGS_KEY)
}
