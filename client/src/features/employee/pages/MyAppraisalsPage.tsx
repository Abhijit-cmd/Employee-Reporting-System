import AppraisalsList from '../../shared/AppraisalsList'

export default function MyAppraisalsPage() {
  return (
    <main className="page-content">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="emp-page-topbar" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
          <div>
            <div className="emp-page-heading">My Appraisals</div>
            <div className="emp-page-sub">Performance appraisals raised for you</div>
          </div>
        </div>
        <AppraisalsList endpoint="/api/appraisals/my" variant="received" emptyMessage="No appraisals yet." />
      </div>
    </main>
  )
}
