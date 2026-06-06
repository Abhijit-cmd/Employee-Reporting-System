import { useState, useEffect } from 'react'
import {
  IconUsers,
  IconFileText,
  IconClock,
  IconCheckCircle,
  IconArrowUp,
} from '../../shared/icons'
import { apiFetch } from '../../../lib/api'

interface Props {
  onNavigate?: (page: string) => void
}

interface DashboardSummary {
  totalEmployees: number
  totalReports: number
  submittedReports: number
  pendingReports: number
}

export default function KpiCards({ onNavigate }: Props) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiFetch<DashboardSummary>('/api/admin/dashboard/summary')
        if (!cancelled) {
          setSummary(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load KPI data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const kpis = [
    {
      label: 'Total Employees',
      value: loading ? '…' : String(summary?.totalEmployees ?? 0),
      sub: 'Active employees',
      subType: 'up',
      icon: <IconUsers />,
      iconBg: '#fdecea',
      iconColor: '#c62828',
      onClick: () => onNavigate?.('employees'),
    },
    {
      label: 'Total Reports',
      value: loading ? '…' : String(summary?.totalReports ?? 0),
      sub: 'All time',
      subType: 'up',
      icon: <IconFileText />,
      iconBg: '#d1fae5',
      iconColor: '#10b981',
      onClick: () => onNavigate?.('reports'),
    },
    {
      label: 'Submitted Reports',
      value: loading ? '…' : String(summary?.submittedReports ?? 0),
      sub: 'View submitted',
      subType: 'link',
      icon: <IconCheckCircle />,
      iconBg: '#d1fae5',
      iconColor: '#10b981',
      onClick: () => onNavigate?.('reports'),
    },
    {
      label: 'Pending Reports',
      value: loading ? '…' : String(summary?.pendingReports ?? 0),
      sub: 'View pending',
      subType: 'link',
      icon: <IconClock />,
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      onClick: () => onNavigate?.('reports'),
    },
  ]

  const handleKeyDown = (e: React.KeyboardEvent, onClick?: () => void) => {
    if (e.key === 'Enter' && onClick) {
      onClick()
    }
  }

  return (
    <>
      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10 }}>
          {error}
        </div>
      )}
      <div className="kpi-row">
        {kpis.map((k) => (
          <div
            className={`kpi-card${k.onClick ? ' kpi-card-clickable' : ''}`}
            key={k.label}
            onClick={k.onClick}
            role={k.onClick ? 'button' : undefined}
            tabIndex={k.onClick ? 0 : undefined}
            onKeyDown={(e) => handleKeyDown(e, k.onClick)}
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
    </>
  )
}
