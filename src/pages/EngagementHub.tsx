import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import './EngagementHub.css'

const engagementData = {
  clientName: 'Aurora Robotics Systems Group.',
  engagementCode: '1668465',
  engagementName: '2025 Aurora Robotics SH annual audit',
  period: '2025.01.01 - 2025.12.31',
  materiality: 'CNY 12.6m',
  materialityPct: '5.8% of profit before tax',
  materialityPctCn: '税前利润的5.8%',
  progress: 68.5,
  alerts: { total: 28, closed: 20 },
  budget: { total: 800000, used: 650000 },
}

interface KCwFile {
  id: string
  name: string
  nameCn: string
  status: string
  lastViewed: string
  type: string
  workbookOpinionName: string
  lastYearSerialNumber: string
  currentYearAapId: string
  opinionProfileIds: string[]
}

interface OpinionProfile {
  id: string
  name: string
  nameCn: string
  status: string
  lastViewed: string
  progress: number
  entityNameEn: string
  entityNameCn: string
  opinionType: string
  opinionTypeCn: string
  reportType: string
  reportTypeCn: string
  kcwFileIds: string[]
  phase: number // 1=Submit opinion profile, 2=Apply serial number, 3=Submit Final declaration, 4=Close out
}

const opinionProfiles: OpinionProfile[] = [
  {
    id: 'OP001', name: 'Standard Unqualified', nameCn: '标准无保留意见', status: 'active',
    lastViewed: '2025-01-25', progress: 85,
    entityNameEn: 'Aurora Technology Group Co., Ltd.', entityNameCn: ' Aurora 科技集团有限公司',
    opinionType: 'Financial statement audit', reportType: 'Annual Audit',
    opinionTypeCn: '财务报表审计', reportTypeCn: '年度审计',
    kcwFileIds: ['KC001', 'KC002'], phase: 3
  },
  {
    id: 'OP002', name: 'Emphasis of Matter', nameCn: '强调事项段', status: 'draft',
    lastViewed: '2025-01-20', progress: 45,
    entityNameEn: 'Golden Horizon Investment Holdings', entityNameCn: '金地平线投资控股有限公司',
    opinionType: 'Component reporting', reportType: 'Review of financial information',
    opinionTypeCn: '组成部分报告', reportTypeCn: '财务信息审阅',
    kcwFileIds: ['KC003', 'KC004'], phase: 2
  },
  {
    id: 'OP003', name: 'Qualified - Scope', nameCn: '保留意见（范围受限）', status: 'pending',
    lastViewed: '2025-01-18', progress: 20,
    entityNameEn: 'Pacific Star Real Estate Development Co., Ltd.', entityNameCn: '太平洋星房地产开发有限公司',
    opinionType: 'Others', reportType: 'Annual Audit',
    opinionTypeCn: '其他', reportTypeCn: '年度审计',
    kcwFileIds: ['KC005'], phase: 1
  },
]

const kcwFiles: KCwFile[] = [
  {
    id: 'KC001', name: '241231_Stat_RF_Aurora_Planning', nameCn: '241231_统计_RF_Aurora_计划',
    status: 'completed', lastViewed: '2025-01-24', type: 'Planning',
    workbookOpinionName: '241231_Stat_RF_Aurora_Planning',
    lastYearSerialNumber: 'Dummy Firm Cert No.2600020 / R0000012667(06)',
    currentYearAapId: 'R000001267106',
    opinionProfileIds: ['OP001']
  },
  {
    id: 'KC002', name: '241231_Stat_RF_Aurora_Risk', nameCn: '241231_统计_RF_Aurora_风险',
    status: 'in-progress', lastViewed: '2025-01-22', type: 'Risk',
    workbookOpinionName: '241231_Stat_RF_Aurora_Risk',
    lastYearSerialNumber: 'Dummy Firm Cert No.2600093 / R000001267076(06)',
    currentYearAapId: 'R000001258885',
    opinionProfileIds: ['OP001']
  },
  {
    id: 'KC003', name: '241231_Stat_RF_GoldenHorizon_Planning', nameCn: '241231_统计_RF_金地平线_计划',
    status: 'pending', lastViewed: '2025-01-15', type: 'Planning',
    workbookOpinionName: '241231_Stat_RF_GoldenHorizon_Planning',
    lastYearSerialNumber: 'Dummy Firm Cert No.2600104 / R000001267079(06)',
    currentYearAapId: 'R000001258895',
    opinionProfileIds: ['OP002']
  },
  {
    id: 'KC004', name: '241231_Stat_RF_GoldenHorizon_Fraud', nameCn: '241231_统计_RF_金地平线_舞弊',
    status: 'not-started', lastViewed: '2025-01-10', type: 'Fraud',
    workbookOpinionName: '241231_Stat_RF_GoldenHorizon_Fraud',
    lastYearSerialNumber: 'Dummy Firm Cert No.2600115 / R000001267082(06)',
    currentYearAapId: 'R000001258906',
    opinionProfileIds: ['OP002']
  },
  {
    id: 'KC005', name: '241231_Stat_RF_PacificStar_Single', nameCn: '241231_统计_RF_太平洋星_单一',
    status: 'on-hold', lastViewed: '2025-01-08', type: 'Risk',
    workbookOpinionName: '241231_Stat_RF_PacificStar_Single',
    lastYearSerialNumber: 'Dummy Firm Cert No.2600128 / R000001267095(06)',
    currentYearAapId: 'R000001258917',
    opinionProfileIds: ['OP003']
  },
]

