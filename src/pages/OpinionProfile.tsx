import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './OpinionProfile.css'

interface Phase {
  id: string
  title: string
  titleCn: string
  status: 'completed' | 'active' | 'pending'
  date?: string
}

const opinionPhases: Phase[] = [
  { id: '1', title: 'Submit opinion profile', titleCn: '提交意见档案', status: 'completed', date: '2026-07-15' },
  { id: '2', title: 'Apply serial number', titleCn: '申请编号', status: 'completed', date: '2026-07-18' },
  { id: '3', title: 'Submit final declaration', titleCn: '提交最终声明', status: 'active' },
  { id: '4', title: 'Close out', titleCn: '关闭', status: 'pending' },
]

const opinionData = {
  entityNameEn: 'Demo-1',
  entityNameCn: 'Demo1',
  periodEnd: '2024-12-31',
  signingFirm: 'Dummy Audit Firm LLP',
  reportType: 'Audit of financial information',
  reportDate: '2026-06-18',
  serialNumber: 'BJSHG2600002',
  currentPhase: 3,
}

function OpinionProfile() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')
  const [fsDropdownOpen, setFsDropdownOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)

  const currentPhase = opinionPhases.find(p => p.status === 'active')

  return (
    <div className="opinion-profile animate-fade-in">
      {/* 面包屑 */}
      <div className="op-breadcrumb">
        <button className="breadcrumb-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6-6-6"/>
          </svg>
          客户总览
        </button>
        <span className="breadcrumb-sep">/</span>
        <button className="breadcrumb-back" onClick={() => navigate(`/engagement/${clientId}/${engagementId}`)}>
          DEMO-ROBOT-2025
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Opinion Profile</span>
      </div>

      {/* 页面标题 */}
      <div className="op-header animate-slide-in">
        <div>
          <h1 className="op-title gradient-text">Opinion Profile</h1>
          <p className="op-subtitle">审计意见配置与报告出具管理</p>
        </div>
        <div className="op-badge animate-pulse-glow">
          <span className="op-phase-indicator">Phase {opinionData.currentPhase} of 4</span>
        </div>
      </div>

      {/* Current Phase 进度指示器 */}
      <div className="op-phase-card animate-fade-in-scale">
        <div className="op-phase-header">
          <h3 className="op-phase-title">
            Current phase
            <span className="op-phase-help">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </span>
          </h3>
        </div>
        <div className="op-phase-track">
          {opinionPhases.map((phase, index) => (
            <div key={phase.id} className={`op-phase-item ${phase.status}`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`op-phase-dot ${phase.status}`}>
                {phase.status === 'completed' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="op-phase-label">{phase.title}</span>
              {phase.date && <span className="op-phase-date">{phase.date}</span>}
              {index < opinionPhases.length - 1 && (
                <div className={`op-phase-connector ${phase.status === 'completed' ? 'active' : ''}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 待处理操作 - Arrow shape */}
      <div className="op-action-bar animate-slide-in">
        <div className="op-action-info">
          <span className="op-action-label">
            <span className="op-action-pulse"></span>
            Pending your action
          </span>
          <span className="op-action-desc">当前阶段需要您提交最终声明以完成审计意见配置</span>
        </div>
        <button className="op-action-btn">
          <span>Submit eForm for KCw</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* 标签页内容 */}
      <div className="op-tabs animate-fade-in">
        <button className={activeTab === 'basic' ? 'active' : ''} onClick={() => setActiveTab('basic')}>基本信息</button>
        <button className={activeTab === 'reporting' ? 'active' : ''} onClick={() => setActiveTab('reporting')}>报告信息</button>
        <button className={activeTab === 'templates' ? 'active' : ''} onClick={() => setActiveTab('templates')}>报告模板</button>
        <button className={activeTab === 'assembly' ? 'active' : ''} onClick={() => setActiveTab('assembly')}>文件组装</button>
      </div>

      {activeTab === 'basic' && (
        <div className="op-content animate-fade-in">
          <div className="op-section glass-card">
            <h3 className="op-section-title">
              <span className="op-section-icon blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
                </svg>
              </span>
              Basic Information
            </h3>
            <div className="op-form-grid">
              <div className="op-form-item">
                <label>Entity name in English</label>
                <div className="op-form-value">{opinionData.entityNameEn}</div>
              </div>
              <div className="op-form-item">
                <label>Entity name in Chinese</label>
                <div className="op-form-value">{opinionData.entityNameCn}</div>
              </div>
              <div className="op-form-item">
                <label>Financial period end date</label>
                <div className="op-form-value">{opinionData.periodEnd}</div>
              </div>
              <div className="op-form-item">
                <label>Current phase</label>
                <div className="op-form-value highlight">{currentPhase?.title}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reporting' && (
        <div className="op-content animate-fade-in">
          <div className="op-section glass-card">
            <h3 className="op-section-title">
              <span className="op-section-icon purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              </span>
              Reporting Information
            </h3>
            <div className="op-form-grid">
              <div className="op-form-item">
                <label>Signing firm</label>
                <div className="op-form-value">{opinionData.signingFirm}</div>
              </div>
              <div className="op-form-item">
                <label>Report type</label>
                <div className="op-form-value">{opinionData.reportType}</div>
              </div>
              <div className="op-form-item">
                <label>Report date</label>
                <div className="op-form-value">{opinionData.reportDate}</div>
              </div>
              <div className="op-form-item">
                <label>Serial number</label>
                <div className="op-form-value highlight serial">{opinionData.serialNumber}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="op-content animate-fade-in">
          <div className="op-section glass-card">
            <h3 className="op-section-title">
              <span className="op-section-icon teal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </span>
              Standard Report Templates
            </h3>
            <div className="template-list">
              <div className="template-card card-lift">
                <div className="template-icon-wrap blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div className="template-info">
                  <h4>Standard Unqualified Opinion</h4>
                  <p>标准无保留意见审计报告模板</p>
                </div>
                <button className="template-btn">使用</button>
              </div>
              <div className="template-card card-lift">
                <div className="template-icon-wrap purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div className="template-info">
                  <h4>Qualified Opinion - Scope Limitation</h4>
                  <p>保留意见审计报告模板（范围受限）</p>
                </div>
                <button className="template-btn">使用</button>
              </div>
              <div className="template-card card-lift">
                <div className="template-icon-wrap amber">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div className="template-info">
                  <h4>Emphasis of Matter Paragraph</h4>
                  <p>强调事项段审计报告模板</p>
                </div>
                <button className="template-btn">使用</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assembly' && (
        <div className="op-content animate-fade-in">
          <div className="op-section glass-card">
            <h3 className="op-section-title">
              <span className="op-section-icon amber">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </span>
              Hardcopy File Assembly
            </h3>
            <div className="assembly-card">
              <div className="assembly-icon-wrap">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className="assembly-info">
                <h4>Manage for current opinion profile</h4>
                <p>管理当前意见档案的纸质文件组装清单</p>
              </div>
              <button className="assembly-btn">管理文件</button>
            </div>
          </div>
        </div>
      )}

      {/* Other 区域 */}
      <div className="op-other-section animate-fade-in">
        <h3 className="op-other-title">Other</h3>
        <div className="op-other-grid">
          <div className="op-other-card glass-card">
            <h4>Financial statements (FS) typing and checking</h4>
            <p className="op-other-desc">Request for KDC FS services</p>
            <p className="op-other-guide">User guide: <span className="guide-link">CN</span> | <span className="guide-link">EN</span></p>
            <div className="op-other-dropdown">
              <button className="op-dropdown-btn" onClick={() => setFsDropdownOpen(!fsDropdownOpen)}>
                Select
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {fsDropdownOpen && (
                <div className="op-dropdown-menu animate-fade-in-scale">
                  <div className="op-dropdown-item">Request typing service</div>
                  <div className="op-dropdown-item">Request checking service</div>
                  <div className="op-dropdown-item">View status</div>
                </div>
              )}
            </div>
          </div>
          <div className="op-other-card glass-card">
            <h4>More actions</h4>
            <p className="op-other-desc">Access optional actions</p>
            <div className="op-other-dropdown">
              <button className="op-dropdown-btn" onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}>
                Select
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {moreDropdownOpen && (
                <div className="op-dropdown-menu animate-fade-in-scale">
                  <div className="op-dropdown-item">Export opinion profile</div>
                  <div className="op-dropdown-item">Clone profile</div>
                  <div className="op-dropdown-item">View history</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpinionProfile
