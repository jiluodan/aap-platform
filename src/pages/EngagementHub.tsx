import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  kcwFileIds: string[]
}

const opinionProfiles: OpinionProfile[] = [
  {
    id: 'OP001', name: 'Standard Unqualified', nameCn: '标准无保留意见', status: 'active',
    lastViewed: '2025-01-25', progress: 85,
    entityNameEn: 'Test 0323 | Test 0323', entityNameCn: '测试0323',
    opinionType: 'Assurance', kcwFileIds: ['KC001', 'KC002']
  },
  {
    id: 'OP002', name: 'Emphasis of Matter', nameCn: '强调事项段', status: 'draft',
    lastViewed: '2025-01-20', progress: 45,
    entityNameEn: '无 | 专项报告 test', entityNameCn: '专项报告测试',
    opinionType: 'Assurance', kcwFileIds: ['KC001', 'KC003']
  },
  {
    id: 'OP003', name: 'Qualified - Scope', nameCn: '保留意见（范围受限）', status: 'pending',
    lastViewed: '2025-01-18', progress: 20,
    entityNameEn: '无 | 验资报告 Test', entityNameCn: '验资报告测试',
    opinionType: 'Others', kcwFileIds: ['KC001']
  },
]

const kcwFiles: KCwFile[] = [
  {
    id: 'KC001', name: '241231_Stat_RF_sample2_FSA_ISA_single', nameCn: '241231_统计_RF_样本2_FSA_ISA_单一',
    status: 'completed', lastViewed: '2025-01-24', type: 'Planning',
    workbookOpinionName: '241231_Stat_RF_sample2_FSA_ISA_single',
    lastYearSerialNumber: 'Dummy Firm Cert No.2600020 / R0000012667(06)',
    currentYearAapId: 'R000001267106',
    opinionProfileIds: ['OP001', 'OP002', 'OP003']
  },
  {
    id: 'KC002', name: '241231_Stat_RF_sample2_FSA_ISA_single', nameCn: '241231_统计_RF_样本2_FSA_ISA_单一',
    status: 'in-progress', lastViewed: '2025-01-22', type: 'Risk',
    workbookOpinionName: '241231_Stat_RF_sample2_FSA_ISA_single',
    lastYearSerialNumber: 'Dummy Firm Cert No.2600093 / R000001267076(06)',
    currentYearAapId: 'R000001258885',
    opinionProfileIds: ['OP001']
  },
  {
    id: 'KC003', name: '241231_Stat_RF_sample2_FSA_ISA_single', nameCn: '241231_统计_RF_样本2_FSA_ISA_单一',
    status: 'pending', lastViewed: '2025-01-15', type: 'Fraud',
    workbookOpinionName: '241231_Stat_RF_sample2_FSA_ISA_single',
    lastYearSerialNumber: 'Dummy Firm Cert No.2600104 / R000001267079(06)',
    currentYearAapId: 'R000001258895',
    opinionProfileIds: ['OP002']
  },
]

