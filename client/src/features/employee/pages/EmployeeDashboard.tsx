import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import EmployeeKpiCards from '../components/EmployeeKpiCards'
import NotificationsPanel from '../components/NotificationsPanel'
import MyReportsTable from '../components/MyReportsTable'
import QuickActions from '../components/QuickActions'
import { IconMegaphone } from '../../../components/icons'

interface Props {
  onNavigate: (page: string) => void
}

const lineData = [
  { month: 'Jan', submitted: 1, pending: 0 },
  { month: 'Feb', submitted: 2, pending: 1 },
  { month: 'Mar', submitted: 3, pending: 1 },
  { month: 'Apr', submitted: 4, pending: 2 },
  { month: 'May', submitted: 6, pending: 1 },
  { month: 'Jun', submitted: 7, pending: 2 },
  { month: 'Jul', submitted: 9, pending: 1 },
  { month: 'Aug', submitted: 10, pending: 2 },
  { month: 'Sep', submitted: 13, pending: 2 },
  { month: 'Oct', submitted: 14, pending: 3 },
  { month: 'Nov', submitted: 11, pending: 2 },
  { month: 'Dec', submitted: 8,  pending: 1 },
]

function ReportsOverviewCard() {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">My Reports Overview</span>
        <select className="chart-select" defaultValue="this-year">
          <option value="this-year">This Year</option>
          <option value="last-year">Last Year</option>
        </select>
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              itemStyle={{ color: '#374151' }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="submitted" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3, fill: '#4f46e5' }} activeDot={{ r: 5 }} name="Submitted" />
            <Line type="monotone" dataKey="pending"   stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} name="Pending" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function LatestAnnouncement() {
  return (
    <div className="announcement-bar">
      <div className="announcement-icon">
        <IconMegaphone />
      </div>
      <div className="announcement-body">
        <strong>Latest Announcement</strong>
        <span>Team meeting on Friday, 3rd May 2025 at 11:00 AM in Conference Room.</span>
      </div>
      <button className="card-action" type="button" style={{ whiteSpace: 'nowrap' }}>
        View all Announcements
      </button>
    </div>
  )
}

export default function EmployeeDashboard({ onNavigate }: Props) {
  return (
    <main className="page-content">
      <EmployeeKpiCards />
      <div className="emp-middle-row">
        <ReportsOverviewCard />
        <NotificationsPanel />
      </div>
      <div className="emp-bottom-row">
        <MyReportsTable />
        <QuickActions onNavigate={onNavigate} />
      </div>
      <LatestAnnouncement />
    </main>
  )
}
