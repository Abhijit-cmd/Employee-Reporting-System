import { useState, useEffect } from 'react'
import { IconFileText, IconPlus } from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import { getStoredUser } from '../../../lib/auth'
import { showToast } from '../../../lib/feedback'

const DRAFT_KEY = 'report_draft'

interface ReportDraft {
  mmyyyy: string
  businessOwner: string
  preparedBy: string
  reviewedBy: string
  customersRegistered: string | number
  suppliersRegistered: string | number
  newBrandProducts: string | number
  successStories: string | number
  websiteVisitors: string | number
  challenges: string
  salesBooking: string
  targetVsAchievement: string
  accomplishments: string
}

interface Props {
  onBack: () => void
}

function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <div className="char-count">
      {value.length} / {max}
    </div>
  )
}

function SectionBadge({ num }: { num: number }) {
  return <div className="section-badge">{num}</div>
}

export default function CreateNewReport({ onBack }: Props) {
  const [mmyyyy, setMmyyyy] = useState('')
  const [businessOwner, setBusinessOwner] = useState('')
  const [preparedBy, setPreparedBy] = useState('')
  const [reviewedBy, setReviewedBy] = useState('')
  const [customersRegistered, setCustomersRegistered] = useState('')
  const [suppliersRegistered, setSuppliersRegistered] = useState('')
  const [newBrandProducts, setNewBrandProducts] = useState('')
  const [successStories, setSuccessStories] = useState('')
  const [websiteVisitors, setWebsiteVisitors] = useState('')
  const [challenges, setChallenges] = useState('')
  const [salesBooking, setSalesBooking] = useState('')
  const [targetVsAchievement, setTargetVsAchievement] = useState('')
  const [accomplishments, setAccomplishments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const MAX = 1000

  useEffect(() => {
    const user = getStoredUser()
    if (!user) return
    try {
      const raw = localStorage.getItem(`${DRAFT_KEY}_${user.id}`)
      if (!raw) return
      const draft = JSON.parse(raw) as ReportDraft
      setMmyyyy(draft.mmyyyy ?? '')
      setBusinessOwner(draft.businessOwner ?? '')
      setPreparedBy(draft.preparedBy ?? '')
      setReviewedBy(draft.reviewedBy ?? '')
      setCustomersRegistered(String(draft.customersRegistered ?? ''))
      setSuppliersRegistered(String(draft.suppliersRegistered ?? ''))
      setNewBrandProducts(String(draft.newBrandProducts ?? ''))
      setSuccessStories(String(draft.successStories ?? ''))
      setWebsiteVisitors(String(draft.websiteVisitors ?? ''))
      setChallenges(draft.challenges ?? '')
      setSalesBooking(draft.salesBooking ?? '')
      setTargetVsAchievement(draft.targetVsAchievement ?? '')
      setAccomplishments(draft.accomplishments ?? '')
    } catch {
      /* ignore corrupted draft */
    }
  }, [])

  const payload = {
    mmyyyy,
    businessOwner,
    preparedBy,
    reviewedBy,
    customersRegistered,
    suppliersRegistered,
    newBrandProducts,
    successStories,
    websiteVisitors,
    challenges,
    salesBooking,
    targetVsAchievement,
    accomplishments,
  }

  async function submitReport(successMessage: string) {
    if (submitting) return
    setSubmitting(true)
    try {
      await apiFetch('/api/reports/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const user = getStoredUser()
      if (user) {
        localStorage.removeItem(`${DRAFT_KEY}_${user.id}`)
      }
      showToast(successMessage, 'success')
      onBack()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Request failed',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  function saveDraftLocally() {
    const user = getStoredUser()
    if (!user) return
    localStorage.setItem(`${DRAFT_KEY}_${user.id}`, JSON.stringify(payload))
    showToast('Draft saved on this device', 'success')
  }

  return (
    <main className="page-content"> 
      <div className="card cnr-header-card">
        <div className="cnr-header-top">
          <h2 className="cnr-title">
            Monthly Overview – Indithrive Infratech Pvt LTD
          </h2>
          <span className="cnr-required-note">* Required Fields</span>
        </div>
        <div className="cnr-header-fields">
          <div className="cnr-field">
            <label className="cnr-label">
              MMYYYY <span className="req">*</span>
            </label>
            <div className="cnr-input-wrap">
              <input
                className="cnr-input"
                type="text"
                placeholder="MMYYYY"
                value={mmyyyy}
                onChange={(e) => setMmyyyy(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
          <div className="cnr-field">
            <label className="cnr-label">
              Business Owner <span className="req">*</span>
            </label>
            <input
              className="cnr-input"
              type="text"
              placeholder="Enter business owner name"
              value={businessOwner}
              onChange={(e) => setBusinessOwner(e.target.value)}
            />
          </div>
          <div className="cnr-field">
            <label className="cnr-label">
              Prepared by: <span className="req">*</span>
            </label>
            <input
              className="cnr-input"
              type="text"
              placeholder="Enter your name"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
            />
          </div>
          <div className="cnr-field">
            <label className="cnr-label">
              Reviewed by: <span className="req">*</span>
            </label>
            <input
              className="cnr-input"
              type="text"
              placeholder="Enter reviewer name"
              value={reviewedBy}
              onChange={(e) => setReviewedBy(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="cnr-grid">
        <div className="card cnr-card">
          <div className="cnr-card-header">
            <SectionBadge num={1} />
          </div>
          <div className="cnr-card-body">
            {[
              {
                label: 'No of Customer Registration :',
                req: true,
                val: customersRegistered,
                set: setCustomersRegistered,
              },
              {
                label: 'No of Supplier Registration :',
                req: true,
                val: suppliersRegistered,
                set: setSuppliersRegistered,
              },
              {
                label: 'Name of Products /Brand added :',
                req: true,
                val: newBrandProducts,
                set: setNewBrandProducts,
              },
              {
                label: 'New Success Stories :',
                req: false,
                val: successStories,
                set: setSuccessStories,
              },
              {
                label: 'No of Visits to new site :',
                req: false,
                val: websiteVisitors,
                set: setWebsiteVisitors,
              },
            ].map(({ label, req, val, set }) => (
              <div className="cnr-row" key={label}>
                <label className="cnr-row-label">
                  {label} {req && <span className="req">*</span>}
                </label>
                <div className="cnr-number-wrap">
                  <input
                    className="cnr-input cnr-number"
                    type="number"
                    placeholder="Enter number"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    min={0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card cnr-card">
          <div className="cnr-card-header">
            <SectionBadge num={2} />
            <span className="cnr-card-title">
              Customer/Supplier/logistics/Finance Challenges
            </span>
          </div>
          <div className="cnr-card-body cnr-textarea-body">
            <textarea
              className="cnr-textarea cnr-textarea-full"
              placeholder="Enter your challenges..."
              value={challenges}
              onChange={(e) => setChallenges(e.target.value.slice(0, MAX))}
            />
            <CharCount value={challenges} max={MAX} />
          </div>
        </div>

        <div className="card cnr-card">
          <div className="cnr-card-header">
            <SectionBadge num={3} />
            <span className="cnr-card-title">
              Your individual metrics and YTD achievement
            </span>
          </div>
          <div className="cnr-card-body">
            <div className="cnr-textarea-section">
              <div className="cnr-textarea-label">
                Sales Booking Productwise Quantity &amp; Value
              </div>
              <textarea
                className="cnr-textarea"
                placeholder="Enter details..."
                value={salesBooking}
                onChange={(e) => setSalesBooking(e.target.value.slice(0, MAX))}
              />
              <CharCount value={salesBooking} max={MAX} />
            </div>
            <div className="cnr-textarea-section">
              <div className="cnr-textarea-label">Target Vs Achievement</div>
              <textarea
                className="cnr-textarea"
                placeholder="Enter details..."
                value={targetVsAchievement}
                onChange={(e) =>
                  setTargetVsAchievement(e.target.value.slice(0, MAX))
                }
              />
              <CharCount value={targetVsAchievement} max={MAX} />
            </div>
          </div>
        </div>

        <div className="card cnr-card">
          <div className="cnr-card-header">
            <SectionBadge num={4} />
            <span className="cnr-card-title">
              Your top accomplishments YTD (and any comments on your strengths)
            </span>
          </div>
          <div className="cnr-card-body cnr-textarea-body">
            <textarea
              className="cnr-textarea cnr-textarea-full"
              placeholder="Enter your accomplishments and comments..."
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value.slice(0, MAX))}
            />
            <CharCount value={accomplishments} max={MAX} />
          </div>
        </div>
      </div>

      <div className="cnr-footer">
        <button className="cnr-btn-back" type="button" onClick={onBack} disabled={submitting}>
          Back to Dashboard
        </button>
        <div className="cnr-footer-right">
          <button
            className="cnr-btn-draft"
            type="button"
            disabled={submitting}
            onClick={saveDraftLocally}
          >
            <IconFileText />
            {submitting ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            className="cnr-btn-submit"
            type="button"
            disabled={submitting}
            onClick={() => submitReport('Report submitted successfully')}
          >
            <IconPlus />
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </div>
    </main>
  )
}