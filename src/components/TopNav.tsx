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

  // Resolve page hierarchy breadcrumb (structural labels only)
  const getBreadcrumbTrail = (): { label: string; path?: string; active?: boolean }[] => {
    const trail: { label: string; path?: string; active?: boolean }[] = [
      { label: t('home'), path: '/' },
    ]

    if (isHome) return [{ label: t('home'), active: true }]

    // Engagement detail page (and its sub-pages)
    if (location.pathname.includes('/engagement/') || location.pathname.includes('/opinion/')) {
      // Sub-pages under Engagement
      const subPage = location.pathname.match(/\/engagement\/[^/]+\/[^/]+\/([^/?]+)/)?.[1]
      if (subPage) {
        trail.push({ label: 'Engagement' })
        const labelMap: Record<string, string> = {
          pbc: 'PBC Management',
          data: 'Data Processing',
          procedures: 'Audit Procedures',
          workpapers: 'Work Paper Station',
        }
        trail.push({ label: labelMap[subPage] || subPage, active: true })
      } else if (location.pathname.includes('/opinion/')) {
        trail.push({ label: 'Engagement' })
        trail.push({ label: 'Opinion Profile', active: true })
      } else {
        // Engagement page itself - only one level
        trail.push({ label: 'Engagement', active: true })
      }
      return trail
    }

    // KCW File detail page
    if (location.pathname.includes('/kcw/')) {
      trail.push({ label: 'Engagement' })
      trail.push({ label: 'KCW File', active: true })
      return trail
    }

    // Work Paper Station
    if (location.pathname.includes('/work-paper')) {
      trail.push({ label: 'Engagement' })
      trail.push({ label: 'Work Paper Station', active: true })
      return trail
    }

    // Dashboard
    if (location.pathname.includes('/dashboard')) {
      trail.push({ label: 'Dashboard', active: true })
      return trail
    }

    // Default fallback
    trail.push({ label: 'Page', active: true })
    return trail
  }

  const breadcrumbTrail = getBreadcrumbTrail()

  return (
    <>
      {/* Area 1: Global Header Bar - dark blue, always visible on all pages */}
      <header className="top-nav">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <span className="brand-logo">KPMG</span>
          <span className="brand-name">Audit Application Platform (AAP)</span>
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
            <span className="user-name-mini">RJ</span>
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

      {/* Area 2: Welcome Section - only on home page, below the header */}
      {isHome && (
        <div className="top-nav-welcome-section">
          <nav className="nav-breadcrumb">
            {breadcrumbTrail.map((item, idx) => (
              <span key={idx} className={item.active ? 'bc-item active' : 'bc-item'} onClick={() => item.path && navigate(item.path)}>
                {idx > 0 && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="bc-sep">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                )}
                {item.label}
              </span>
            ))}
          </nav>

          <div className="welcome-card">
            <div className="welcome-avatar">RJ</div>
            <div className="welcome-text-group">
              <span className="welcome-greeting">{t('welcome')}, RJ</span>
              <span className="welcome-subtitle">Welcome back to Audit Application Platform</span>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb for non-home pages */}
      {!isHome && (
        <div className="top-nav-sub-bar">
          <button className="nav-back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            {t('back')}
          </button>
          <nav className="nav-breadcrumb">
            {breadcrumbTrail.map((item, idx) => (
              <span key={idx} className={item.active ? 'bc-item active' : 'bc-item'} onClick={() => item.path && navigate(item.path)}>
                {idx > 0 && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="bc-sep">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                )}
                {item.label}
              </span>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

export default TopNav
