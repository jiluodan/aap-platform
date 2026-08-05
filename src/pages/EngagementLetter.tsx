import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './EngagementLetter.css'

function EngagementLetter() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="el-page animate-fade-in">
      <div className="el-header">
        <button className="el-back-btn" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </button>
        <h1 className="el-title">Engagement Letter</h1>
        <p className="el-subtitle">Contract Management Module</p>
      </div>

      <div className="el-content">
        <div className="el-hero">
          <div className="el-icon-large engagement-letter">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2 className="el-big-text">OAK / RLGS</h2>
          <p className="el-sub-main">Engagement Letter Management</p>
          <p className="el-desc">Contract management module for audit engagements</p>
        </div>
      </div>
    </div>
  )
}

export default EngagementLetter
