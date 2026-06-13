import AppraisalsList from '../../shared/AppraisalsList'

export default function RaisedAppraisalsPage() {
  return (
    <main className="page-content">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="emp-page-topbar" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
          <div>
            <div className="emp-page-heading">Appraisals Raised</div>
            <div className="emp-page-sub">Appraisals you have raised for your team</div>
          </div>
        </div>
        <AppraisalsList endpoint="/api/admin/appraisals/raised" variant="raised" emptyMessage="You haven't raised any appraisals yet." />
      </div>
    </main>
  )
}
