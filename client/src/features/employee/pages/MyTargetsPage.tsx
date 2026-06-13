import { useState, useEffect } from 'react'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { monthLabel } from '../../../lib/utils'

interface Target {
  id: number
  targetTitle: string
  description: string | null
  targetValue: number
  achievedValue: number
  targetMonth: string | null
  targetYear: number
  createdAt: string
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const color = pct >= 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#c62828'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
        <span>{value} / {max}</span>
        <span style={{ color, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function UpdateModal({ target, onClose, onSaved }: {
  target: Target
  onClose: () => void
  onSaved: (updated: Target) => void
}) {
  const [value, setValue] = useState(String(target.achievedValue))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const num = Number(value)
    if (!Number.isFinite(num) || num < 0) { showToast('Enter a valid number', 'error'); return }
    setSaving(true)
    try {
      const res = await apiFetch<{ target: Target }>(`/api/reports/my-targets/${target.id}/achieve`, {
        method: 'PATCH',
        body: JSON.stringify({ achievedValue: num }),
      })
      showToast('Progress updated', 'success')
      onSaved(res.target)
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 380, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Update Progress</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{target.targetTitle}</div>

        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
          Achieved Value <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(target: {target.targetValue})</span>
        </label>
        <input
          className="form-input"
          type="number"
          min={0}
          max={target.targetValue * 2}
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          style={{ marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="cnr-btn-draft" type="button" onClick={onClose}>Cancel</button>
          <button className="btn-primary" type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Progress'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyTargetsPage() {
  const [targets, setTargets] = useState<Target[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Target | null>(null)

  useEffect(() => {
    let cancelled = false
    apiFetch<Target[]>('/api/reports/my-targets')
      .then((data) => { if (!cancelled) setTargets(Array.isArray(data) ? data : []) })
      .catch((err) => showToast(err instanceof Error ? err.message : 'Failed to load', 'error'))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function handleSaved(updated: Target) {
    setTargets((prev) => prev.map((t) => t.id === updated.id ? updated : t))
  }

  return (
    <main className="page-content">
      {editing && <UpdateModal target={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="emp-page-topbar" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
          <div>
            <div className="emp-page-heading">My Targets</div>
            <div className="emp-page-sub">
              {loading ? 'Loading…' : `${targets.length} target${targets.length !== 1 ? 's' : ''} assigned`}
            </div>
          </div>
        </div>

        {loading && <p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading targets…</p>}

        {!loading && targets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🎯</div>
            <p style={{ fontWeight: 600, margin: 0 }}>No targets assigned yet.</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Your admin will assign targets here.</p>
          </div>
        )}

        {!loading && targets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {targets.map((t, i) => {
              const pct = t.targetValue > 0 ? Math.min(100, Math.round((t.achievedValue / t.targetValue) * 100)) : 0
              const done = pct >= 100
              return (
                <div
                  key={t.id}
                  style={{
                    padding: '20px 24px',
                    borderBottom: i < targets.length - 1 ? '1px solid var(--border-color, #e5e7eb)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{t.targetTitle}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: done ? '#d1fae5' : '#fef3c7',
                          color: done ? '#065f46' : '#92400e',
                        }}>
                          {done ? 'Achieved' : 'In Progress'}
                        </span>
                      </div>
                      {t.description && (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.5 }}>{t.description}</p>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        {t.targetMonth ? `${monthLabel(t.targetMonth)} ${t.targetYear}` : `Yearly ${t.targetYear}`}
                      </div>
                      <ProgressBar value={t.achievedValue} max={t.targetValue} />
                    </div>

                    <button
                      type="button"
                      className="btn-primary"
                      style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                      onClick={() => setEditing(t)}
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
