import { useState, useEffect, useRef } from 'react'
import { IconFileText, IconPlus } from '../../shared/icons'
import { apiFetch } from '../../../lib/api'
import { getStoredUser } from '../../../lib/auth'
import { showToast } from '../../../lib/feedback'

const DRAFT_KEY = 'report_draft'
const DRAFT_VERSION = 1
const COMPANY_NAME = 'Indithrive Infratech Pvt LTD'

interface ReportDraft {
  version: number
  mmyyyy: string
  businessOwner: string
  preparedBy: string
  reviewedBy: string
  customersRegistered: string
  suppliersRegistered: string
  newBrandProducts: string
  successStories: string
  websiteVisitors: string
  challenges: string
  salesBooking: string
  targetVsAchievement: string
  accomplishments: string
}

function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    return false
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    return null
  }
}

function isValidDraft(d: any): d is ReportDraft {
  return (
    d &&
    typeof d === 'object' &&
    d.version === DRAFT_VERSION &&
    typeof d.mmyyyy === 'string' &&
    typeof d.businessOwner === 'string' &&
    typeof d.preparedBy === 'string' &&
    typeof d.reviewedBy === 'string' &&
    typeof d.customersRegistered === 'string' &&
    typeof d.suppliersRegistered === 'string' &&
    typeof d.newBrandProducts === 'string' &&
    typeof d.successStories === 'string' &&
    typeof d.websiteVisitors === 'string' &&
    typeof d.challenges === 'string' &&
    typeof d.salesBooking === 'string' &&
    typeof d.targetVsAchievement === 'string' &&
    typeof d.accomplishments === 'string'
  )
}

