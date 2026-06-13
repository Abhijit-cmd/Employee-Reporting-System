import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import { showToast } from '../../lib/feedback'
import { formatDateTime } from '../../lib/utils'
import type { Appraisal } from '../../types'
import { RATING_DEFINITIONS, RECOMMENDED_ACTIONS, weightedTotalScore, formatTotalScore, ratingLabel } from './appraisalForm'

const STATUS_STYLES: Record<Appraisal['status'], { bg: string; color: string }> = {
  Pending: { bg: '#fef3c7', color: '#92400e' },
  Acknowledged: { bg: '#d1fae5', color: '#065f46' },
}

const SELF_FIELDS: { key: 'selfAchievements' | 'selfChallenges' | 'selfImprovements' | 'selfSupportNeeded'; label: string }[] = [
  { key: 'selfAchievements', label: 'Key Achievements' },
  { key: 'selfChallenges', label: 'Challenges Faced' },
  { key: 'selfImprovements', label: 'Areas for Improvement' },
  { key: 'selfSupportNeeded', label: 'Support Required from Management' },
]

interface SelfAssessmentDraft {
  selfAchievements: string
  selfChallenges: string
  selfImprovements: string
  selfSupportNeeded: string
}

function scoreColor(score: number): string {
  if (score >= 4) return '#10b981'
  if (score >= 3) return '#f59e0b'
  return '#c62828'
}

function periodLabel(a: Appraisal): string {
  if (a.periodQuarter) return `Q${a.periodQuarter} ${a.periodYear}`
  return String(a.periodYear)
}

const sectionHeading: React.CSSProperties = { fontSize: 14, fontWeight: 700, margin: '0 0 6px' }

interface Props {
  endpoint: string
  variant: 'received' | 'raised'
  emptyMessage?: string
}

