import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Sentinel.css'

function Sentinel() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="sentinel-page animate-fade-in">
      <div className="sp-header">
        <button className="sp-back-btn" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </button>
        <h1 className="sp-title">Sentinel System</h1>
        <p className="sp-subtitle">Security & Monitoring Platform</p>
      </div>

      <div className="sp-content">
        <div className="sp-hero">
          <div className="sp-icon-large sentinel">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="11" r="3"/>
            </svg>
          </div>
          <h2 className="sp-big-text">Sentinel</h2>
          <p className="sp-desc">Security monitoring and threat detection system</p>
        </div>
      </div>
    </div>
  )
}

export default Sentinel
