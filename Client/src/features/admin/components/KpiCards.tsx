import { useState, useEffect } from 'react'
import {
  IconUsers,
  IconFileText,
  IconClock,
  IconCheckCircle,
  IconTarget,
  IconArrowUp,
} from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import type { ApiEmployee, Report } from '../../../types'

interface Props {
  onNavigate?: (page: string) => void
}

export default function KpiCards({ onNavigate }: Props) {
  const [empCount, setEmpCount] = useState(0)
  const [totalReports, setTotalReports] = useState(0)
  const [pending, setPending] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [employees, reports] = await Promise.all([
          apiFetch<ApiEmployee[]>('/api/auth/employees'),
          apiFetch<Report[]>('/api/admin/reports'),
        ])
        if (cancelled) return

        const empList = Array.isArray(employees) ? employees : []
        const reportList = Array.isArray(reports) ? reports : []

        setEmpCount(empList.length)
        setTotalReports(reportList.length)
        setPending(
          reportList.filter((r) =>
            ['Pending', 'Draft'].includes(r.reportStatus?.statusName ?? ''),
          ).length,
        )
        setCompleted(
          reportList.filter((r) =>
            ['Submitted', 'Approved', 'Completed'].includes(
              r.reportStatus?.statusName ?? '',
            ),
          ).length,
        )
      } catch {
        if (!cancelled) {
          setEmpCount(0)
          setTotalReports(0)
          setPending(0)
          setCompleted(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const achievementPct =
    totalReports > 0
      ? `${Math.round((completed / totalReports) * 100)}%`
      : '0%'

  const kpis = [
    {
      label: 'Total Employees',
      value: loading ? '…' : String(empCount),
      sub: 'Active employees',
      subType: 'up',
      icon: <IconUsers />,
      iconBg: '#e0e7ff',
      iconColor: '#6366f1',
      onClick: () => onNavigate?.('employees'),
    },
    {
      label: 'Total Reports',
      value: loading ? '…' : String(totalReports),
      sub: 'All time',
      subType: 'up',
      icon: <IconFileText />,
      iconBg: '#d1fae5',
      iconColor: '#10b981',
      onClick: () => onNavigate?.('reports'),
    },
    {
      label: 'Pending Reports',
      value: loading ? '…' : String(pending),
      sub: 'View pending',
      subType: 'link',
      icon: <IconClock />,
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      onClick: () => onNavigate?.('pending-reports'),
    },
    {
      label: 'Completed Reports',
      value: loading ? '…' : String(completed),
      sub: 'View completed',
      subType: 'link',
      icon: <IconCheckCircle />,
      iconBg: '#d1fae5',
      iconColor: '#10b981',
      onClick: () => onNavigate?.('reports'),
    },
    {
      label: 'Target Achievement',
      value: loading ? '…' : achievementPct,
      sub: 'Submitted vs total',
      subType: 'up',
      icon: <IconTarget />,
      iconBg: '#fee2e2',
      iconColor: '#ef4444',
      onClick: undefined,
    },
  ]

  return (
    <div className="kpi-row">
      {kpis.map((k) => (
        <div
          className={`kpi-card${k.onClick ? ' kpi-card-clickable' : ''}`}
          key={k.label}
          onClick={k.onClick}
          role={k.onClick ? 'button' : undefined}
          tabIndex={k.onClick ? 0 : undefined}
          onKeyDown={
            k.onClick
              ? (e) => e.key === 'Enter' && k.onClick?.()
              : undefined
          }
        >
          <div
            className="kpi-icon"
            style={{ background: k.iconBg, color: k.iconColor }}
          >
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
