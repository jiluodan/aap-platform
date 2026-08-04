import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import './Sidebar.css'

interface NavItem {
  id: string
  label: string
  labelEn: string
  icon: React.ReactNode
  path: string
  children?: { id: string; label: string; labelZh: string; path: string }[]
}

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLanguage()
  const [expandedItem, setExpandedItem] = useState<string | null>('dashboard')
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: '首页',
      labelEn: 'Home',
      path: '/',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      id: 'dashboard',
      label: '数据报表',
      labelEn: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
          <path d="M3 20h18"/>
        </svg>
      ),
      children: [
        { id: 'eng-report', label: 'Engagement Reports', labelZh: '项目报表', path: '/dashboard/engagement' },
        { id: 'mgmt-report', label: 'Management Reports', labelZh: '管理报表', path: '/dashboard/management' },
      ],
    },
    {
      id: 'support',
      label: '运维支持',
      labelEn: 'Support',
      path: '/support',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
  ]

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id)
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Area */}
      <div className="sidebar-logo" onClick={() => navigate('/')}>
        <div className="logo-glow"></div>
        <div className="logo-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#0091DA"/>
                <stop offset="100%" stopColor="#00338D"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="10" fill="url(#logoGrad)"/>
            <path d="M9 12h14M9 16h10M9 20h6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-title">Audit Platform</span>
            <span className="logo-subtitle">{lang === 'zh' ? '审计应用平台' : 'AAP'}</span>
          </div>
        )}
      </div>

      {/* Divider with glow */}
      <div className="sidebar-divider">
        <div className="divider-glow"></div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedItem === item.id

          return (
            <div key={item.id} className={`nav-group ${active ? 'active' : ''}`}>
              <button
                className={`nav-item ${active ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(item.id)
                  } else {
                    navigate(item.path)
                  }
                }}
              >
                <div className="nav-item-glow"></div>
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && (
                  <>
                    <div className="nav-labels">
                      <span className="nav-label">{lang === 'zh' ? item.label : item.labelEn}</span>
                      <span className="nav-label-en">{lang === 'zh' ? item.labelEn : item.label}</span>
                    </div>
                    {hasChildren && (
                      <svg
                        className={`nav-chevron ${isExpanded ? 'expanded' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    )}
                    {active && !hasChildren && <div className="nav-active-indicator"></div>}
                  </>
                )}
                {collapsed && active && <div className="nav-active-dot"></div>}
              </button>

              {/* Submenu */}
              {!collapsed && hasChildren && isExpanded && (
                <div className="submenu animate-scale-in">
                  {item.children!.map((child) => {
                    const childActive = location.pathname === child.path
                    return (
                      <button
                        key={child.id}
                        className={`submenu-item ${childActive ? 'active' : ''}`}
                        onClick={() => navigate(child.path)}
                      >
                        <div className="submenu-glow"></div>
                        <span className="submenu-dot"></span>
                        <span className="submenu-label">{lang === 'zh' ? child.labelZh : child.label}</span>
                        {childActive && <div className="submenu-active-line"></div>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider">
          <div className="divider-glow"></div>
        </div>

        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <div className="collapse-glow"></div>
          <svg
            className={`collapse-icon ${collapsed ? 'flipped' : ''}`}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          {!collapsed && <span className="collapse-label">{lang === 'zh' ? '收起侧边栏' : 'Collapse'}</span>}
        </button>

        {!collapsed && (
          <div className="sidebar-user">
            <div className="user-avatar-ring">
              <div className="user-avatar">ER</div>
            </div>
            <div className="user-info">
              <span className="user-name">Eric Ren</span>
              <span className="user-role">Senior Audit Manager</span>
            </div>
            <div className="user-status online"></div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