export default function AppraisalsList({ endpoint, variant, emptyMessage = 'No appraisals yet.' }: Props) {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [acknowledging, setAcknowledging] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<Record<number, SelfAssessmentDraft>>({})
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiFetch<Appraisal[]>(endpoint)
      .then(data => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        setAppraisals(list)
        setDrafts(Object.fromEntries(list.map(a => [a.id, {
          selfAchievements: a.selfAchievements ?? '',
          selfChallenges: a.selfChallenges ?? '',
          selfImprovements: a.selfImprovements ?? '',
          selfSupportNeeded: a.selfSupportNeeded ?? '',
        }])))
      })
      .catch(() => { if (!cancelled) setAppraisals([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [endpoint])

  function toggleExpanded(id: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAcknowledge(id: number) {
    setAcknowledging(id)
    try {
      await apiFetch(`/api/appraisals/my/${id}/acknowledge`, { method: 'PATCH' })
      setAppraisals(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged', acknowledgedAt: new Date().toISOString() } : a))
      showToast('Appraisal acknowledged', 'success')
    } catch {
      // apiFetch already shows an error toast for failed requests
    } finally {
      setAcknowledging(null)
    }
  }

  async function handleSaveSelfAssessment(id: number) {
    const draft = drafts[id]
    if (!draft) return
    setSaving(id)
    try {
      await apiFetch(`/api/appraisals/my/${id}/self-assessment`, {
        method: 'PATCH',
        body: JSON.stringify(draft),
      })
      setAppraisals(prev => prev.map(a => a.id === id ? { ...a, ...draft } : a))
      showToast('Self-assessment saved', 'success')
    } catch {
      // apiFetch already shows an error toast for failed requests
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading appraisals…</p>

  if (appraisals.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📋</div>
        <p style={{ fontWeight: 600, margin: 0 }}>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {appraisals.map((a, i) => {
        const isExpanded = expanded.has(a.id)
        const badge = STATUS_STYLES[a.status]
        const counterpart = variant === 'received' ? a.raisedBy : a.user
        const counterpartLabel = variant === 'received' ? 'Raised by' : 'For'

        const kpiEntries = a.kpiEntries.filter(k => k.section === 'KPI')
        const competencyEntries = a.kpiEntries.filter(k => k.section === 'COMPETENCY')
        const creditControlEntries = a.kpiEntries.filter(k => k.section === 'CREDIT_CONTROL')
        const totalScore = weightedTotalScore(kpiEntries.map(k => ({ score: k.score, weight: k.weight })))
        const checkedActions = RECOMMENDED_ACTIONS.filter(act => a[act.key]).map(act => act.label)
        const draft = drafts[a.id]

        return (
          <div
            key={a.id}
            style={{ padding: '20px 24px', borderBottom: i < appraisals.length - 1 ? '1px solid var(--border-color, #e5e7eb)' : 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{a.departmentName} Appraisal — {periodLabel(a)}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: badge.bg, color: badge.color,
                  }}>
                    {a.status}
                  </span>
                </div>

                {counterpart && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {counterpartLabel} {counterpart.name} ({counterpart.employeeId})
                  </div>
                )}

                {a.overallComment && (
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.5 }}>{a.overallComment}</p>
                )}

                <button type="button" className="cnr-btn-back" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => toggleExpanded(a.id)}>
                  {isExpanded ? 'Hide Details' : 'Show Details'}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {a.user && (
                      <div style={{
                        padding: '12px 14px', borderRadius: 8, background: 'var(--bg-secondary, rgba(0,0,0,0.03))',
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 13,
                      }}>
                        <div><strong>Employee Name:</strong> {a.user.name}</div>
                        <div><strong>Employee ID:</strong> {a.user.employeeId ?? '—'}</div>
                        <div><strong>Designation:</strong> {a.user.designation || '—'}</div>
                        <div><strong>Department:</strong> {a.user.department?.name ?? a.departmentName}</div>
                        <div><strong>Location/Region:</strong> {a.user.location || '—'}</div>
                        <div><strong>Reporting Manager:</strong> {a.raisedBy?.name ?? '—'}</div>
                        <div><strong>Review Period:</strong> {periodLabel(a)} (Quarterly)</div>
                      </div>
                    )}

                    {kpiEntries.length > 0 && (
                      <div>
                        <h4 style={sectionHeading}>1. Key Performance Indicators (KPIs)</h4>
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
                              {kpiEntries.map(k => (
                                <tr key={k.id}>
                                  <td style={{ fontWeight: 600 }}>{k.kpiName}</td>
                                  <td>{k.weight ?? '—'}</td>
                                  <td>{k.target || '—'}</td>
                                  <td>{k.achievement || '—'}</td>
                                  <td style={{ fontWeight: 700, color: scoreColor(k.score) }}>{k.score} / 5</td>
                                  <td className="tg-desc-cell">{k.comment || '—'}</td>
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

                    {competencyEntries.length > 0 && (
                      <div>
                        <h4 style={sectionHeading}>2. Competency & Behavioural</h4>
                        <div className="tg-table-wrap">
                          <table className="reports-table tg-table">
                            <thead>
                              <tr><th>Parameters</th><th>Rating (1-5)</th><th>Comments</th></tr>
                            </thead>
                            <tbody>
                              {competencyEntries.map(k => (
                                <tr key={k.id}>
                                  <td style={{ fontWeight: 600 }}>{k.kpiName}</td>
                                  <td style={{ fontWeight: 700, color: scoreColor(k.score) }}>{k.score} / 5</td>
                                  <td className="tg-desc-cell">{k.comment || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {creditControlEntries.length > 0 && (
                      <div>
                        <h4 style={sectionHeading}>3. Collections & Credit Control</h4>
                        <div className="tg-table-wrap">
                          <table className="reports-table" style={{ maxWidth: 420 }}>
                            <thead>
                              <tr><th>Parameter</th><th>Rating (1-5)</th></tr>
                            </thead>
                            <tbody>
                              {creditControlEntries.map(k => (
                                <tr key={k.id}>
                                  <td style={{ fontWeight: 600 }}>{k.kpiName}</td>
                                  <td style={{ fontWeight: 700, color: scoreColor(k.score) }}>{k.score} / 5</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {a.creditControlComment && (
                          <p style={{ fontSize: 13, margin: '8px 0 0' }}><strong>Comments:</strong> {a.creditControlComment}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <h4 style={sectionHeading}>4. Employee Self-Assessment</h4>
                      {variant === 'received' ? (
                        <>
                          {SELF_FIELDS.map(f => (
                            <div className="st-field" key={f.key}>
                              <label className="st-label">{f.label}</label>
                              <textarea
                                className="tg-textarea"
                                rows={2}
                                value={draft?.[f.key] ?? ''}
                                onChange={e => setDrafts(prev => ({ ...prev, [a.id]: { ...prev[a.id], [f.key]: e.target.value } }))}
                              />
                            </div>
                          ))}
                          <div className="tg-form-actions">
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => handleSaveSelfAssessment(a.id)}
                              disabled={saving === a.id}
                            >
                              {saving === a.id ? 'Saving…' : 'Save Self-Assessment'}
                            </button>
                          </div>
                        </>
                      ) : (
                        SELF_FIELDS.map(f => (
                          <div key={f.key} style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{f.label}</div>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.5 }}>{a[f.key] || '—'}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <h4 style={sectionHeading}>5. Manager's Overall Assessment</h4>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>Strengths</div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.5 }}>{a.managerStrengths || '—'}</p>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>Development Areas</div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.5 }}>{a.managerDevelopmentAreas || '—'}</p>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Recommended Actions</div>
                        {checkedActions.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                            {checkedActions.map(label => <li key={label}>{label}</li>)}
                          </ul>
                        ) : (
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>None selected</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 style={sectionHeading}>6. Overall Rating</h4>
                      <div className="tg-table-wrap">
                        <table className="reports-table" style={{ maxWidth: 360 }}>
                          <thead>
                            <tr><th>Rating</th><th>Definition</th></tr>
                          </thead>
                          <tbody>
                            {RATING_DEFINITIONS.map(r => (
                              <tr key={r.score} style={r.score === a.finalRating ? { fontWeight: 700, background: 'var(--primary-light)' } : undefined}>
                                <td>{r.score}</td><td>{r.label}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: '8px 0 0' }}>
                        Final Rating: {a.finalRating != null ? `${a.finalRating} / 5 — ${ratingLabel(a.finalRating)}` : '—'}
                      </p>
                    </div>

                    <div>
                      <h4 style={sectionHeading}>7. Signatures</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                        <div><strong>Employee:</strong> {a.user?.name ?? '—'} — {a.acknowledgedAt ? formatDateTime(a.acknowledgedAt) : 'Pending acknowledgement'}</div>
                        <div><strong>Reporting Manager:</strong> {a.raisedBy?.name ?? '—'} — {formatDateTime(a.createdAt)}</div>
                        <div><strong>CEO:</strong> {a.ceoName || '—'}{a.ceoSignDate ? ` — ${a.ceoSignDate}` : ''}</div>
                        <div><strong>HR:</strong> {a.hrName || '—'}{a.hrSignDate ? ` — ${a.hrSignDate}` : ''}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {variant === 'received' && a.status === 'Pending' && (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  onClick={() => handleAcknowledge(a.id)}
                  disabled={acknowledging === a.id}
                >
                  {acknowledging === a.id ? 'Acknowledging…' : 'Acknowledge'}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
