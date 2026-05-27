import { useState, useEffect } from 'react'
import { getTheme, setTheme, subscribeTheme } from '../store/themeStore'

export type ThemeMode = 'light' | 'dark'

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(getTheme())

  useEffect(() => {
    const unsub = subscribeTheme(m => setMode(m))
    return unsub
  }, [])

  function toggle(m: ThemeMode) {
    localStorage.setItem('theme', m)
    setTheme(m)
  }

  return { mode, setTheme: toggle }
}
