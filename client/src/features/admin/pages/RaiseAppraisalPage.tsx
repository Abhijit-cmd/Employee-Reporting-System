import { useState, useEffect, useMemo, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { getStoredUser, isLeadership } from '../../../lib/auth'
import type { KpiTemplate, Target } from '../../../types'
import {
  RATING_DEFINITIONS,
  RECOMMENDED_ACTIONS,
  weightedTotalScore,
  formatTotalScore,
  type ActionKey,
} from '../../shared/appraisalForm'

interface RaisableUser {
  id: number
  name: string
  employeeId: string | null
  departmentId: number | null
  designation: string | null
  location: string | null
  department: { id: number; name: string } | null
}

const currentYear = new Date().getFullYear()
const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1

const EMPTY_ACTIONS: Record<ActionKey, boolean> = {
  actionPromotion: false,
  actionSalaryIncrement: false,
  actionPerformanceIncentive: false,
  actionTrainingDevelopment: false,
  actionRoleEnhancement: false,
}

function RatingButtons({ value, onChange }: { value: number; onChange: (score: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border, #e5e7eb)',
            background: value === s ? 'var(--primary)' : 'transparent',
            color: value === s ? '#fff' : 'var(--text-primary)',
            fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          }}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

export default function RaiseAppraisalPage() {
  const isLeader = isLeadership(getStoredUser())
  const raiseLabel = isLeader ? 'Manager' : 'Employee'

  const [users, setUsers] = useState<RaisableUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [kpiTemplates, setKpiTemplates] = useState<KpiTemplate[]>([])
  const [kpiLoading, setKpiLoading] = useState(false)
  const [kpiError, setKpiError] = useState('')

  const [scores, setScores] = useState<Record<number, number>>({})
  const [comments, setComments] = useState<Record<number, string>>({})
  const [targets, setTargets] = useState<Record<number, string>>({})
  const [achievements, setAchievements] = useState<Record<number, string>>({})

  const [periodYear, setPeriodYear] = useState(String(currentYear))
  const [periodQuarter, setPeriodQuarter] = useState(String(currentQuarter))
  const [overallComment, setOverallComment] = useState('')
  const [creditControlComment, setCreditControlComment] = useState('')
  const [managerStrengths, setManagerStrengths] = useState('')
  const [managerDevelopmentAreas, setManagerDevelopmentAreas] = useState('')
  const [actions, setActions] = useState<Record<ActionKey, boolean>>(EMPTY_ACTIONS)
  const [finalRating, setFinalRating] = useState('')
  const [ceoName, setCeoName] = useState('')
  const [ceoSignDate, setCeoSignDate] = useState('')
  const [hrName, setHrName] = useState('')
  const [hrSignDate, setHrSignDate] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [yearlyTargets, setYearlyTargets] = useState<Target[]>([])
  const [yearlyTargetsLoading, setYearlyTargetsLoading] = useState(false)
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  useEffect(() => {
    apiFetch<RaisableUser[]>('/api/admin/appraisals/raisable')
      .then(data => { if (mountedRef.current) setUsers(Array.isArray(data) ? data : []) })
      .catch(() => { if (mountedRef.current) setUsers([]) })
      .finally(() => { if (mountedRef.current) setLoadingUsers(false) })
  }, [])

  useEffect(() => {
    setKpiTemplates([])
    setScores({})
    setComments({})
    setTargets({})
    setAchievements({})
    setKpiError('')
    setCreditControlComment('')
    setManagerStrengths('')
    setManagerDevelopmentAreas('')
    setActions(EMPTY_ACTIONS)
    setFinalRating('')
    setCeoName('')
    setCeoSignDate('')
    setHrName('')
    setHrSignDate('')
    if (!selectedUserId) return
    setKpiLoading(true)
    apiFetch<KpiTemplate[]>(`/api/admin/appraisals/kpi-templates/${selectedUserId}`)
      .then(data => {
        if (!mountedRef.current) return
        const templates = Array.isArray(data) ? data : []
        setKpiTemplates(templates)
        setScores(Object.fromEntries(templates.map(t => [t.id, 3])))
      })
      .catch(err => { if (mountedRef.current) setKpiError(err instanceof Error ? err.message : 'Failed to load KPI templates') })
      .finally(() => { if (mountedRef.current) setKpiLoading(false) })
  }, [selectedUserId])

  useEffect(() => {
    if (!selectedUserId) { setYearlyTargets([]); return }
    const year = Number(periodYear)
    if (!Number.isFinite(year)) { setYearlyTargets([]); return }
    setYearlyTargetsLoading(true)
    apiFetch<Target[]>(`/api/admin/targets?employeeId=${selectedUserId}&year=${year}`)
      .then(data => {
        if (!mountedRef.current) return
        const yearly = (Array.isArray(data) ? data : []).filter(t => t.targetMonth === null)
        setYearlyTargets(yearly)
      })
      .catch(() => { if (mountedRef.current) setYearlyTargets([]) })
      .finally(() => { if (mountedRef.current) setYearlyTargetsLoading(false) })
  }, [selectedUserId, periodYear])

  const selectedUser = users.find(u => String(u.id) === selectedUserId)

  const kpiSection = useMemo(() => kpiTemplates.filter(t => t.section === 'KPI'), [kpiTemplates])
  const competencySection = useMemo(() => kpiTemplates.filter(t => t.section === 'COMPETENCY'), [kpiTemplates])
  const creditControlSection = useMemo(() => kpiTemplates.filter(t => t.section === 'CREDIT_CONTROL'), [kpiTemplates])

  const totalScore = useMemo(
    () => weightedTotalScore(kpiSection.map(t => ({ score: scores[t.id] ?? 3, weight: t.weight }))),
    [kpiSection, scores]
  )

  async function handleSubmit() {
    if (!selectedUserId) { showToast(`Please select a ${raiseLabel.toLowerCase()}`, 'error'); return }
    const year = Number(periodYear)
    if (!Number.isFinite(year) || year < 2000) { showToast('Enter a valid period year', 'error'); return }
    const quarter = Number(periodQuarter)
    if (![1, 2, 3, 4].includes(quarter)) { showToast('Select a valid quarter', 'error'); return }
    const rating = Number(finalRating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) { showToast('Select a Final Rating (Section 6)', 'error'); return }
    if (kpiTemplates.length === 0) { showToast('No KPI templates available for this user', 'error'); return }

    setSubmitting(true)
    try {
      await apiFetch('/api/admin/appraisals', {
        method: 'POST',
        body: JSON.stringify({
          userId: Number(selectedUserId),
          periodYear: year,
          periodMonth: null,
          periodQuarter: quarter,
          overallComment: overallComment.trim() || undefined,
          creditControlComment: creditControlComment.trim() || undefined,
          managerStrengths: managerStrengths.trim() || undefined,
          managerDevelopmentAreas: managerDevelopmentAreas.trim() || undefined,
          actionPromotion: actions.actionPromotion,
          actionSalaryIncrement: actions.actionSalaryIncrement,
          actionPerformanceIncentive: actions.actionPerformanceIncentive,
          actionTrainingDevelopment: actions.actionTrainingDevelopment,
          actionRoleEnhancement: actions.actionRoleEnhancement,
          finalRating: rating,
          ceoName: ceoName.trim() || undefined,
          ceoSignDate: ceoSignDate.trim() || undefined,
          hrName: hrName.trim() || undefined,
          hrSignDate: hrSignDate.trim() || undefined,
          kpiEntries: kpiTemplates.map(t => ({
            kpiTemplateId: t.id,
            kpiName: t.name,
            section: t.section,
            weight: t.weight,
            target: t.section === 'KPI' ? (targets[t.id]?.trim() || undefined) : undefined,
            achievement: t.section === 'KPI' ? (achievements[t.id]?.trim() || undefined) : undefined,
            score: scores[t.id] ?? 3,
            comment: comments[t.id]?.trim() || undefined,
          })),
        }),
      })
      showToast('Appraisal raised successfully', 'success')
      setSelectedUserId('')
      setOverallComment('')
      setPeriodYear(String(currentYear))
      setPeriodQuarter(String(currentQuarter))
    } catch {
      // apiFetch already shows an error toast for failed requests
    } finally {
      setSubmitting(false)
    }
  }

  const sectionHeading: React.CSSProperties = { fontSize: 14, fontWeight: 700, margin: '6px 0 2px' }

  return (
    <main className="page-content">
      <div className="appraisal-layout">
      <div className="card tg-card">
        <div className="tg-topbar">
          <div className="emp-page-heading">Raise Appraisal</div>
        </div>

        <div className="tg-form" style={{ borderBottom: 'none' }}>
          <div className="tg-form-grid">
            <div className="st-field">
              <label className="st-label">{raiseLabel}</label>
              <div className="emp-select-wrap" style={{ position: 'relative' }}>
                <select
                  className="st-input"
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
                  disabled={loadingUsers}
                >
                  <option value="">{loadingUsers ? 'Loading…' : `— Select ${raiseLabel.toLowerCase()} —`}</option>
                  {users.map(u => (
                    <option key={u.id} value={String(u.id)}>{u.name} ({u.employeeId})</option>
                  ))}
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="st-field">
              <label className="st-label">Review Period — Quarter</label>
              <div className="emp-select-wrap" style={{ position: 'relative' }}>
                <select
                  className="st-input"
                  value={periodQuarter}
                  onChange={e => setPeriodQuarter(e.target.value)}
                  style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
                >
                  {[1, 2, 3, 4].map(q => <option key={q} value={String(q)}>Q{q}</option>)}
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="st-field">
              <label className="st-label">Year</label>
              <input
                className="st-input"
                type="number"
                min={2000}
                value={periodYear}
                onChange={e => setPeriodYear(e.target.value)}
              />
            </div>
          </div>

          {!loadingUsers && users.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {isLeader ? 'No managers found.' : 'No employees assigned to you yet.'}
            </p>
          )}

          {selectedUser && (
            <div style={{
              padding: '12px 14px', borderRadius: 8, background: 'var(--bg-secondary, rgba(0,0,0,0.03))',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 13,
            }}>
              <div><strong>Employee Name:</strong> {selectedUser.name}</div>
              <div><strong>Employee ID:</strong> {selectedUser.employeeId ?? '—'}</div>
              <div><strong>Designation:</strong> {selectedUser.designation || '—'}</div>
              <div><strong>Department:</strong> {selectedUser.department?.name ?? '—'}</div>
              <div><strong>Location/Region:</strong> {selectedUser.location || '—'}</div>
              <div><strong>Reporting Manager:</strong> {getStoredUser()?.name ?? '—'}</div>
            </div>
          )}

          {kpiLoading && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading KPI templates…</p>}

          {kpiError && <p style={{ color: '#ef4444', fontSize: 13 }}>{kpiError}</p>}

          {!kpiLoading && !kpiError && selectedUserId && kpiTemplates.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {kpiSection.length > 0 && (
                <div>
                  <h3 style={sectionHeading}>1. Key Performance Indicators (KPIs)</h3>
                  <div className="tg-table-wrap">
                    <table className="reports-table tg-table">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Weight (%)</th>
                          <th>Target</th>
                          <th>Achievement</th>
                          <th>Score (1-5)</th>
                          <th>Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpiSection.map(kt => (
                          <tr key={kt.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{kt.name}</div>
                              {kt.description && <div className="tg-desc-cell" style={{ fontSize: 12, marginTop: 2 }}>{kt.description}</div>}
                            </td>
                            <td>{kt.weight ?? '—'}</td>
                            <td>
                              <input
                                className="st-input"
                                style={{ minWidth: 110 }}
                                value={targets[kt.id] ?? ''}
                                onChange={e => setTargets(prev => ({ ...prev, [kt.id]: e.target.value }))}
                              />
                            </td>
                            <td>
                              <input
                                className="st-input"
                                style={{ minWidth: 110 }}
                                value={achievements[kt.id] ?? ''}
                                onChange={e => setAchievements(prev => ({ ...prev, [kt.id]: e.target.value }))}
                              />
                            </td>
                            <td>
                              <RatingButtons value={scores[kt.id] ?? 3} onChange={s => setScores(prev => ({ ...prev, [kt.id]: s }))} />
                            </td>
                            <td>
                              <textarea
                                className="tg-textarea"
                                rows={1}
                                style={{ minWidth: 150 }}
                                value={comments[kt.id] ?? ''}
                                onChange={e => setComments(prev => ({ ...prev, [kt.id]: e.target.value }))}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Total Score</td>
                          <td colSpan={2} style={{ fontWeight: 700 }}>{formatTotalScore(totalScore)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {competencySection.length > 0 && (
                <div>
                  <h3 style={sectionHeading}>2. Competency & Behavioural</h3>
                  <div className="tg-table-wrap">
                    <table className="reports-table tg-table">
                      <thead>
                        <tr>
                          <th>Parameters</th>
                          <th>Rating (1-5)</th>
                          <th>Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {competencySection.map(kt => (
                          <tr key={kt.id}>
                            <td style={{ fontWeight: 600 }}>{kt.name}</td>
                            <td>
                              <RatingButtons value={scores[kt.id] ?? 3} onChange={s => setScores(prev => ({ ...prev, [kt.id]: s }))} />
                            </td>
                            <td>
                              <textarea
                                className="tg-textarea"
                                rows={1}
                                style={{ minWidth: 180 }}
                                value={comments[kt.id] ?? ''}
                                onChange={e => setComments(prev => ({ ...prev, [kt.id]: e.target.value }))}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {creditControlSection.length > 0 && (
                <div>
                  <h3 style={sectionHeading}>3. Collections & Credit Control</h3>
                  <div className="tg-table-wrap">
                    <table className="reports-table" style={{ maxWidth: 420 }}>
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Rating (1-5)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditControlSection.map(kt => (
                          <tr key={kt.id}>
                            <td style={{ fontWeight: 600 }}>{kt.name}</td>
                            <td>
                              <RatingButtons value={scores[kt.id] ?? 3} onChange={s => setScores(prev => ({ ...prev, [kt.id]: s }))} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="st-field">
                    <label className="st-label">Comments</label>
                    <textarea
                      className="tg-textarea"
                      rows={2}
                      value={creditControlComment}
                      onChange={e => setCreditControlComment(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <h3 style={sectionHeading}>5. Manager's Overall Assessment</h3>
                <div className="st-field">
                  <label className="st-label">Strengths</label>
                  <textarea className="tg-textarea" rows={2} value={managerStrengths} onChange={e => setManagerStrengths(e.target.value)} />
                </div>
                <div className="st-field">
                  <label className="st-label">Development Areas</label>
                  <textarea className="tg-textarea" rows={2} value={managerDevelopmentAreas} onChange={e => setManagerDevelopmentAreas(e.target.value)} />
                </div>
                <div className="st-field">
                  <label className="st-label">Recommended Actions</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    {RECOMMENDED_ACTIONS.map(a => (
                      <label key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={actions[a.key]}
                          onChange={e => setActions(prev => ({ ...prev, [a.key]: e.target.checked }))}
                        />
                        {a.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 style={sectionHeading}>6. Overall Rating</h3>
                <div className="tg-table-wrap">
                  <table className="reports-table" style={{ maxWidth: 360 }}>
                    <thead>
                      <tr><th>Rating</th><th>Definition</th></tr>
                    </thead>
                    <tbody>
                      {RATING_DEFINITIONS.map(r => (
                        <tr key={r.score}><td>{r.score}</td><td>{r.label}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="st-field" style={{ maxWidth: 240, marginTop: 10 }}>
                  <label className="st-label">Final Rating *</label>
                  <div className="emp-select-wrap" style={{ position: 'relative' }}>
                    <select
                      className="st-input"
                      value={finalRating}
                      onChange={e => setFinalRating(e.target.value)}
                      style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
                    >
                      <option value="">— Select —</option>
                      {RATING_DEFINITIONS.map(r => (
                        <option key={r.score} value={String(r.score)}>{r.score} — {r.label}</option>
                      ))}
                    </select>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={sectionHeading}>7. Signatures</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>
                  The Employee and Reporting Manager signatures are recorded automatically when this appraisal is raised and acknowledged.
                  The CEO and HR fields below are optional placeholders.
                </p>
                <div className="tg-form-grid">
                  <div className="st-field">
                    <label className="st-label">CEO Name</label>
                    <input className="st-input" value={ceoName} onChange={e => setCeoName(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="st-field">
                    <label className="st-label">CEO Sign Date</label>
                    <input className="st-input" type="date" value={ceoSignDate} onChange={e => setCeoSignDate(e.target.value)} />
                  </div>
                  <div className="st-field">
                    <label className="st-label">HR Name</label>
                    <input className="st-input" value={hrName} onChange={e => setHrName(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="st-field">
                    <label className="st-label">HR Sign Date</label>
                    <input className="st-input" type="date" value={hrSignDate} onChange={e => setHrSignDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="st-field">
                <label className="st-label">Additional Remarks (optional)</label>
                <textarea
                  className="tg-textarea"
                  rows={3}
                  placeholder="Optional overall remarks…"
                  value={overallComment}
                  onChange={e => setOverallComment(e.target.value)}
                />
              </div>

              <div className="tg-form-actions">
                <button className="cnr-btn-submit" type="button" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Raise Appraisal'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card tg-card appraisal-sidebar">
        <div className="tg-topbar">
          <div className="emp-page-heading">Yearly Targets — {periodYear || currentYear}</div>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          {!selectedUserId && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Select a {raiseLabel.toLowerCase()} to view their yearly targets.
            </p>
          )}
          {selectedUserId && yearlyTargetsLoading && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</p>
          )}
          {selectedUserId && !yearlyTargetsLoading && yearlyTargets.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              No yearly targets set for {periodYear || currentYear}.
            </p>
          )}
          {selectedUserId && !yearlyTargetsLoading && yearlyTargets.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={Math.max(120, yearlyTargets.length * 60)}>
                <BarChart
                  data={yearlyTargets.map(t => ({
                    name: t.targetTitle,
                    Target: Number(t.targetValue) || 0,
                    Achieved: Number(t.achievedValue) || 0,
                  }))}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar dataKey="Target" fill="#9ca3af" name="Target" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Achieved" fill="#10b981" name="Achieved" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {yearlyTargets.map(t => {
                  const targetValue = Number(t.targetValue) || 0
                  const achievedValue = Number(t.achievedValue) || 0
                  const pct = targetValue > 0 ? Math.round((achievedValue / targetValue) * 100) : 0
                  return (
                    <div key={t.id} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{t.targetTitle}</strong>: {achievedValue}/{targetValue} ({pct}%)
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </main>
  )
}