function EngagementHub() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('lastViewed')
  const [viewMode, setViewMode] = useState<'tile' | 'list'>('tile')
  const [dataType, setDataType] = useState<'opinion' | 'kcw'>('opinion')
  const [expandedOpinionRows, setExpandedOpinionRows] = useState<Set<string>>(new Set())

  // Default expand first row on mount (only for opinion list view)
  useEffect(() => {
    if (dataType === 'opinion' && sortedOpinions.length > 0) {
      setExpandedOpinionRows(new Set([sortedOpinions[0].id]))
    }
  }, [dataType])

  const toggleOpinionRow = (id: string) => {
    const next = new Set(expandedOpinionRows)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedOpinionRows(next)
  }

  const expandAllRows = () => {
    setExpandedOpinionRows(new Set(sortedOpinions.map(op => op.id)))
  }

  const collapseAllRows = () => {
    setExpandedOpinionRows(new Set())
  }

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
            {viewMode === 'list' && dataType === 'opinion' && (
              <button className="expand-all-btn" onClick={expandedOpinionRows.size === sortedOpinions.length ? collapseAllRows : expandAllRows}>
                {expandedOpinionRows.size === sortedOpinions.length ? (lang === 'zh' ? '折叠全部' : 'Collapse All') : (lang === 'zh' ? '展开全部' : 'Expand All')}
              </button>
            )}
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

        {/* Tile + Opinion Profile */}
        {viewMode === 'tile' && dataType === 'opinion' && (
          <div className="opinion-kcw-content tile">
            {sortedOpinions.map(op => {
              const relatedKcw = getKcwFilesForOpinion(op)
              return (
                <div key={op.id} className="ok-item tile" onClick={() => handleOpinionClick(op.id)}>
                  <div className="ok-icon opinion-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <path d="M9 14l2 2 4-4"/>
                      <circle cx="16" cy="16" r="5" fill="var(--primary-100)" stroke="var(--primary-500)" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div className="ok-info">
                    <h4>{lang === 'zh' ? op.nameCn : op.name}</h4>
                    <div className="ok-meta">
                      <span className={`ok-status ${op.status}`}>{op.status}</span>
                      <span className="ok-date">{t('lastViewed')}: {op.lastViewed}</span>
                      <div className="ok-progress-bar">
                        <div className="ok-progress-fill" style={{ width: `${op.progress}%` }} />
                      </div>
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
        )}

        {/* Tile + KCw File */}
        {viewMode === 'tile' && dataType === 'kcw' && (
          <div className="opinion-kcw-content tile">
            {sortedKcwFiles.map(kf => {
              const relatedOps = getOpinionProfilesForKcw(kf)
              return (
                <div key={kf.id} className="ok-item tile kcw-tile">
                  <div className="ok-icon kcw-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      <line x1="12" y1="11" x2="12" y2="17"/>
                      <line x1="9" y1="14" x2="15" y2="14"/>
                    </svg>
                  </div>
                  <div className="ok-info">
                    <h4 className="kcw-name" title={kf.name}>{kf.name}</h4>
                    <div className="ok-meta">
                      <span className={`ok-status ${kf.status}`}>{kf.status}</span>
                      <span className="ok-date">{t('lastViewed')}: {kf.lastViewed}</span>
                    </div>
                    <div className="ok-related">
                      <span className="ok-related-label">{lang === 'zh' ? '关联意见档案' : 'Linked Opinion Profiles'}:</span>
                      <div className="ok-related-tags">
                        {relatedOps.map(op => (
                          <span key={op.id} className="ok-link-tag opinion-link" onClick={e => { e.stopPropagation(); handleOpinionClick(op.id) }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                            </svg>
                            {lang === 'zh' ? op.nameCn : op.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List + Opinion Profile */}
        {viewMode === 'list' && dataType === 'opinion' && (
          <div className="opinion-kcw-content list">
            {sortedOpinions.map(op => {
              const relatedKcw = getKcwFilesForOpinion(op)
              const isExpanded = expandedOpinionRows.has(op.id)
              return (
                <div key={op.id} className="ok-list-wrapper">
                  <div className="ok-item list" onClick={() => toggleOpinionRow(op.id)}>
                    <button className="ok-expand-btn-inline">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </button>
                    <div className="ok-icon opinion-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M9 14l2 2 4-4"/>
                        <circle cx="16" cy="16" r="5" fill="var(--primary-100)" stroke="var(--primary-500)" strokeWidth="1.5"/>
                      </svg>
                    </div>
                    <div className="ok-info">
                      <h4>{lang === 'zh' ? op.nameCn : op.name}</h4>
                      <div className="ok-meta">
                        <span className={`ok-status ${op.status}`}>{op.status}</span>
                        <span className="ok-date">{t('lastViewed')}: {op.lastViewed}</span>
                        <div className="ok-progress-bar">
                          <div className="ok-progress-fill" style={{ width: `${op.progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="ok-list-extra">
                      <span className="ok-extra-type">{op.opinionType}</span>
                      <span className="ok-extra-count">{relatedKcw.length} KCw</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="ok-list-expand animate-fade-in">
                      <div className="ok-expand-label">{lang === 'zh' ? '关联 KCw Files' : 'Linked KCw Files'}:</div>
                      <div className="ok-expand-tags">
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
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* List + KCw File */}
        {viewMode === 'list' && dataType === 'kcw' && (
          <div className="opinion-kcw-content list">
            {sortedKcwFiles.map(kf => {
              const relatedOps = getOpinionProfilesForKcw(kf)
              return (
                <div key={kf.id} className="ok-item list kcw-list">
                  <div className="ok-icon kcw-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      <line x1="12" y1="11" x2="12" y2="17"/>
                      <line x1="9" y1="14" x2="15" y2="14"/>
                    </svg>
                  </div>
                  <div className="ok-info">
                    <h4 className="kcw-name" title={kf.name}>{kf.name}</h4>
                    <div className="ok-meta">
                      <span className={`ok-status ${kf.status}`}>{kf.status}</span>
                      <span className="ok-date">{t('lastViewed')}: {kf.lastViewed}</span>
                    </div>
                  </div>
                  <div className="ok-list-extra">
                    <span className="ok-extra-label">{lang === 'zh' ? '关联 Opinion Profiles' : 'Linked Opinion Profiles'}:</span>
                    <div className="ok-related-tags horizontal">
                      {relatedOps.map(op => (
                        <span key={op.id} className="ok-link-tag opinion-link" onClick={e => { e.stopPropagation(); handleOpinionClick(op.id) }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                          {lang === 'zh' ? op.nameCn : op.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
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
            <div className="module-icon-bg rose">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
