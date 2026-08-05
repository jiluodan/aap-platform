import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './CEAC.css'

function CEAC() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="ceac-page animate-fade-in">
      <div className="cp-header">
        <button className="cp-back-btn" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </button>
        <h1 className="cp-title">CEAC System</h1>
        <p className="cp-subtitle">Compliance & Ethics Assurance Center</p>
      </div>

      <div className="cp-content">
        <div className="cp-hero">
          <div className="cp-icon-large ceac">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 className="cp-big-text">CEAC</h2>
          <p className="cp-desc">Compliance management and ethics assurance platform</p>
        </div>
      </div>
    </div>
  )
}

export default CEAC
