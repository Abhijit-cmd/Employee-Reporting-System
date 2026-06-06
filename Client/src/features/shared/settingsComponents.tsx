// Shared settings UI components used by both Employee and Admin settings pages

import { useTheme } from '../../hooks/useTheme'

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

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ icon, title, sub, iconBg, iconColor }: {
  icon: React.ReactNode
  title: string
  sub: string
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="st-section-header">
      <div className="st-section-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <div>
        <div className="st-section-title">{title}</div>
        <div className="st-section-sub">{sub}</div>
      </div>
    </div>
  )
}

// ── Appearance card (Light / Dark toggle) ─────────────────────────────────────
function IcoPalette() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20c-2.76 0-5-2.24-5-5 0-1.1.9-2 2-2h6a2 2 0 0 0 2-2 7 7 0 0 0-7-7"/></svg>
}
function IcoSun() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
}
function IcoMoon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}

export function ThemeModeCard() {
  const { mode, setTheme } = useTheme()
  return (
    <div className="card st-card">
      <SectionHeader
        icon={<IcoPalette />}
        title="Appearance Settings"
        sub="Customize your experience"
        iconBg="#d1fae5"
        iconColor="#10b981"
      />
      <div className="st-card-body">
        <div className="st-appear-row">
          <div>
            <div className="st-appear-label">Theme Mode</div>
            <div className="st-appear-sub">Choose your preferred theme</div>
          </div>
          <div className="st-theme-btns">
            <button
              type="button"
              className={`st-theme-btn${mode === 'light' ? ' active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <IcoSun /> Light
            </button>
            <button
              type="button"
              className={`st-theme-btn${mode === 'dark' ? ' active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <IcoMoon /> Dark
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
