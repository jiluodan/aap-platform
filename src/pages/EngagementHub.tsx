import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './EngagementHub.css'

const engagementData = {
  clientName: 'Aurora Robotics Systems Inc.',
  engagementCode: 'DEMO-ROBOT-2025',
  engagementName: '2025年度财务报表审计',
  period: '2025.01.01 - 2025.12.31',
  materiality: 'CNY 12.6m',
  materialityPct: '5.8% of profit before tax',
  materialityPctCn: '税前利润的5.8%',
  progress: 68.5,
  alerts: { total: 28, closed: 20 },
  budget: { total: 800000, used: 650000 },
}

const opinionProfiles = [
  { id: 'OP001', name: 'Standard Unqualified', nameCn: '标准无保留意见', status: 'active', lastViewed: '2025-01-25', progress: 85 },
  { id: 'OP002', name: 'Emphasis of Matter', nameCn: '强调事项段', status: 'draft', lastViewed: '2025-01-20', progress: 45 },
  { id: 'OP003', name: 'Qualified - Scope', nameCn: '保留意见（范围受限）', status: 'pending', lastViewed: '2025-01-18', progress: 20 },
]

const kcwFiles = [
  { id: 'KC001', name: 'Audit Planning Memo', nameCn: '审计计划备忘录', status: 'completed', lastViewed: '2025-01-24', type: 'Planning' },
  { id: 'KC002', name: 'Risk Assessment Doc', nameCn: '风险评估文档', status: 'in-progress', lastViewed: '2025-01-22', type: 'Risk' },
  { id: 'KC003', name: 'Fraud Risk Analysis', nameCn: '舞弊风险分析', status: 'pending', lastViewed: '2025-01-15', type: 'Fraud' },
  { id: 'KC004', name: 'ITGC Testing Results', nameCn: 'IT一般控制测试结果', status: 'completed', lastViewed: '2025-01-20', type: 'ITGC' },
]