// Phase steps definition
const PHASE_STEPS = [
  { key: 1, label: 'Submit opinion profile', labelCn: '提交意见档案' },
  { key: 2, label: 'Apply serial number', labelCn: '申请编号' },
  { key: 3, label: 'Submit Final declaration', labelCn: '提交最终声明' },
  { key: 4, label: 'Close out', labelCn: '关闭' },
]

// KCw File completion status types
const KCW_STATUS_TYPES = [
  { key: 'completed', label: 'Completed', labelCn: '已完成', color: '#10b981', bgColor: '#d1fae5' },
  { key: 'in-progress', label: 'In Progress', labelCn: '进行中', color: '#f59e0b', bgColor: '#fef3c7' },
  { key: 'pending', label: 'Pending', labelCn: '待处理', color: '#94a3b8', bgColor: '#f1f5f9' },
  { key: 'not-started', label: 'Not Started', labelCn: '未开始', color: '#d1d5db', bgColor: '#f9fafb' },
  { key: 'on-hold', label: 'On Hold', labelCn: '暂停', color: '#ef4444', bgColor: '#fee2e2' },
]

// Completion status phases for popup detail view
const COMPLETION_PHASES = [
  { key: 'preliminary', label: 'Preliminary Activities', labelCn: '初步活动', value: '85%' },
  { key: 'planning', label: 'Planning', labelCn: '计划', value: '72%' },
  { key: 'intiem', label: 'Inteim response', labelCn: '中期回应', value: '45%' },
  { key: 'final', label: 'Final response', labelCn: '最终回应', value: '20%' },
  { key: 'completion', label: 'Completion', labelCn: '完成', value: '0%' },
]