const toNumber = (v: string): number => {
  const n = Number(v)
  return isNaN(n) ? 0 : n
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
  const abortControllerRef = useRef<AbortController | null>(null)

  const MAX = 1000

  useEffect(() => {
    const user = getStoredUser()
    if (!user) return
    try {
      const raw = safeGetItem(`${DRAFT_KEY}_${user.id}`)
      if (!raw) return
      const draft = JSON.parse(raw) as ReportDraft
      // Integrity check
      if (!isValidDraft(draft)) {
        throw new Error('Invalid draft structure')
      }
      setMmyyyy(draft.mmyyyy)
      setBusinessOwner(draft.businessOwner)
      setPreparedBy(draft.preparedBy)
      setReviewedBy(draft.reviewedBy)
      setCustomersRegistered(draft.customersRegistered)
      setSuppliersRegistered(draft.suppliersRegistered)
      setNewBrandProducts(draft.newBrandProducts)
      setSuccessStories(draft.successStories)
      setWebsiteVisitors(draft.websiteVisitors)
      setChallenges(draft.challenges)
      setSalesBooking(draft.salesBooking)
      setTargetVsAchievement(draft.targetVsAchievement)
      setAccomplishments(draft.accomplishments)
    } catch (e) {
      console.warn('Failed to load draft:', e)
    }
  }, [])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  function validateForm(): string | null {
    if (!mmyyyy) return 'Please select a month and year'
  
    if (!businessOwner.trim()) return 'Please fill all required fields before submitting the form.'
  
    if (!preparedBy.trim()) return 'Please fill all required fields before submitting the form.'
  
    if (!reviewedBy.trim()) return 'Please fill all required fields before submitting the form.'
  
    const validateNumber = (val: string): boolean => {
      const num = Number(val)
  
      return (
        val.trim() !== '' &&
        !isNaN(num) &&
        Number.isFinite(num) &&
        num >= 0
      )
    }
  
    if (!validateNumber(customersRegistered))
      return 'Please fill all required fields before submitting the form.'
  
    if (!validateNumber(suppliersRegistered))
      return 'Please fill all required fields before submitting the form.'
  
    if (!validateNumber(newBrandProducts))
      return 'Please fill all required fields before submitting the form.'
  
    if (!validateNumber(successStories))
      return 'Please fill all required fields before submitting the form.'
  
    if (!validateNumber(websiteVisitors))
      return 'Please fill all required fields before submitting the form.'
  
    if (!challenges.trim())
      return 'Please fill all required fields before submitting the form.'
  
    if (!salesBooking.trim())
      return 'Please fill all required fields before submitting the form.'
  
    if (!targetVsAchievement.trim())
      return 'Please fill all required fields before submitting the form.'
  
    if (!accomplishments.trim())
      return 'Please fill all required fields before submitting the form.'
  
    return null
  }

  const submitPayload = {
    mmyyyy,
    businessOwner,
    preparedBy,
    reviewedBy,
    customersRegistered: toNumber(customersRegistered),
    suppliersRegistered: toNumber(suppliersRegistered),
    newBrandProducts: toNumber(newBrandProducts),
    successStories: toNumber(successStories),
    websiteVisitors: toNumber(websiteVisitors),
    challenges,
    salesBooking,
    targetVsAchievement,
    accomplishments,
  }

  const draftPayload: ReportDraft = {
    version: DRAFT_VERSION,
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
  
    const validationError = validateForm()
  
    if (validationError) {
      showToast(
        'Submission failed - Please fill all required fields before submitting the form.',
        'error'
      )
      return
    }
  
    setSubmitting(true)
    abortControllerRef.current = new AbortController()
    try {
      await apiFetch('/api/reports/create', {
        method: 'POST',
        body: JSON.stringify(submitPayload),
        signal: abortControllerRef.current.signal,
      })
      const user = getStoredUser()
      if (user) {
        try {
          localStorage.removeItem(`${DRAFT_KEY}_${user.id}`)
        } catch (e) {
          // Ignore any errors when removing draft
        }
      }
      showToast(successMessage, 'success')
      onBack()
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        showToast(
          'Submission failed — draft kept locally',
          'error',
        )
      }
    } finally {
      setSubmitting(false)
      abortControllerRef.current = null
    }
  }

  function saveDraftLocally() {
    const user = getStoredUser()
    if (!user) return
    const ok = safeSetItem(
      `${DRAFT_KEY}_${user.id}`,
      JSON.stringify(draftPayload)
    )
    if (!ok) {
      showToast('Draft could not be saved (storage issue)', 'error')
      return
    }
    showToast('Draft saved on this device', 'success')
  }

  function toMonthValue(v: string): string {
    if (!v || v.length < 6) return ''
    const mm = v.slice(0, 2)
    const yyyy = v.slice(2, 6)
    if (!/^\d{2}$/.test(mm) || !/^\d{4}$/.test(yyyy)) return ''
    return `${yyyy}-${mm}`
  }

  function fromMonthValue(v: string): string {
    if (!v) return ''
    const [yyyy, mm] = v.split('-')
    if (!/^\d{4}$/.test(yyyy) || !/^\d{2}$/.test(mm)) return ''
    return `${mm}${yyyy}`
  }

  return (
    <main className="page-content"> 
      <div className="card cnr-header-card">
        <div className="cnr-header-top">
        <h2 className="cnr-title">
            Monthly Overview - {COMPANY_NAME}
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
                type="month"
                value={toMonthValue(mmyyyy)}
                onChange={(e) => setMmyyyy(fromMonthValue(e.target.value))}
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
                req: true,
                val: successStories,
                set: setSuccessStories,
              },
              {
                label: 'No of Visits to new site :',
                req: true,
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

  <div className="cnr-spinners">
    <button
      type="button"
      onClick={() => set(String(Math.max(0, Number(val || 0) + 1)))}
    >
      ▲
    </button>

    <button
      type="button"
      onClick={() => set(String(Math.max(0, Number(val || 0) - 1)))}
    >
      ▼
    </button>
  </div>
</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card cnr-card">
          <div className="cnr-card-header">
            <SectionBadge num={2} />
            <span className="cnr-card-title">
            Customer/Supplier/logistics/Finance Challenges <span className="req">*</span>
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
              Sales Booking Productwise Quantity & Value &amp; Value<span className="req">*</span>
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
              <div className="cnr-textarea-label">
              Target Vs Achievement <span className="req">*</span></div>
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
              Your top accomplishments YTD (and any comments on your strengths)<span className="req">*</span>
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