function EngagementHub() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('lastViewed')
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile')
  const [dataType, setDataType] = useState<'opinion' | 'kcw'>('opinion')

  const budgetPct = Math.round((engagementData.budget.used / engagementData.budget.total) * 100)
  const budgetOver = budgetPct > 100

  const currentData = dataType === 'opinion' ? opinionProfiles : kcwFiles

  const filteredData = currentData.filter(item => {
    const name = lang === 'zh' ? (item as any).nameCn : item.name
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'lastViewed') {
      return new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime()
    }
    const nameA = lang === 'zh' ? (a as any).nameCn : a.name
    const nameB = lang === 'zh' ? (b as any).nameCn : b.name
    if (sortBy === 'az') return nameA.localeCompare(nameB)
    if (sortBy === 'za') return nameB.localeCompare(nameA)
    return 0
  })

  return (
    <div className="engagement-hub animate-fade-in">
      {/* 面包屑 */}
      <div className="hub-breadcrumb">
        <button className="breadcrumb-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          {t('backToOverview')}
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{engagementData.engagementCode}</span>
      </div>

      {/* 项目头部信息 */}
      <div className="engagement-hero">
        <div className="hero-main">
          <h1 className="hero-title">{engagementData.clientName}</h1>
          <p className="hero-subtitle">{engagementData.engagementName}</p>
          <div className="hero-tags">
            <span className="hero-tag">Industry: 工业机器人与智能制造系统集成</span>
            <span className="hero-tag code">Engagement Code: {engagementData.engagementCode}</span>
            <span className="hero-tag">{t('financePeriod')}: {engagementData.period}</span>
          </div>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="hub-metrics">
        <div className="metric-card">
          <span className="metric-label">{t('planningMateriality')}</span>
          <span className="metric-value">{engagementData.materiality}</span>
          <span className="metric-sub">{lang === 'zh' ? engagementData.materialityPctCn : engagementData.materialityPct}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">{t('timeCostBudget')}</span>
          <span className="metric-value">CNY {(engagementData.budget.used / 10000).toFixed(1)}w</span>
          <span className="metric-sub">{t('budgetUsed', { pct: String(budgetPct) })}</span>
          <div className="metric-progress">
            <div
              className="metric-progress-bar"
              style={{
                width: `${Math.min(budgetPct, 100)}%`,
                background: budgetOver ? 'var(--coral-500)' : budgetPct > 80 ? 'var(--amber-500)' : 'var(--teal-400)',
              }}
            />
          </div>
          {budgetOver && <span className="budget-alert">{t('budgetOver')}</span>}
          {!budgetOver && budgetPct <= 80 && <span className="budget-ok">{t('budgetOnTrack')}</span>}
        </div>
        <div className="metric-card">
          <span className="metric-label">{t('alertClosure')}</span>
          <span className="metric-value">{engagementData.alerts.closed}/{engagementData.alerts.total}</span>
          <span className="metric-sub">8 significant alerts linked to Fraud & JE</span>
        </div>
      </div>

      {/* Opinion and KCw File Dashboard */}
      <div className="opinion-kcw-section">
        <div className="modules-tabs-header">
          <button className="modules-tab active">{t('opinionAndKCwTitle')}</button>
        </div>

        <div className="opinion-kcw-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sort-dropdown">
              <span>{t('sortBy')}:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="lastViewed">{t('lastViewed')}</option>
                <option value="az">{t('sortAZ')}</option>
                <option value="za">{t('sortZA')}</option>
              </select>
            </div>
          </div>
          <div className="toolbar-right">
            <div className="view-toggle">
              <button className={viewMode === 'tile' ? 'active' : ''} onClick={() => setViewMode('tile')}>
                {t('tileView')}
              </button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                {t('listView')}
              </button>
            </div>
            <div className="type-toggle">
              <button className={dataType === 'opinion' ? 'active' : ''} onClick={() => setDataType('opinion')}>
                {t('byOpinionProfile')}
              </button>
              <button className={dataType === 'kcw' ? 'active' : ''} onClick={() => setDataType('kcw')}>
                {t('byKCwFile')}
              </button>
            </div>
          </div>
        </div>

        <div className={`opinion-kcw-content ${viewMode}`}>
          {sortedData.map(item => (
            <div key={item.id} className={`ok-item ${viewMode}`}>
              <div className="ok-icon">
                {dataType === 'opinion' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                )}
              </div>
              <div className="ok-info">
                <h4>{lang === 'zh' ? (item as any).nameCn : item.name}</h4>
                <div className="ok-meta">
                  <span className={`ok-status ${item.status}`}>{item.status}</span>
                  <span className="ok-date">{t('lastViewed')}: {item.lastViewed}</span>
                  {'progress' in item && (
                    <div className="ok-progress-bar">
                      <div className="ok-progress-fill" style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                  {'type' in item && <span className="ok-type">{(item as any).type}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 功能模块 Tab 切换 */}
      <div className="hub-modules-tabs">
        <div className="modules-tabs-header">
          <button className="modules-tab active">{t('engagementModules')}</button>
        </div>
        <div className="modules-tabs-content">
          <div className="module-card card-lift" onClick={() => navigate(`/engagement/${clientId}/${engagementId}/procedures`)}>
            <div className="module-icon-bg blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="module-content">
              <h3>{t('moduleAuditProcedures')}</h3>
              <p>{lang === 'zh' ? '审计程序执行中心，包含Vouching、JE Testing、Credit Review等核心审计程序' : 'Audit procedure execution center, including Vouching, JE Testing, Credit Review and other core audit procedures'}</p>
            </div>
            <div className="module-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div className="module-card card-lift" onClick={() => navigate(`/engagement/${clientId}/${engagementId}/workpapers`)}>
            <div className="module-icon-bg amber">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="module-content">
              <h3>{t('pbcManager')}</h3>
              <p>{lang === 'zh' ? '客户资料收集与管理中心，追踪PBC清单状态及跟进事项' : 'Client-provided document collection and management center, tracking PBC list status and follow-ups'}</p>
            </div>
            <div className="module-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div className="module-card card-lift" onClick={() => navigate(`/engagement/${clientId}/${engagementId}/data`)}>
            <div className="module-icon-bg purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <div className="module-content">
              <h3>{lang === 'zh' ? '数据处理工程师' : 'Data Processing Engineer'}</h3>
              <p>{lang === 'zh' ? '财务数据采集、清洗、转换与分析处理中心，支持多数据源接入' : 'Financial data collection, cleaning, transformation and analysis center, supporting multi-source data access'}</p>
            </div>
            <div className="module-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EngagementHub
