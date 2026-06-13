import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { IconPlus, IconEdit, IconX } from '../../shared/icons'
import type { AppraisalSection, Department, KpiTemplate } from '../../../types'
import { SECTION_LABELS, SECTION_ORDER } from '../../shared/appraisalForm'

// ── Add/Edit Department Modal ────────────────────────────────────────────────
function DepartmentModal({
  department,
  onClose,
  onSaved,
}: {
  department: Department | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(department?.name ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { showToast('Department name is required', 'error'); return }
    setSubmitting(true)
    try {
      if (department) {
        await apiFetch(`/api/admin/departments/${department.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: name.trim() }),
        })
        showToast('Department updated successfully', 'success')
      } else {
        await apiFetch('/api/admin/departments', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim() }),
        })
        showToast('Department added successfully', 'success')
      }
      onSaved()
      onClose()
    } catch {
      // apiFetch already shows an error toast for failed requests
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="emp-modal-overlay" onClick={onClose}>
      <div className="emp-modal" onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header">
          <span className="emp-modal-title">{department ? 'Edit Department' : 'Add Department'}</span>
          <button type="button" className="emp-modal-close" onClick={onClose}><IconX /></button>
        </div>
        <form className="emp-modal-body" onSubmit={handleSubmit}>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Department Name *</label>
            <input
              className="emp-modal-input"
              type="text"
              placeholder="e.g. Sales"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="emp-modal-footer">
            <button type="button" className="cnr-btn-back" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="cnr-btn-submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add/Edit KPI Template Modal ──────────────────────────────────────────────
function KpiTemplateModal({
  departmentId,
  template,
  onClose,
  onSaved,
}: {
  departmentId: number
  template: KpiTemplate | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(template?.name ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [displayOrder, setDisplayOrder] = useState(String(template?.displayOrder ?? 0))
  const [section, setSection] = useState<AppraisalSection>(template?.section ?? 'KPI')
  const [weight, setWeight] = useState(template?.weight != null ? String(template.weight) : '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { showToast('KPI name is required', 'error'); return }
    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        displayOrder: Number(displayOrder) || 0,
        section,
        weight: section === 'KPI' && weight.trim() !== '' ? Number(weight) : null,
      }
      if (template) {
        await apiFetch(`/api/admin/kpi-templates/${template.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        showToast('KPI template updated successfully', 'success')
      } else {
        await apiFetch('/api/admin/kpi-templates', {
          method: 'POST',
          body: JSON.stringify({ ...payload, departmentId }),
        })
        showToast('KPI template added successfully', 'success')
      }
      onSaved()
      onClose()
    } catch {
      // apiFetch already shows an error toast for failed requests
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="emp-modal-overlay" onClick={onClose}>
      <div className="emp-modal" onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header">
          <span className="emp-modal-title">{template ? 'Edit KPI Template' : 'Add KPI Template'}</span>
          <button type="button" className="emp-modal-close" onClick={onClose}><IconX /></button>
        </div>
        <form className="emp-modal-body" onSubmit={handleSubmit}>
          <div className="emp-modal-field">
            <label className="emp-modal-label">KPI Name *</label>
            <input
              className="emp-modal-input"
              type="text"
              placeholder="e.g. Revenue Target Achievement"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Description</label>
            <textarea
              className="emp-modal-input"
              rows={3}
              placeholder="Optional details shown to the rater"
              value={description ?? ''}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Display Order</label>
            <input
              className="emp-modal-input"
              type="number"
              value={displayOrder}
              onChange={e => setDisplayOrder(e.target.value)}
            />
          </div>
          <div className="emp-modal-field">
            <label className="emp-modal-label">Section</label>
            <div className="emp-select-wrap" style={{ position: 'relative' }}>
              <select
                className="emp-modal-input"
                value={section}
                onChange={e => setSection(e.target.value as AppraisalSection)}
                style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
              >
                {SECTION_ORDER.map(sec => (
                  <option key={sec} value={sec}>{SECTION_LABELS[sec]}</option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          {section === 'KPI' && (
            <div className="emp-modal-field">
              <label className="emp-modal-label">Weight (%)</label>
              <input
                className="emp-modal-input"
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 25"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>
          )}
          <div className="emp-modal-footer">
            <button type="button" className="cnr-btn-back" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="cnr-btn-submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Org Settings Page ────────────────────────────────────────────────────────
export default function LeadershipSettingsPage() {
  const [tab, setTab] = useState<'departments' | 'kpi-templates'>('departments')

  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [deptModal, setDeptModal] = useState<{ open: boolean; department: Department | null }>({ open: false, department: null })
  const [deleteDept, setDeleteDept] = useState<Department | null>(null)
  const [deletingDept, setDeletingDept] = useState(false)

  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('')
  const [kpiTemplates, setKpiTemplates] = useState<KpiTemplate[]>([])
  const [loadingKpis, setLoadingKpis] = useState(false)
  const [kpiModal, setKpiModal] = useState<{ open: boolean; template: KpiTemplate | null }>({ open: false, template: null })
  const [deleteKpi, setDeleteKpi] = useState<KpiTemplate | null>(null)
  const [deletingKpi, setDeletingKpi] = useState(false)

  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  function fetchDepartments() {
    setLoadingDepts(true)
    apiFetch<Department[]>('/api/admin/departments')
      .then(data => {
        if (!mountedRef.current) return
        const list = Array.isArray(data) ? data : []
        setDepartments(list)
        setSelectedDeptId(prev => (prev !== '' && list.some(d => d.id === prev)) ? prev : (list[0]?.id ?? ''))
      })
      .catch(() => { if (mountedRef.current) setDepartments([]) })
      .finally(() => { if (mountedRef.current) setLoadingDepts(false) })
  }

  useEffect(() => { fetchDepartments() }, [])

  function fetchKpiTemplates(deptId: number) {
    setLoadingKpis(true)
    apiFetch<KpiTemplate[]>(`/api/admin/kpi-templates?departmentId=${deptId}`)
      .then(data => { if (mountedRef.current) setKpiTemplates(Array.isArray(data) ? data : []) })
      .catch(() => { if (mountedRef.current) setKpiTemplates([]) })
      .finally(() => { if (mountedRef.current) setLoadingKpis(false) })
  }

  useEffect(() => {
    if (selectedDeptId !== '') fetchKpiTemplates(selectedDeptId)
    else setKpiTemplates([])
  }, [selectedDeptId])

  async function handleDeleteDepartment() {
    if (!deleteDept) return
    setDeletingDept(true)
    try {
      await apiFetch(`/api/admin/departments/${deleteDept.id}`, { method: 'DELETE' })
      showToast('Department deleted', 'success')
      setDeleteDept(null)
      fetchDepartments()
    } catch {
      // apiFetch already shows an error toast for failed requests
    } finally {
      setDeletingDept(false)
    }
  }

  async function handleDeleteKpiTemplate() {
    if (!deleteKpi) return
    setDeletingKpi(true)
    try {
      await apiFetch(`/api/admin/kpi-templates/${deleteKpi.id}`, { method: 'DELETE' })
      showToast('KPI template deleted', 'success')
      setDeleteKpi(null)
      if (selectedDeptId !== '') fetchKpiTemplates(selectedDeptId)
    } catch {
      // apiFetch already shows an error toast for failed requests
    } finally {
      setDeletingKpi(false)
    }
  }

  return (
    <main className="page-content">
      <div className="card st-card">
        <div className="st-card-body">
          <div className="emp-page-heading">Org Settings</div>
          <div className="emp-page-sub">Manage departments and per-department KPI templates used for performance appraisals.</div>

          <div className="rp-page-tabs" style={{ marginTop: 12 }}>
            <button type="button" className={`rp-page-tab${tab === 'departments' ? ' active' : ''}`} onClick={() => setTab('departments')}>
              Departments
            </button>
            <button type="button" className={`rp-page-tab${tab === 'kpi-templates' ? ' active' : ''}`} onClick={() => setTab('kpi-templates')}>
              KPI Templates
            </button>
          </div>

          {tab === 'departments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button className="cnr-btn-submit" type="button" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setDeptModal({ open: true, department: null })}>
                  <IconPlus /> Add Department
                </button>
              </div>

              {loadingDepts ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading departments…</p>
              ) : departments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No departments found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {departments.map(dept => (
                    <div key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-secondary, rgba(0,0,0,0.03))' }}>
                      <div style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{dept.name}</div>
                      <button type="button" className="action-btn emp-edit-btn" title="Edit department" onClick={() => setDeptModal({ open: true, department: dept })}>
                        <IconEdit />
                      </button>
                      <button type="button" className="action-btn emp-delete-btn" title="Delete department" onClick={() => setDeleteDept(dept)}>
                        <IconX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'kpi-templates' && (
            <div>
              <div className="st-field" style={{ maxWidth: 320, marginBottom: 16 }}>
                <label className="st-label">Department</label>
                <div className="emp-select-wrap" style={{ position: 'relative' }}>
                  <select
                    className="st-input"
                    value={selectedDeptId}
                    onChange={e => setSelectedDeptId(e.target.value ? Number(e.target.value) : '')}
                    style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer' }}
                  >
                    {departments.length === 0 && <option value="">— No departments —</option>}
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button
                  className="cnr-btn-submit"
                  type="button"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  disabled={selectedDeptId === ''}
                  onClick={() => { if (selectedDeptId !== '') setKpiModal({ open: true, template: null }) }}
                >
                  <IconPlus /> Add KPI Template
                </button>
              </div>

              {selectedDeptId === '' ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Add a department first.</p>
              ) : loadingKpis ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading KPI templates…</p>
              ) : kpiTemplates.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No KPI templates for this department yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {SECTION_ORDER.map(sec => {
                    const items = kpiTemplates.filter(k => k.section === sec)
                    if (items.length === 0) return null
                    return (
                      <div key={sec}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>
                          {SECTION_LABELS[sec]}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {items.map(kpi => (
                            <div key={kpi.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-secondary, rgba(0,0,0,0.03))' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{kpi.name}</div>
                                {kpi.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{kpi.description}</div>}
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                  Order: {kpi.displayOrder}{kpi.section === 'KPI' && kpi.weight != null ? ` · Weight: ${kpi.weight}%` : ''}
                                </div>
                              </div>
                              <button type="button" className="action-btn emp-edit-btn" title="Edit KPI template" onClick={() => setKpiModal({ open: true, template: kpi })}>
                                <IconEdit />
                              </button>
                              <button type="button" className="action-btn emp-delete-btn" title="Delete KPI template" onClick={() => setDeleteKpi(kpi)}>
                                <IconX />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {deptModal.open && (
        <DepartmentModal
          department={deptModal.department}
          onClose={() => setDeptModal({ open: false, department: null })}
          onSaved={fetchDepartments}
        />
      )}

      {kpiModal.open && selectedDeptId !== '' && (
        <KpiTemplateModal
          departmentId={selectedDeptId}
          template={kpiModal.template}
          onClose={() => setKpiModal({ open: false, template: null })}
          onSaved={() => fetchKpiTemplates(selectedDeptId)}
        />
      )}

      {deleteDept && (
        <div className="emp-modal-overlay" onClick={() => setDeleteDept(null)}>
          <div className="emp-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="emp-modal-header">
              <span className="emp-modal-title">Delete Department</span>
              <button type="button" className="emp-modal-close" onClick={() => setDeleteDept(null)}><IconX /></button>
            </div>
            <div className="emp-modal-body">
              <p style={{ margin: '0 0 20px', color: 'var(--text-primary)' }}>
                Are you sure you want to delete <strong>{deleteDept.name}</strong>? Departments with assigned users or KPI templates cannot be deleted.
              </p>
              <div className="emp-modal-footer">
                <button type="button" className="cnr-btn-back" onClick={() => setDeleteDept(null)} disabled={deletingDept}>Cancel</button>
                <button type="button" className="cnr-btn-submit" style={{ background: '#ef4444' }} onClick={handleDeleteDepartment} disabled={deletingDept}>
                  {deletingDept ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteKpi && (
        <div className="emp-modal-overlay" onClick={() => setDeleteKpi(null)}>
          <div className="emp-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="emp-modal-header">
              <span className="emp-modal-title">Delete KPI Template</span>
              <button type="button" className="emp-modal-close" onClick={() => setDeleteKpi(null)}><IconX /></button>
            </div>
            <div className="emp-modal-body">
              <p style={{ margin: '0 0 20px', color: 'var(--text-primary)' }}>
                Are you sure you want to delete <strong>{deleteKpi.name}</strong>? This action cannot be undone.
              </p>
              <div className="emp-modal-footer">
                <button type="button" className="cnr-btn-back" onClick={() => setDeleteKpi(null)} disabled={deletingKpi}>Cancel</button>
                <button type="button" className="cnr-btn-submit" style={{ background: '#ef4444' }} onClick={handleDeleteKpiTemplate} disabled={deletingKpi}>
                  {deletingKpi ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
