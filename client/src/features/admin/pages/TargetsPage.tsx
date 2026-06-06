import { useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import type { Target, ApiEmployee } from '../../../types'

type FormState = {
  userId: string
  title: string
  description: string
  targetValue: string
  month: string
}

const EMPTY_FORM: FormState = { userId: '', title: '', description: '', targetValue: '', month: '' }

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function monthLabel(m: string): string {
  if (!m) return ''
  if (/^\d{2}$/.test(m)) {
    const idx = parseInt(m, 10)
    if (idx >= 1 && idx <= 12) return MONTH_NAMES[idx - 1]
  }
  return m
}

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([])
  const [employees, setEmployees] = useState<ApiEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  async function load() {
    setLoading(true)
    try {
      const [targetsData, empData] = await Promise.all([
        apiFetch<Target[]>('/api/admin/targets'),
        apiFetch<ApiEmployee[]>('/api/auth/employees'),
      ])
      if (!mountedRef.current) return
      setTargets(Array.isArray(targetsData) ? targetsData : [])
      setEmployees(Array.isArray(empData) ? empData : [])
    } catch (err) {
      if (!mountedRef.current) return
      showToast(err instanceof Error ? err.message : 'Failed to load', 'error')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const rows = useMemo(() => {
    return targets.map((t) => {
      const targetValue = Number(t.targetValue) || 0
      const achievedValue = Number(t.achievedValue) || 0
      const progress = targetValue > 0 ? achievedValue / targetValue : 0
      const achieved = targetValue > 0 && achievedValue >= targetValue
      return { t, targetValue, achievedValue, progress, achieved }
    })
  }, [targets])

  async function handleCreate() {
    if (submitting) return
    if (!form.userId) { showToast('Please select an employee', 'error'); return }
    if (!form.title.trim()) { showToast('Title is required', 'error'); return }
    if (!form.month) { showToast('Month is required', 'error'); return }
    const tv = Number(form.targetValue)
    if (!Number.isFinite(tv) || tv <= 0) { showToast('Target Value must be a positive number', 'error'); return }

    const [yearStr, monthStr] = form.month.split('-')
    const year = Number(yearStr)
    if (!Number.isFinite(year) || !monthStr) { showToast('Month is invalid', 'error'); return }

    setSubmitting(true)
    try {
      await apiFetch('/api/admin/targets', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: form.userId,
          targetTitle: form.title.trim(),
          description: form.description.trim() || null,
          targetValue: tv,
          targetMonth: monthStr,
          targetYear: year,
        }),
      })
      showToast('Target created', 'success')
      setShowForm(false)
      setForm(EMPTY_FORM)
      await load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create target', 'error')
    } finally {
      if (mountedRef.current) setSubmitting(false)
    }
  }

  const selectedEmp = employees.find((e) => String(e.id) === form.userId)

  return (
    <main className="page-content">
      <div className="card tg-card">
        <div className="tg-topbar">
          <div className="emp-page-heading">Targets</div>
          <button className="tg-add-btn" type="button" onClick={() => setShowForm((s) => !s)}>
            Add Target
          </button>
        </div>

        {showForm && (
          <div className="tg-form">
            <div className="tg-form-grid">

              {/* Employee dropdown */}
              <div className="st-field">
                <label className="st-label">Employee</label>
                <div className="emp-select-wrap" style={{ position: 'relative' }}>
                  <select
                    className="st-input"
                    value={form.userId}
                    onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                    style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
                  >
                    <option value="">— Select employee —</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={String(emp.id)}>
                        {emp.name} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {selectedEmp && (
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    {selectedEmp.email} · {selectedEmp.status}
                  </div>
                )}
              </div>

              <div className="st-field">
                <label className="st-label">Title</label>
                <input
                  className="st-input"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Increase customer registrations"
                />
              </div>

              <div className="st-field tg-desc">
                <label className="st-label">Description</label>
                <textarea
                  className="tg-textarea"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Optional details about this target…"
                />
              </div>

              <div className="st-field">
                <label className="st-label">Target Value</label>
                <input
                  className="st-input"
                  type="number"
                  value={form.targetValue}
                  onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))}
                  min={0.01}
                  step="0.01"
                  placeholder="e.g. 100"
                />
              </div>

              <div className="st-field">
                <label className="st-label">Month</label>
                <input
                  className="st-input"
                  type="month"
                  value={form.month}
                  onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))}
                  onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                />
              </div>
            </div>

            <div className="tg-form-actions">
              <button className="st-btn-outline" type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}>
                Cancel
              </button>
              <button className="st-btn-outline" type="button" onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ padding: 16, color: 'var(--text-muted)' }}>Loading targets…</p>
        ) : (
          <div className="tg-table-wrap">
            <table className="reports-table tg-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Target Value</th>
                  <th>Achieved Value</th>
                  <th>Month + Year</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                      No targets found.
                    </td>
                  </tr>
                ) : (
                  rows.map(({ t, progress, achieved }) => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.employee?.name ?? '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.employee?.employeeId ?? ''}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.targetTitle}</td>
                      <td className="tg-desc-cell">{t.description ?? '—'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{t.targetValue}</td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {t.achievedValue}{' '}
                        <span className="tg-progress">({Math.round((Number.isFinite(progress) ? progress : 0) * 100)}%)</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {monthLabel(t.targetMonth)} {t.targetYear}
                      </td>
                      <td>
                        <span className={`status-badge ${achieved ? 'tg-achieved' : 'tg-pending'}`}>
                          {achieved ? 'Achieved' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
