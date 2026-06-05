import { useState, useEffect } from 'react'
import {
  IconFileText, IconClock, IconTarget, IconBarChart, IconArrowUp,
} from '../../../components/icons'
import { apiFetch } from '../../../lib/api'
import type { Report } from '../../../types'

export default function EmployeeKpiCards() {
  const [submitted, setSubmitted] = useState(0)
  const [pending,   setPending]   = useState(0)
  const [thisMonth, setThisMonth] = useState(0)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const reports = await apiFetch<Report[]>('/api/reports/my-reports')
        if (cancelled) return

        const list = Array.isArray(reports) ? reports : []
        const now  = new Date()
        const monthKey = `${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`

        setSubmitted(list.filter(r => r.reportStatus?.statusName === 'Submitted').length)
        setPending(list.filter(r =>
          ['Pending', 'Draft'].includes(r.reportStatus?.statusName ?? '')
        ).length)
        setThisMonth(list.filter(r => r.mmyyyy === monthKey).length)
      } catch {
        /* leave at zero */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const achievementPct = submitted + pending > 0
    ? `${Math.round((submitted / (submitted + pending)) * 100)}%`
    : '0%'

  const kpis = [
    {
      label: 'Reports Submitted', value: loading ? '…' : String(submitted),
      sub: 'All time', subType: 'plain',
      icon: <IconFileText />, iconBg: '#e0e7ff', iconColor: '#6366f1',
    },
    {
      label: 'Pending Reports', value: loading ? '…' : String(pending),
      sub: 'Awaiting Review', subType: 'warn',
      icon: <IconClock />, iconBg: '#fef3c7', iconColor: '#f59e0b',
    },
    {
      label: 'Target Achievement', value: loading ? '…' : achievementPct,
      sub: 'Submitted vs pending', subType: 'up',
      icon: <IconTarget />, iconBg: '#d1fae5', iconColor: '#10b981',
    },
    {
      label: 'This Month Activity', value: loading ? '…' : String(thisMonth),
      sub: 'Reports Created', subType: 'plain',
      icon: <IconBarChart />, iconBg: '#fce7f3', iconColor: '#ec4899',
    },
  ]

  return (
    <div className="kpi-row emp-kpi-row">
      {kpis.map((k) => (
        <div className="kpi-card" key={k.label}>
          <div className="kpi-icon" style={{ background: k.iconBg, color: k.iconColor }}>
            {k.icon}
          </div>
          <div className="kpi-body">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className={`kpi-sub ${k.subType}`}>
              {k.subType === 'up' && <IconArrowUp />}
              {k.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
