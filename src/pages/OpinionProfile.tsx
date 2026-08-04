import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './OpinionProfile.css'

interface Phase {
  id: string
  title: string
  status: 'completed' | 'active' | 'pending'
  date?: string
}

const opinionPhases: Phase[] = [
  { id: '1', title: 'Submit opinion profile', status: 'completed', date: '2026-07-15' },
  { id: '2', title: 'Apply serial number', status: 'completed', date: '2026-07-18' },
  { id: '3', title: 'Submit final declaration', status: 'active' },
  { id: '4', title: 'Close out', status: 'pending' },
]

const opinionData = {
  entityNameEn: 'Demo-1',
  entityNameCn: 'Demo1',
  periodEnd: '2024-12-31',
  signingFirm: 'KPMG Huazhen LLP',
  reportType: 'Audit of financial information',
  reportDate: '2026-06-18',
  serialNumber: 'BJSHG2600002',
  currentPhase: 3,
}

function OpinionProfile() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')

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
      <div className="op-header">
        <div>
          <h1 className="op-title">Opinion Profile</h1>
          <p className="op-subtitle">审计意见配置与报告出具管理</p>
        </div>
        <div className="op-badge">
          <span className="op-phase-indicator">Phase {opinionData.currentPhase} of 4</span>
        </div>
      </div>

      {/* 流程指示器 */}
      <div className="op-flow">
        {opinionPhases.map((phase, index) => (
          <div key={phase.id} className={`op-flow-item ${phase.status}`}>
            <div className={`op-flow-dot ${phase.status}`}>
              {phase.status === 'completed' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="op-flow-title">{phase.title}</span>
            {phase.date && <span className="op-flow-date">{phase.date}</span>}
            {index < opinionPhases.length - 1 && (
              <div className={`op-flow-line ${phase.status === 'completed' ? 'active' : ''}`}></div>
            )}
          </div>
        ))}
      </div>

      {/* 待处理操作 */}
      <div className="op-pending-action">
        <div className="pending-info">
          <span className="pending-label">Pending your action</span>
          <span className="pending-desc">当前阶段需要您提交最终声明以完成审计意见配置</span>
        </div>
        <button className="pending-btn">Submit Final Declaration</button>
      </div>

      {/* 标签页内容 */}
      <div className="op-tabs">
        <button className={activeTab === 'basic' ? 'active' : ''} onClick={() => setActiveTab('basic')}>基本信息</button>
        <button className={activeTab === 'reporting' ? 'active' : ''} onClick={() => setActiveTab('reporting')}>报告信息</button>
        <button className={activeTab === 'templates' ? 'active' : ''} onClick={() => setActiveTab('templates')}>报告模板</button>
        <button className={activeTab === 'assembly' ? 'active' : ''} onClick={() => setActiveTab('assembly')}>文件组装</button>
      </div>

      {activeTab === 'basic' && (
        <div className="op-content animate-fade-in">
          <div className="op-section">
            <h3 className="op-section-title">Basic Information</h3>
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
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reporting' && (
        <div className="op-content animate-fade-in">
          <div className="op-section">
            <h3 className="op-section-title">Reporting Information</h3>
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
                <div className="op-form-value highlight">{opinionData.serialNumber}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="op-content animate-fade-in">
          <div className="op-section">
            <h3 className="op-section-title">Standard Report Templates</h3>
            <div className="template-list">
              <div className="template-card">
                <div className="template-icon">📄</div>
                <div className="template-info">
                  <h4>Standard Unqualified Opinion</h4>
                  <p>标准无保留意见审计报告模板</p>
                </div>
                <button className="template-btn">使用</button>
              </div>
              <div className="template-card">
                <div className="template-icon">📄</div>
                <div className="template-info">
                  <h4>Qualified Opinion - Scope Limitation</h4>
                  <p>保留意见审计报告模板（范围受限）</p>
                </div>
                <button className="template-btn">使用</button>
              </div>
              <div className="template-card">
                <div className="template-icon">📄</div>
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
          <div className="op-section">
            <h3 className="op-section-title">Hardcopy File Assembly</h3>
            <div className="assembly-card">
              <div className="assembly-icon">📁</div>
              <div className="assembly-info">
                <h4>Manage for current opinion profile</h4>
                <p>管理当前意见档案的纸质文件组装清单</p>
              </div>
              <button className="assembly-btn">管理文件</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OpinionProfile
