import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import './TopNav.css'

function TopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, t, toggleLang } = useLanguage()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const isHome = location.pathname === '/'

  return (
    <header className="top-nav glass">
      <div className="nav-left">
        {/* Welcome greeting - only on home page */}
        {isHome && (
          <div className="nav-welcome animate-fade-in">
            <span className="welcome-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                <path d="M8.5 9A3.5 3.5 0 0 0 5 12.5V14"/>
                <path d="M15.5 9A3.5 3.5 0 0 1 19 12.5V14"/>
                <circle cx="12" cy="14" r="2"/>
              </svg>
            </span>
            <div className="welcome-text">
              <span className="welcome-label">{t('welcome')},</span>
              <span className="welcome-name">Eric</span>
            </div>
          </div>
        )}

        {!isHome && (
          <button className="nav-back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            {t('back')}
          </button>
        )}

        <nav className="nav-breadcrumb">
          <span className="bc-item" onClick={() => navigate('/')}>{t('home')}</span>
          {!isHome && (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="bc-sep">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              <span className="bc-item active">{location.pathname.split('/').pop() || 'Current'}</span>
            </>
          )}
        </nav>
      </div>

      <div className="nav-right">
        {/* Language Toggle */}
        <button className="lang-toggle" onClick={toggleLang} title={t('language')}>
          <span className={`lang-flag ${lang === 'en' ? 'active' : ''}`}>EN</span>
          <span className="lang-sep">/</span>
          <span className={`lang-flag ${lang === 'zh' ? 'active' : ''}`}>中</span>
        </button>

        <div className="nav-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder={t('searchPlaceholder')} />
        </div>

        <button className="nav-icon-btn animate-pulse-glow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <span className="notification-dot"></span>
        </button>

        <div className="nav-user" onClick={() => setShowUserMenu(!showUserMenu)}>
          <div className="user-avatar-mini">ER</div>
          <div className="user-info-mini">
            <span className="user-name-mini">Eric Ren</span>
            <span className="user-role-mini">Senior Audit Manager</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>

          {showUserMenu && (
            <div className="user-dropdown animate-fade-in-scale">
              <div className="dropdown-item">Profile Settings</div>
              <div className="dropdown-item">My Tasks</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item danger">Sign Out</div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopNav
