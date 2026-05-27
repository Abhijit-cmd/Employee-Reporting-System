import { useState } from 'react'
import { IconArrowUp, IconFileText, IconPlus } from '../../../components/icons'

interface Props {
  onBack: () => void
}

function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <div className="char-count">{value.length} / {max}</div>
  )
}

function SectionBadge({ num }: { num: number }) {
  return <div className="section-badge">{num}</div>
}

export default function CreateNewReport({ onBack }: Props) {
  // Header fields
  const [mmyyyy, setMmyyyy]           = useState('')
  const [businessOwner, setBusinessOwner] = useState('')
  const [preparedBy, setPreparedBy]   = useState('')
  const [reviewedBy, setReviewedBy]   = useState('')

  // Card 1 — metrics
  const [customerReg, setCustomerReg]   = useState('')
  const [supplierReg, setSupplierReg]   = useState('')
  const [productsAdded, setProductsAdded] = useState('')
  const [successStories, setSuccessStories] = useState('')
  const [siteVisits, setSiteVisits]     = useState('')

  // Card 2 — challenges
  const [challenges, setChallenges]     = useState('')

  // Card 3 — metrics textareas
  const [salesBooking, setSalesBooking] = useState('')
  const [targetVsAchievement, setTargetVsAchievement] = useState('')

  // Card 4 — accomplishments
  const [accomplishments, setAccomplishments] = useState('')

  const MAX = 1000

  async function handleSubmitReport() {

  try {

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/reports/create`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },

        body: JSON.stringify({

          mmyyyy,
          businessOwner,
          preparedBy,
          reviewedBy,

          customerReg,
          supplierReg,
          productsAdded,
          successStories,
          siteVisits,

          challenges,

          salesBooking,
          targetVsAchievement,

          accomplishments,

        }),
      }
    );

    const data = await response.json();

    console.log(data);

    if (!response.ok) {

      alert(data.message);

      return;
    }

    alert("Report submitted successfully");

  } catch (error) {

    console.log(error);

    alert("Server error");

  }

}

  return (
    <main className="page-content">

      {/* ── Top header card ─────────────────────────────────────── */}
      <div className="card cnr-header-card">
        <div className="cnr-header-top">
          <h2 className="cnr-title">Monthly Overview – Indithrive Infratech Pvt LTD</h2>
          <span className="cnr-required-note">* Required Fields</span>
        </div>
        <div className="cnr-header-fields">
          <div className="cnr-field">
            <label className="cnr-label">MMYYYY <span className="req">*</span></label>
            <div className="cnr-input-wrap">
              <input
                className="cnr-input"
                type="text"
                placeholder="MMYYYY"
                value={mmyyyy}
                onChange={e => setMmyyyy(e.target.value)}
                maxLength={6}
              />
              <span className="cnr-input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
            </div>
          </div>
          <div className="cnr-field">
            <label className="cnr-label">Business Owner <span className="req">*</span></label>
            <input
              className="cnr-input"
              type="text"
              placeholder="Enter business owner name"
              value={businessOwner}
              onChange={e => setBusinessOwner(e.target.value)}
            />
          </div>
          <div className="cnr-field">
            <label className="cnr-label">Prepared by: <span className="req">*</span></label>
            <input
              className="cnr-input"
              type="text"
              placeholder="Enter your name"
              value={preparedBy}
              onChange={e => setPreparedBy(e.target.value)}
            />
          </div>
          <div className="cnr-field">
            <label className="cnr-label">Reviewed by: <span className="req">*</span></label>
            <input
              className="cnr-input"
              type="text"
              placeholder="Enter reviewer name"
              value={reviewedBy}
              onChange={e => setReviewedBy(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── 2×2 grid ────────────────────────────────────────────── */}
      <div className="cnr-grid">

        {/* Card 1 */}
        <div className="card cnr-card">
          <div className="cnr-card-header">
            <SectionBadge num={1} />
          </div>
          <div className="cnr-card-body">
            {[
              { label: 'No of Customer Registration :', req: true,  val: customerReg,    set: setCustomerReg },
              { label: 'No of Supplier Registration :', req: true,  val: supplierReg,    set: setSupplierReg },
              { label: 'Name of Products /Brand added :', req: true, val: productsAdded, set: setProductsAdded },
              { label: 'New Success Stories :',          req: false, val: successStories, set: setSuccessStories },
              { label: 'No of Visits to new site :',     req: false, val: siteVisits,     set: setSiteVisits },
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
                    onChange={e => set(e.target.value)}
                    min={0}
                  />
                  <div className="cnr-spinners">
                    <button type="button" onClick={() => set(String(Math.max(0, Number(val) + 1)))} aria-label="Increase">
                      <IconArrowUp style={{ width: 10, height: 10 }} />
                    </button>
                    <button type="button" onClick={() => set(String(Math.max(0, Number(val) - 1)))} aria-label="Decrease">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2 */}
        <div className="card cnr-card">
          <div className="cnr-card-header">
            <SectionBadge num={2} />
            <span className="cnr-card-title">Customer/Supplier/logistics/Finance Challenges</span>
          </div>
          <div className="cnr-card-body cnr-textarea-body">
            <textarea
              className="cnr-textarea cnr-textarea-full"
              placeholder="Enter your challenges..."
              value={challenges}
              onChange={e => setChallenges(e.target.value.slice(0, MAX))}
            />
            <CharCount value={challenges} max={MAX} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="card cnr-card">
          <div className="cnr-card-header">
            <SectionBadge num={3} />
            <span className="cnr-card-title">Your individual metrics and YTD achievement</span>
          </div>
          <div className="cnr-card-body">
            <div className="cnr-textarea-section">
              <div className="cnr-textarea-label">Sales Booking Productwise Quantity &amp; Value</div>
              <textarea
                className="cnr-textarea"
                placeholder="Enter details..."
                value={salesBooking}
                onChange={e => setSalesBooking(e.target.value.slice(0, MAX))}
              />
              <CharCount value={salesBooking} max={MAX} />
            </div>
            <div className="cnr-textarea-section">
              <div className="cnr-textarea-label">Target Vs Achievement</div>
              <textarea
                className="cnr-textarea"
                placeholder="Enter details..."
                value={targetVsAchievement}
                onChange={e => setTargetVsAchievement(e.target.value.slice(0, MAX))}
              />
              <CharCount value={targetVsAchievement} max={MAX} />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="card cnr-card">
          <div className="cnr-card-header">
            <SectionBadge num={4} />
            <span className="cnr-card-title">Your top accomplishments YTD (and any comments on your strengths)</span>
          </div>
          <div className="cnr-card-body cnr-textarea-body">
            <textarea
              className="cnr-textarea cnr-textarea-full"
              placeholder="Enter your accomplishments and comments..."
              value={accomplishments}
              onChange={e => setAccomplishments(e.target.value.slice(0, MAX))}
            />
            <CharCount value={accomplishments} max={MAX} />
          </div>
        </div>

      </div>

      {/* ── Footer buttons ───────────────────────────────────────── */}
      <div className="cnr-footer">
        <button className="cnr-btn-back" type="button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="cnr-footer-right">
          <button className="cnr-btn-draft" type="button">
            <IconFileText />
            Save as Draft
          </button>
          <button className="cnr-btn-submit" type="button" onClick={handleSubmitReport}>
            <IconPlus />
            Submit Report
          </button>
        </div>
      </div>

    </main>
  )
}