function EngagementHub() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('lastViewed')
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile')
  const [listTab, setListTab] = useState<'opinion' | 'kcw'>('opinion')
  // Completion status popup: store the active KCw file + its badge screen position
  const [completionPopup, setCompletionPopup] = useState<{ kf: any; left: number; top: number } | null>(null)

  // Calculate popup position (flip upward if near bottom of viewport)
  const calcPopupPos = (badgeEl: HTMLElement) => {
    const rect = badgeEl.getBoundingClientRect()
    const POPUP_HEIGHT_ESTIMATE = 220 // approximate height in px
    const GAP = 4
    const spaceBelow = window.innerHeight - rect.bottom - GAP
    if (spaceBelow < POPUP_HEIGHT_ESTIMATE) {
      // Not enough space below → pop up above the badge
      return { left: rect.left, top: rect.top - POPUP_HEIGHT_ESTIMATE - GAP }
    }
    // Default: pop down below the badge
    return { left: rect.left, top: rect.bottom + GAP }
  }

  // Lock body scroll while popup is open
  useEffect(() => {
    if (completionPopup) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [completionPopup])

  const budgetPct = Math.round((engagementData.budget.used / engagementData.budget.total) * 100)
  const budgetOver = budgetPct > 100

  // Bar chart data for engagement metrics - vertical bar chart
  interface BarMetricItem {
    label: string
    value: number
    maxValue: number
    unit: string
    color: string
  }

  const engagementMetrics: BarMetricItem[] = [
    { label: 'Time (hrs)', value: 1240, maxValue: 1600, unit: '', color: '#3b82f6' },
    { label: 'Cost (CNY)', value: 65, maxValue: 80, unit: 'w', color: '#10b981' },
    { label: 'Budget Used', value: 81, maxValue: 100, unit: '%', color: budgetOver ? '#ef4444' : budgetPct > 80 ? '#f59e0b' : '#10b981' },
    { label: 'Fee (CNY)', value: 42, maxValue: 60, unit: 'w', color: '#8b5cf6' },
    { label: 'FRR (%)', value: 68, maxValue: 100, unit: '%', color: '#06b6d4' },
    { label: 'WIP (hrs)', value: 320, maxValue: 500, unit: '', color: '#f97316' },
  ]

  const getKcwFilesForOpinion = (op: OpinionProfile) => {
    return kcwFiles.filter(kf => op.kcwFileIds.includes(kf.id))
  }

  const getOpinionProfilesForKcw = (kf: KCwFile) => {
    return opinionProfiles.filter(op => kf.opinionProfileIds.includes(op.id))
  }

  // Unique KCW File count across all Opinion Profiles (deduplicated)
  const uniqueLinkedKcwCount = new Set(
    opinionProfiles.flatMap(op => op.kcwFileIds)
  ).size

  const filteredOpinions = opinionProfiles.filter(op => {
    const name = lang === 'zh' ? op.nameCn : op.name
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredKcwFiles = kcwFiles.filter(kf => {
    const name = lang === 'zh' ? kf.nameCn : kf.name
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const sortedOpinions = [...filteredOpinions].sort((a, b) => {
    if (sortBy === 'lastViewed') {
      return new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime()
    }
    const nameA = lang === 'zh' ? a.nameCn : a.name
    const nameB = lang === 'zh' ? b.nameCn : b.name
    if (sortBy === 'az') return nameA.localeCompare(nameB)
    if (sortBy === 'za') return nameB.localeCompare(nameA)
    return 0
  })

  const sortedKcwFiles = [...filteredKcwFiles].sort((a, b) => {
    if (sortBy === 'lastViewed') {
      return new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime()
    }
    const nameA = lang === 'zh' ? a.nameCn : a.name
    const nameB = lang === 'zh' ? b.nameCn : b.name
    if (sortBy === 'az') return nameA.localeCompare(nameB)
    if (sortBy === 'za') return nameB.localeCompare(nameA)
    return 0
  })

  const handleOpinionClick = (opinionId: string) => {
    navigate(`/opinion/${clientId}/${engagementId}/${opinionId}`)
  }

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
        <span className="breadcrumb-current">{engagementData.engagementName}</span>
      </div>

      {/* 项目头部信息 + 迷你柱状图 */}
      <div className="engagement-hero">
        <div className="hero-main">
          <h1 className="hero-title">{engagementData.clientName}</h1>
          <p className="hero-subtitle">{engagementData.engagementName}</p>
          <div className="hero-tags">
            <span className="hero-tag">Industry: 工业机器人与智能制造系统集成</span>
            <span className="hero-tag code">Engagement Code: {engagementData.engagementCode}</span>
          </div>
        </div>
        {/* Mini Bar Chart in Hero Right */}
        <div className="hero-mini-chart">
          {engagementMetrics.map((metric, index) => (
            <div key={index} className="mini-bar-item">
              <span className="mini-bar-label">{metric.label}</span>
              <div className="mini-bar-track">
                <div
                  className="mini-bar-fill"
                  style={{
                    height: `${(metric.value / metric.maxValue) * 100}%`,
                    background: metric.color,
                  }}
                />
              </div>
              <span className="mini-bar-value" style={{ color: metric.color }}>{metric.value}{metric.unit}</span>
            </div>
          ))}
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
            {/* View mode toggle - moved next to Sort By */}
            <div className="view-toggle-inline">
              <button className={`view-btn ${viewMode === 'tile' ? 'active' : ''}`} onClick={() => setViewMode('tile')}>
                <i className="fas fa-th-large"></i>
                <span>{t('tileView')}</span>
              </button>
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                <i className="fas fa-list"></i>
                <span>{t('listView')}</span>
              </button>
              {viewMode === 'list' && listTab === 'opinion' && (
                <button
                  className="add-opinion-btn"
                  onClick={() => {}}
                  title={lang === 'zh' ? '新增 Opinion Profile' : 'Add Opinion Profile'}
                >
                  <i className="fas fa-plus"></i> New Opinion Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'tile' ? (
          /* ===== TILE VIEW: Two-column layout (unchanged) ===== */
          <div className="opinion-kcw-content two-column">
            {/* Left: Opinion Profile */}
            <div className="opinion-column">
              <h3 className="column-title">
                <i className="fas fa-file-alt"></i> Opinion Profile
                <span className="column-count">{sortedOpinions.length}</span>
              </h3>
              <div className="opinion-grid">
                {sortedOpinions.map(op => {
                  const relatedKcw = getKcwFilesForOpinion(op)
                  return (
                    <div key={op.id} className="ok-item tile" onClick={() => handleOpinionClick(op.id)}>
                      <div className="ok-header-row">
                        <div className="ok-icon opinion-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <path d="M9 14l2 2 4-4"/>
                            <circle cx="16" cy="16" r="5" fill="var(--primary-100)" stroke="var(--primary-500)" strokeWidth="1.5"/>
                          </svg>
                        </div>
                        <h4 className="ok-title-inline">{lang === 'zh' ? op.entityNameCn : op.entityNameEn}</h4>
                      </div>
                      <div className="ok-info">
                        {/* Phase stepper */}
                        <div className="phase-stepper">
                          {PHASE_STEPS.map((step, idx) => (
                            <div key={step.key} className={`phase-step ${op.phase >= step.key ? 'active' : ''} ${op.phase === step.key ? 'current' : ''}`}>
                              <div className="phase-dot">{step.key}</div>
                              {idx < PHASE_STEPS.length - 1 && <div className={`phase-line ${op.phase > step.key ? 'active' : ''}`} />}
                            </div>
                          ))}
                        </div>
                        <div className="phase-label">
                          {lang === 'zh' ? PHASE_STEPS.find(s => s.key === op.phase)?.labelCn : PHASE_STEPS.find(s => s.key === op.phase)?.label}
                        </div>
                      </div>
                      <div className="ok-related">
                        <span className="ok-related-label">{lang === 'zh' ? '关联 KCw Files' : 'Linked KCw Files'}:</span>
                        <div className="ok-related-tags">
                          {relatedKcw.map(kf => (
                            <span key={kf.id} className="ok-link-tag kcw-link" onClick={e => e.stopPropagation()}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                              </svg>
                              {kf.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: KCw File */}
            <div className="kcw-column">
              <h3 className="column-title">
                <i className="fas fa-database"></i> KCw File
                <span className="column-count">{uniqueLinkedKcwCount}</span>
              </h3>
              <div className="kcw-grid">
                {sortedKcwFiles.map(kf => {
                  const relatedOps = getOpinionProfilesForKcw(kf)
                  const statusInfo = KCW_STATUS_TYPES.find(s => s.key === kf.status) || KCW_STATUS_TYPES[2]
                  return (
                    <div key={kf.id} className="ok-item tile kcw-tile">
                      <div className="ok-header-row">
                        <div className="ok-icon kcw-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            <line x1="12" y1="11" x2="12" y2="17"/>
                            <line x1="9" y1="14" x2="15" y2="14"/>
                          </svg>
                        </div>
                        <h4 className="ok-title-inline kcw-name" title={kf.name}>{kf.name}</h4>
                      </div>
                      <div className="ok-info">
                        <div className="ok-meta">
                          {/* Completion Status - clickable badge */}
                          <span
                            className="completion-status-badge"
                            style={{ color: statusInfo.color, background: statusInfo.bgColor }}
                            onClick={e => {
                              e.stopPropagation()
                              if (completionPopup?.kf.id === kf.id) {
                                setCompletionPopup(null)
                              } else {
                                const pos = calcPopupPos(e.currentTarget as HTMLElement)
                                setCompletionPopup({ kf, ...pos })
                              }
                            }}
                            title={lang === 'zh' ? '点击查看完成状态详情' : 'Click to view completion status details'}
                          >
                            {lang === 'zh' ? '完成状态' : 'Completion Status'}
                            <i className="fas fa-chevron-right" style={{ fontSize: '9px', marginLeft: '4px' }}></i>
                          </span>
                        </div>
                        <div className="ok-related">
                          <span className="ok-related-label">{lang === 'zh' ? '关联意见档案' : 'Linked Opinion Profiles'}:</span>
                          <div className="ok-related-tags">
                            {relatedOps.map(op => (
                              <span key={op.id} className="ok-link-tag opinion-link" onClick={e => { e.stopPropagation(); handleOpinionClick(op.id) }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                </svg>
                                {lang === 'zh' ? op.entityNameCn : op.entityNameEn}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ===== LIST VIEW: Tab switching + Table layout ===== */
          <div className="list-view-container">
            {/* Tab bar with icon buttons */}
            <div className="list-view-tab-bar">
              <button
                className={`list-view-tab ${listTab === 'opinion' ? 'active' : ''}`}
                onClick={() => setListTab('opinion')}
              >
                <span className="tab-dot opinion-dot"></span>
                {lang === 'zh' ? 'Opinion Profile' : 'Opinion Profile'}
                <span className="tab-count">{sortedOpinions.length}</span>
              </button>
              <button
                className={`list-view-tab ${listTab === 'kcw' ? 'active' : ''}`}
                onClick={() => setListTab('kcw')}
              >
                <span className="tab-dot kcw-dot"></span>
                KCw File
                <span className="tab-count">{uniqueLinkedKcwCount}</span>
              </button>
            </div>

            {/* Table content area */}
            <div className="data-table-container">
              {listTab === 'opinion' ? (
                /* ========== OPINION TABLE ========== */
                <table className="data-table opinion-table">
                  <thead>
                    <tr>
                      <th className="col-aap-id">AAP ID</th>
                      <th className="col-entity">{lang === 'zh' ? 'Entity name' : 'Entity name'}</th>
                      <th className="col-opinion-type">{lang === 'zh' ? '意见类型' : 'Opinion Type'}</th>
                      <th className="col-report-type">{lang === 'zh' ? '报告类型' : 'Report Type'}</th>
                      <th className="col-period">{lang === 'zh' ? 'Financial period end' : 'Financial period end'}</th>
                      <th className="col-report-date">{lang === 'zh' ? 'Report date' : 'Report date'}</th>
                      <th className="col-phase">Phase 1</th>
                      <th className="col-phase">Phase 2</th>
                      <th className="col-phase">Phase 3</th>
                      <th className="col-phase">Phase 4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOpinions.map(op => (
                      <tr key={op.id} className="clickable-row" onClick={() => handleOpinionClick(op.id)}>
                        <td className="col-aap-id"><span className="aap-id-link">{op.id}</span></td>
                        <td className="col-entity">
                          <div>{lang === 'zh' ? op.entityNameCn : op.entityNameEn}</div>
                        </td>
                        <td className="col-opinion-type">{lang === 'zh' ? op.opinionTypeCn : op.opinionType}</td>
                        <td className="col-report-type">{lang === 'zh' ? op.reportTypeCn : op.reportType}</td>
                        <td className="col-period">2025-12-31</td>
                        <td className="col-report-date">2026-04-30</td>
                        {[1, 2, 3, 4].map(phaseNum => (
                          <td key={phaseNum} className="col-phase">
                            {op.phase > phaseNum ? (
                              <span className="phase-check done" title={lang === 'zh' ? PHASE_STEPS[phaseNum - 1].labelCn : PHASE_STEPS[phaseNum - 1].label}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="11" fill="#10b981" fillOpacity="0.15"/>
                                  <path d="M8 12l3 3 5-6" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            ) : op.phase === phaseNum ? (
                              <span className="phase-check current" title={lang === 'zh' ? PHASE_STEPS[phaseNum - 1].labelCn : PHASE_STEPS[phaseNum - 1].label}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="11" fill="#f59e0b" fillOpacity="0.15"/>
                                  <circle cx="12" cy="12" r="4.5" fill="#f59e0b"/>
                                </svg>
                              </span>
                            ) : (
                              <span className="phase-check pending" title={lang === 'zh' ? PHASE_STEPS[phaseNum - 1].labelCn : PHASE_STEPS[phaseNum - 1].label}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="11" fill="#ef4444" fillOpacity="0.15"/>
                                  <path d="M12 7v6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                                  <circle cx="12" cy="17" r="1.5" fill="#ef4444"/>
                                </svg>
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* ========== KCw FILE TABLE ========== */
                <table className="data-table kcw-table">
                  <thead>
                    <tr>
                      <th className="col-kcw-name">{lang === 'zh' ? 'KCw file name' : 'KCw file name'}</th>
                      <th className="col-kcw-workflow">{lang === 'zh' ? 'Workflow' : 'Workflow'}</th>
                      <th className="col-kcw-rate">{lang === 'zh' ? 'COMPLETION RATE' : 'COMPLETION RATE'}</th>
                      <th className="col-kcw-actions">{lang === 'zh' ? 'Manage KCw file' : 'Manage KCw file'}</th>
                      <th className="col-kcw-linked-count">{lang === 'zh' ? 'Numbers of linked opinion profile' : 'Numbers of linked opinion profile'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedKcwFiles.map(kf => {
                      const relatedOps = getOpinionProfilesForKcw(kf)
                      const statusInfo = KCW_STATUS_TYPES.find(s => s.key === kf.status) || KCW_STATUS_TYPES[2]
                      // Workflow label mapping: type -> display name
                      const workflowMap: Record<string, string> = {
                        'Planning': 'Enhanced',
                        'Risk': 'Standard',
                        'Fraud': 'Generic',
                      }
                      const workflowLabel = workflowMap[kf.type] || kf.type
                      // Completion rate mapping: status key -> percentage
                      const rateMap: Record<string, string> = {
                        'completed': '100%',
                        'in-progress': '78.5%',
                        'pending': '2%',
                        'not-started': '0%',
                        'on-hold': '12%',
                      }
                      return (
                        <tr key={kf.id}>
                          <td className="col-kcw-name" title={kf.name}>{kf.name}</td>
                          <td className="col-kcw-workflow">
                            <span className={`workflow-badge ${workflowLabel.toLowerCase()}`}>{workflowLabel}</span>
                          </td>
                          <td className="col-kcw-rate">
                            <span className="completion-rate" style={{ color: statusInfo.color }}>{rateMap[kf.status] || '0%'}</span>
                          </td>
                          <td className="col-kcw-actions">
                            <div className="kcw-action-group">
                              <button className="kcw-action-btn team" title={lang === 'zh' ? 'Team member' : 'Team member'}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0b6e99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                {lang === 'zh' ? 'Team member' : 'Team member'}
                              </button>
                            </div>
                          </td>
                          <td className="col-kcw-linked-count">{relatedOps.length}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 功能模块 Tab 切换 */}
      <div className="hub-modules-tabs">
        <div className="modules-tabs-header">
          <button className="modules-tab active">{t('engagementModules')}</button>
        </div>
        <div className="modules-tabs-content">
          <div className="module-card card-lift" onClick={() => navigate(`/engagement/${clientId}/${engagementId}/pbc`)}>
            <div className="module-icon-bg amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="module-content">
              <h3>{t('pbcManager')}</h3>
              <p>{lang === 'zh' ? '客户资料收集与管理中心，追踪PBC清单状态及跟进事项' : 'Client-provided document collection and management center, tracking PBC list status and follow-ups'}</p>
            </div>
            <div className="module-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div className="module-card card-lift" onClick={() => navigate(`/engagement/${clientId}/${engagementId}/data`)}>
            <div className="module-icon-bg purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              </svg>
            </div>
            <div className="module-content">
              <h3>{lang === 'zh' ? '数据处理工程师' : 'Data Processing Engineer'}</h3>
              <p>{lang === 'zh' ? '财务数据采集、清洗、转换与分析处理中心，支持多数据源接入' : 'Financial data collection, cleaning, transformation and analysis center, supporting multi-source data access'}</p>
            </div>
            <div className="module-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div className="module-card card-lift" onClick={() => navigate(`/engagement/${clientId}/${engagementId}/procedures`)}>
            <div className="module-icon-bg blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="module-content">
              <h3>{t('moduleAuditProcedures')}</h3>
              <p>{lang === 'zh' ? '审计程序执行中心，包含Vouching、JE Testing、Credit Review等核心审计程序' : 'Audit procedure execution center, including Vouching, JE Testing, Credit Review and other core audit procedures'}</p>
            </div>
            <div className="module-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div className="module-card card-lift" onClick={() => navigate(`/engagement/${clientId}/${engagementId}/workpapers`)}>
            <div className="module-icon-bg rose">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
                <path d="M12 11v6"/>
                <path d="m15 14-3-3-3 3"/>
              </svg>
            </div>
            <div className="module-content">
              <h3>Work Paper Station</h3>
              <p>Template management center for audit work papers, maintaining standardized templates for all engagement procedures</p>
            </div>
            <div className="module-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      {completionPopup && createPortal(
        <div className="popup-overlay" onClick={() => setCompletionPopup(null)}>
          <div
            className="completion-popup"
            style={{ position: 'fixed', left: completionPopup.left, top: completionPopup.top }}
            onClick={e => e.stopPropagation()}
          >
            <div className="popup-header">
              <span>{lang === 'zh' ? '完成状态' : 'Completion status'}</span>
              <button className="popup-close" onClick={() => setCompletionPopup(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="popup-body popup-phase-body">
              {COMPLETION_PHASES.map(phase => (
                <div key={phase.key} className="popup-phase-row">
                  <span className="phase-label-text">{lang === 'zh' ? phase.labelCn : phase.label}</span>
                  <span className="phase-value-na">{phase.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default EngagementHub
