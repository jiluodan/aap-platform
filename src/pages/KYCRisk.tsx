import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './KYCRisk.css'

function KYCRisk() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="kyc-page animate-fade-in">
      <div className="kyc-header">
        <button className="kyc-back-btn" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </button>
        <h1 className="kyc-title">KYC Risk System</h1>
        <p className="kyc-subtitle">Know Your Client Risk Assessment</p>
      </div>

      <div className="kyc-content">
        <div className="kyc-hero">
          <div className="kyc-icon-large">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 className="kyc-big-text">KYC</h2>
          <p className="kyc-sub-main">Risk Assessment System</p>
          <p className="kyc-desc">Client risk identification and management platform</p>
        </div>
      </div>
    </div>
  )
}

export default KYCRisk
