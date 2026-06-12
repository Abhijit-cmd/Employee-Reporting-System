import type { Report } from '../../../types'
import { formatMmyyyy, statusClass } from '../../../lib/utils'
import { IconX } from '../../shared/icons'

interface Props {
  report: Report
  onClose: () => void
  onNavigate: (page: string) => void
}

function ReadonlyField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="emp-modal-field">
      <label className="emp-modal-label">{label}</label>
      <input className="emp-modal-input" type="text" readOnly value={value} />
    </div>
  )
}

function ReadonlyTextarea({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="emp-modal-field">
      <label className="emp-modal-label">{label}</label>
      <textarea className="emp-modal-input" readOnly value={value ?? ''} rows={3} />
    </div>
  )
}

export default function EmployeeViewReportDrawer({ report, onClose, onNavigate }: Props) {
  const status = report.reportStatus?.statusName ?? ''

  return (
    <div className="emp-modal-overlay" onClick={onClose}>
      <div className="emp-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header">
          <span className="emp-modal-title">
            Report — {formatMmyyyy(report.mmyyyy)}{' '}
            <span className={`status-badge ${statusClass(status)}`}>{status}</span>
          </span>
          <button type="button" className="emp-modal-close" onClick={onClose}><IconX /></button>
        </div>
        <div className="emp-modal-body">
          <ReadonlyField label="Business Owner" value={report.businessOwner} />
          <ReadonlyField label="Prepared By" value={report.preparedBy} />
          <ReadonlyField label="Reviewed By" value={report.reviewedBy} />
          <ReadonlyField label="Customers Registered" value={report.customersRegistered} />
          <ReadonlyField label="Suppliers Registered" value={report.suppliersRegistered} />
          <ReadonlyField label="New Brand Products" value={report.newBrandProducts} />
          <ReadonlyField label="Success Stories" value={report.successStories} />
          <ReadonlyField label="Website Visitors" value={report.websiteVisitors} />
          <ReadonlyTextarea label="Challenges" value={report.challenges} />
          <ReadonlyTextarea label="Sales Booking" value={report.salesBooking} />
          <ReadonlyTextarea label="Target vs Achievement" value={report.targetVsAchievement} />
          <ReadonlyTextarea label="Accomplishments" value={report.accomplishments} />
          <div className="emp-modal-footer">
            <button type="button" className="cnr-btn-back" onClick={onClose}>Close</button>
            <button
              type="button"
              className="cnr-btn-submit"
              onClick={() => { onClose(); onNavigate(`create-report/${report.id}`) }}
            >
              Edit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
