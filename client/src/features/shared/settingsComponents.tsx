import { useEffect, useState } from 'react'

// ── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`st-toggle${checked ? ' st-toggle-on' : ''}`}
    >
      <span className="st-toggle-thumb" />
    </button>
  )
}

type ThemeMode = 'light' | 'dark'

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || saved === 'light' ? saved : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="st-theme-top">
      <div className="st-theme-btns">
        <button
          type="button"
          className={`st-theme-btn${theme === 'light' ? ' active' : ''}`}
          onClick={() => setTheme('light')}
        >
          Light
        </button>
        <button
          type="button"
          className={`st-theme-btn${theme === 'dark' ? ' active' : ''}`}
          onClick={() => setTheme('dark')}
        >
          Dark
        </button>
      </div>
    </div>
  )
}
