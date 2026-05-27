import {
  IconFileText, IconClock, IconTarget, IconBarChart, IconArrowUp,
} from '../../../components/icons'

const kpis = [
  {
    label: 'Reports Submitted', value: '12', sub: 'This Year', subType: 'plain',
    extra: { label: '20%', type: 'up' },
    icon: <IconFileText />, iconBg: '#e0e7ff', iconColor: '#6366f1',
  },
  {
    label: 'Pending Reports', value: '2', sub: 'Awaiting Review', subType: 'warn',
    icon: <IconClock />, iconBg: '#fef3c7', iconColor: '#f59e0b',
  },
  {
    label: 'Target Achievement', value: '78%', sub: '8% from last month', subType: 'up',
    icon: <IconTarget />, iconBg: '#d1fae5', iconColor: '#10b981',
  },
  {
    label: 'This Month Activity', value: '5', sub: 'Reports Created', subType: 'plain',
    icon: <IconBarChart />, iconBg: '#fce7f3', iconColor: '#ec4899',
  },
]

export default function EmployeeKpiCards() {
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
              {k.extra && (
                <span className="kpi-extra up" style={{ marginLeft: 6 }}>
                  <IconArrowUp /> {k.extra.label}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
