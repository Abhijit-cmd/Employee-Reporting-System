import { useState, useEffect } from 'react'
import {
  IconFileText, IconClock, IconTarget, IconBarChart, IconArrowUp,
} from '../../../components/icons'

interface ReportItem {
  reportStatus?: { statusName?: string }
  createdAt?: string
}

export default function EmployeeKpiCards() {
  const [reports, setReports]   = useState<ReportItem[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetchMyReports() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/reports/my-reports`,
          { headers: { Authorization: token ? `Bearer ${token}` : '' } }
        )
        const data = await res.json()
        if (Array.isArray(data)) setReports(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchMyReports()
  }, [])

  const pending  = reports.filter(r => r.reportStatus?.statusName === 'Pending').length
  const thisYear = new Date().getFullYear()
  const yearReports = reports.filter(r => r.createdAt && new Date(r.createdAt).getFullYear() === thisYear)
  const thisMonth = reports.filter(r => {
    if (!r.createdAt) return false
    const d = new Date(r.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const kpis = [
    {
      label: 'Reports Submitted', value: loading ? '…' : String(yearReports.length),
      sub: 'This Year', subType: 'plain',
      icon: <IconFileText />, iconBg: '#e0e7ff', iconColor: '#6366f1',
    },
    {
      label: 'Pending Reports', value: loading ? '…' : String(pending),
      sub: 'Awaiting Review', subType: 'warn',
      icon: <IconClock />, iconBg: '#fef3c7', iconColor: '#f59e0b',
    },
    {
      label: 'Target Achievement', value: '—',
      sub: 'No data yet', subType: 'plain',
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
      {kpis.map((k, i) => (
        <div className="kpi-card" key={i}>
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
