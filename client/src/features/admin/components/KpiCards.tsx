import { useState, useEffect } from 'react'
import {
  IconUsers, IconFileText, IconClock, IconCheckCircle, IconTarget, IconArrowUp,
} from '../../../components/icons'

interface Props {
  onNavigate?: (page: string) => void
}

interface KpiData {
  totalEmployees: number
  totalReports: number
  pendingReports: number
  completedReports: number
}

export default function KpiCards({ onNavigate }: Props) {
  const [data, setData]       = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchKpis() {
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: token ? `Bearer ${token}` : '' }

        const [empRes, repRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/auth/employees`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/reports`, { headers }),
        ])

        const employees = empRes.ok ? await empRes.json() : []
        const reports   = repRes.ok ? await repRes.json() : []

        const pending   = Array.isArray(reports) ? reports.filter((r: any) => r.reportStatus?.statusName === 'Pending').length   : 0
        const completed = Array.isArray(reports) ? reports.filter((r: any) => r.reportStatus?.statusName === 'Submitted').length : 0

        setData({
          totalEmployees:   Array.isArray(employees) ? employees.length : 0,
          totalReports:     Array.isArray(reports)   ? reports.length   : 0,
          pendingReports:   pending,
          completedReports: completed,
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchKpis()
  }, [])

  const kpis = [
    {
      label: 'Total Employees', value: loading ? '…' : String(data?.totalEmployees ?? 0),
      sub: '', subType: 'plain',
      icon: <IconUsers />, iconBg: '#e0e7ff', iconColor: '#6366f1',
      onClick: () => onNavigate?.('employees'),
    },
    {
      label: 'Total Reports', value: loading ? '…' : String(data?.totalReports ?? 0),
      sub: '', subType: 'plain',
      icon: <IconFileText />, iconBg: '#d1fae5', iconColor: '#10b981',
      onClick: undefined,
    },
    {
      label: 'Pending Reports', value: loading ? '…' : String(data?.pendingReports ?? 0),
      sub: 'Awaiting review', subType: 'link',
      icon: <IconClock />, iconBg: '#fef3c7', iconColor: '#f59e0b',
      onClick: () => onNavigate?.('pending-reports'),
    },
    {
      label: 'Completed Reports', value: loading ? '…' : String(data?.completedReports ?? 0),
      sub: '', subType: 'plain',
      icon: <IconCheckCircle />, iconBg: '#d1fae5', iconColor: '#10b981',
      onClick: undefined,
    },
    {
      label: 'Target Achievement', value: '—',
      sub: 'No data yet', subType: 'plain',
      icon: <IconTarget />, iconBg: '#fee2e2', iconColor: '#ef4444',
      onClick: undefined,
    },
  ]

  return (
    <div className="kpi-row">
      {kpis.map((k, i) => (
        <div
          className={`kpi-card${k.onClick ? ' kpi-card-clickable' : ''}`}
          key={i}
          onClick={k.onClick}
          role={k.onClick ? 'button' : undefined}
          tabIndex={k.onClick ? 0 : undefined}
          onKeyDown={k.onClick ? (e) => e.key === 'Enter' && k.onClick?.() : undefined}
        >
          <div className="kpi-icon" style={{ background: k.iconBg, color: k.iconColor }}>
            {k.icon}
          </div>
          <div className="kpi-body">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            {k.sub && (
              <div className={`kpi-sub ${k.subType}`}>
                {k.subType === 'up' && <IconArrowUp />}
                {k.sub}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
