import { useState, useEffect } from 'react'
import {
  IconUsers, IconFileText, IconClock, IconCheckCircle, IconTarget, IconArrowUp,
} from '../../../components/icons'
import { employeeStore } from '../../../store/employeeStore'

interface Props {
  onNavigate?: (page: string) => void
}

export default function KpiCards({ onNavigate }: Props) {
  // Re-render whenever employeeStore length changes
  const [empCount, setEmpCount] = useState(employeeStore.length)

  useEffect(() => {
    // Poll every 300ms — lightweight since it's local state only
    const id = setInterval(() => setEmpCount(employeeStore.length), 300)
    return () => clearInterval(id)
  }, [])

  const kpis = [
    {
      label: 'Total Employees', value: String(empCount), sub: '8 this month', subType: 'up',
      icon: <IconUsers />, iconBg: '#e0e7ff', iconColor: '#6366f1',
      onClick: () => onNavigate?.('employees'),
    },
    {
      label: 'Total Reports', value: '342', sub: '25 this month', subType: 'up',
      icon: <IconFileText />, iconBg: '#d1fae5', iconColor: '#10b981',
      onClick: undefined,
    },
    {
      label: 'Pending Reports', value: '12', sub: 'View pending', subType: 'link',
      icon: <IconClock />, iconBg: '#fef3c7', iconColor: '#f59e0b',
      onClick: undefined,
    },
    {
      label: 'Completed Reports', value: '330', sub: 'View completed', subType: 'link',
      icon: <IconCheckCircle />, iconBg: '#d1fae5', iconColor: '#10b981',
      onClick: undefined,
    },
    {
      label: 'Target Achievement', value: '78%', sub: '5% this month', subType: 'up',
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
