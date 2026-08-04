import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import './ClientSummary.css'

interface ArmsProfile {
  id: string
  code: string
  name: string
  period: string
  status: 'active' | 'completed' | 'planning'
  progress: number
  riskLevel: 'high' | 'medium' | 'low'
  // Second layer preview data
  lifecyclePhase: string
  lifecyclePhaseEn: string
  pbcStatus: 'complete' | 'pending' | 'overdue'
  workPaperCount: number
  procedureCount: number
  openExceptions: number
  materiality: string
  dataCollectionStatus: 'complete' | 'in-progress' | 'not-started'
  opinionProfileStatus: 'draft' | 'submitted' | 'approved'
}

interface Client {
  id: string
  name: string
  nameEn: string
  industry: string
  gaap: string
  market: string
  armsProfiles: ArmsProfile[]
}

const clients: Client[] = [
  {
    id: '1',
    name: 'Aurora Robotics Systems Inc.',
    nameEn: 'Aurora Robotics Systems Inc. (Fictitious Demo Co.)',
    industry: '工业机器人与智能制造系统集成',
    gaap: '中国企业会计准则',
    market: 'Pre-IPO Growth Company',
    armsProfiles: [
      {
        id: 'e1', code: 'DEMO-ROBOT-2025', name: '2025年度财务报表审计',
        period: '2025.01-2025.12', status: 'active', progress: 68, riskLevel: 'high',
        lifecyclePhase: '执行阶段', lifecyclePhaseEn: 'Execution',
        pbcStatus: 'pending', workPaperCount: 156, procedureCount: 42,
        openExceptions: 8, materiality: 'CNY 4.2M',
        dataCollectionStatus: 'complete', opinionProfileStatus: 'draft',
      },
      {
        id: 'e2', code: 'DEMO-ROBOT-IPO', name: 'IPO审计',
        period: '2024.01-2025.12', status: 'active', progress: 35, riskLevel: 'high',
        lifecyclePhase: '计划阶段', lifecyclePhaseEn: 'Planning',
        pbcStatus: 'overdue', workPaperCount: 89, procedureCount: 28,
        openExceptions: 12, materiality: 'CNY 6.8M',
        dataCollectionStatus: 'in-progress', opinionProfileStatus: 'draft',
      },
      {
        id: 'e3', code: 'DEMO-ROBOT-IC', name: '内部控制审计',
        period: '2025.01-2025.12', status: 'planning', progress: 10, riskLevel: 'medium',
        lifecyclePhase: '风险评估', lifecyclePhaseEn: 'Risk Assessment',
        pbcStatus: 'complete', workPaperCount: 12, procedureCount: 8,
        openExceptions: 0, materiality: 'CNY 3.5M',
        dataCollectionStatus: 'not-started', opinionProfileStatus: 'draft',
      },
    ],
  },
  {
    id: '2',
    name: 'Stellar Pharma Group',
    nameEn: 'Stellar Pharma Group Limited',
    industry: '生物医药研发与制造',
    gaap: '中国企业会计准则',
    market: '科创板上市公司',
    armsProfiles: [
      {
        id: 'e4', code: 'STELLAR-2025', name: '2025年度财务报表审计',
        period: '2025.01-2025.12', status: 'active', progress: 45, riskLevel: 'medium',
        lifecyclePhase: '执行阶段', lifecyclePhaseEn: 'Execution',
        pbcStatus: 'complete', workPaperCount: 134, procedureCount: 38,
        openExceptions: 3, materiality: 'CNY 2.8M',
        dataCollectionStatus: 'complete', opinionProfileStatus: 'draft',
      },
    ],
  },
  {
    id: '3',
    name: 'Nova Energy Holdings',
    nameEn: 'Nova Energy Holdings Co., Ltd.',
    industry: '新能源发电与储能',
    gaap: '中国企业会计准则',
    market: '主板上市公司',
    armsProfiles: [
      {
        id: 'e5', code: 'NOVA-2025', name: '2025年度财务报表审计',
        period: '2025.01-2025.12', status: 'active', progress: 72, riskLevel: 'medium',
        lifecyclePhase: '报告阶段', lifecyclePhaseEn: 'Reporting',
        pbcStatus: 'complete', workPaperCount: 198, procedureCount: 51,
        openExceptions: 2, materiality: 'CNY 8.5M',
        dataCollectionStatus: 'complete', opinionProfileStatus: 'submitted',
      },
      {
        id: 'e6', code: 'NOVA-ESG', name: 'ESG报告鉴证',
        period: '2025.01-2025.12', status: 'planning', progress: 5, riskLevel: 'low',
        lifecyclePhase: '项目启动', lifecyclePhaseEn: 'Initiation',
        pbcStatus: 'complete', workPaperCount: 5, procedureCount: 3,
        openExceptions: 0, materiality: 'N/A',
        dataCollectionStatus: 'not-started', opinionProfileStatus: 'draft',
      },
    ],
  },
  {
    id: '4',
    name: 'Quantum Finance Corp',
    nameEn: 'Quantum Finance Corporation',
    industry: '金融科技与数字支付',
    gaap: '中国企业会计准则',
    market: 'Pre-IPO',
    armsProfiles: [
      {
        id: 'e7', code: 'QUANTUM-2025', name: '2025年度财务报表审计',
        period: '2025.01-2025.12', status: 'active', progress: 55, riskLevel: 'high',
        lifecyclePhase: '执行阶段', lifecyclePhaseEn: 'Execution',
        pbcStatus: 'overdue', workPaperCount: 112, procedureCount: 35,
        openExceptions: 15, materiality: 'CNY 1.9M',
        dataCollectionStatus: 'in-progress', opinionProfileStatus: 'draft',
      },
    ],
  },
]

function ClientSummary() {
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const [expandedClient, setExpandedClient] = useState<string | null>('1')

  const toggleExpand = (id: string) => {
    setExpandedClient(expandedClient === id ? null : id)
  }

  const getClientSummary = (client: Client) => {
    const total = client.armsProfiles.length
    const active = client.armsProfiles.filter(p => p.status === 'active').length
    const highRisk = client.armsProfiles.filter(p => p.riskLevel === 'high').length
    const totalExceptions = client.armsProfiles.reduce((sum, p) => sum + p.openExceptions, 0)
    const avgProgress = Math.round(client.armsProfiles.reduce((sum, p) => sum + p.progress, 0) / total)
    return { total, active, highRisk, totalExceptions, avgProgress }
  }

  return (
    <div className="client-summary animate-fade-in">
      {/* Page Header */}
      <div className="summary-header">
        <div>
          <h1 className="summary-title">{lang === 'zh' ? t('clientOverviewCn') : t('clientOverview')}</h1>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="summary-stats">
        <div className="stat-card-wide animate-stagger" style={{ animationDelay: '0s' }}>
          <div className="stat-icon-bg blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{clients.length}</span>
            <span className="stat-label">{t('activeClients')}</span>
          </div>
        </div>
        <div className="stat-card-wide animate-stagger" style={{ animationDelay: '0.06s' }}>
          <div className="stat-icon-bg green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{clients.reduce((sum, c) => sum + c.armsProfiles.filter(e => e.status === 'active').length, 0)}</span>
            <span className="stat-label">{t('activeProjects')}</span>
          </div>
        </div>
        <div className="stat-card-wide animate-stagger" style={{ animationDelay: '0.12s' }}>
          <div className="stat-icon-bg amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{clients.reduce((sum, c) => sum + c.armsProfiles.filter(e => e.status === 'planning').length, 0)}</span>
            <span className="stat-label">{t('plannedProjects')}</span>
          </div>
        </div>
        <div className="stat-card-wide animate-stagger" style={{ animationDelay: '0.18s' }}>
          <div className="stat-icon-bg red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-number">{clients.reduce((sum, c) => sum + c.armsProfiles.filter(e => e.riskLevel === 'high').length, 0)}</span>
            <span className="stat-label">{t('highRiskProjects')}</span>
          </div>
        </div>
      </div>

      {/* Client Cards List */}
      <div className="clients-list">
        {clients.map((client, index) => {
          const summary = getClientSummary(client)
          return (
            <div
              key={client.id}
              className={`client-card ${expandedClient === client.id ? 'expanded' : ''}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Client Header */}
              <div className="client-card-header" onClick={() => toggleExpand(client.id)}>
                <div className="client-identity">
                  <div className="client-avatar-large">{client.name.charAt(0)}</div>
                  <div className="client-names">
                    <h3 className="client-name-cn">{client.name}</h3>
                    <p className="client-name-en">{client.nameEn}</p>
                    <div className="client-tags">
                      <span className="client-tag">{client.industry}</span>
                      <span className="client-tag">{client.gaap}</span>
                      <span className="client-tag highlight">{client.market}</span>
                    </div>
                  </div>
                </div>

                {/* ARMS Profile Summary (replaces financials) */}
                <div className="client-arms-summary">
                  <div className="arms-sum-item">
                    <span className="arms-sum-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </span>
                    <span className="arms-sum-value">{summary.total}</span>
                    <span className="arms-sum-label">{t('armsProfiles')}</span>
                  </div>
                  <div className="arms-sum-item">
                    <span className="arms-sum-icon active">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </span>
                    <span className="arms-sum-value">{summary.active}</span>
                    <span className="arms-sum-label">{t('inProgress')}</span>
                  </div>
                  <div className="arms-sum-item">
                    <span className="arms-sum-icon alert">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>
                      </svg>
                    </span>
                    <span className="arms-sum-value">{summary.totalExceptions}</span>
                    <span className="arms-sum-label">{t('openExceptions')}</span>
                    {summary.totalExceptions > 5 && (
                      <span className="alert-pulse-dot"></span>
                    )}
                  </div>
                  <div className="arms-sum-item">
                    <span className="arms-sum-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </span>
                    <span className="arms-sum-value">{summary.avgProgress}%</span>
                    <span className="arms-sum-label">{t('progress')}</span>
                  </div>
                </div>

                {/* Roll Forward Button */}
                <button
                  className="roll-forward-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    alert(`Roll Forward Opinion Profile for ${client.name}`)
                  }}
                  title={t('rollForward')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                  <span>{t('rollForwardShort')}</span>
                </button>

                <div className="client-expand-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d={expandedClient === client.id ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'}/>
                  </svg>
                </div>
              </div>

              {/* Expanded ARMS Profile Cards */}
              {expandedClient === client.id && (
                <div className="engagements-section animate-fade-in">
                  <div className="engagements-header">
                    <h4>{t('engagementCodes')}</h4>
                    <span className="engagements-count">{t('projectsCount', { count: client.armsProfiles.length })}</span>
                  </div>
                  <div className="engagements-grid">
                    {client.armsProfiles.map((profile, pi) => (
                      <div
                        key={profile.id}
                        className={`engagement-card card-lift risk-${profile.riskLevel}`}
                        style={{ animationDelay: `${pi * 0.08}s` }}
                        onClick={() => navigate(`/engagement/${client.id}/${profile.id}`)}
                      >
                        <div className="eng-card-header">
                          <span className="eng-code">{profile.code}</span>
                          <span className={`eng-status ${profile.status}`}>
                            {profile.status === 'active' ? t('statusActive') : profile.status === 'planning' ? t('statusPlanning') : t('statusCompleted')}
                          </span>
                        </div>

                        {/* ARMS Profile Name */}
                        <h5 className="eng-name">
                          <span className="arms-name-text">{profile.name}</span>
                        </h5>

                        <p className="eng-period">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {profile.period}
                        </p>

                        {/* Progress */}
                        <div className="eng-progress">
                          <div className="eng-progress-bar">
                            <div className="eng-progress-fill" style={{ width: `${profile.progress}%` }}></div>
                          </div>
                          <span className="eng-progress-text">{profile.progress}%</span>
                        </div>

                        {/* Second Layer Key Info Icons */}
                        <div className="arms-info-row">
                          {/* Lifecycle Phase */}
                          <div className="arms-info-icon" title={`${t('lifecyclePhase')}: ${lang === 'zh' ? profile.lifecyclePhase : profile.lifecyclePhaseEn}`}>
                            <div className="info-icon-bg phase">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                              </svg>
                            </div>
                            <span className="info-icon-label">{lang === 'zh' ? profile.lifecyclePhase : profile.lifecyclePhaseEn}</span>
                          </div>

                          {/* PBC Status */}
                          <div className={`arms-info-icon ${profile.pbcStatus === 'overdue' ? 'alert' : ''}`} title={`${t('pbcStatus')}: ${profile.pbcStatus}`}>
                            <div className={`info-icon-bg pbc ${profile.pbcStatus}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                              </svg>
                            </div>
                            {profile.pbcStatus === 'overdue' && <span className="info-alert-dot"></span>}
                          </div>

                          {/* Work Papers */}
                          <div className="arms-info-icon" title={`${t('workPapers')}: ${profile.workPaperCount}`}>
                            <div className="info-icon-bg papers">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                              </svg>
                            </div>
                            <span className="info-icon-count">{profile.workPaperCount}</span>
                          </div>

                          {/* Procedures */}
                          <div className="arms-info-icon" title={`${t('auditProcedures')}: ${profile.procedureCount}`}>
                            <div className="info-icon-bg procedures">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                              </svg>
                            </div>
                            <span className="info-icon-count">{profile.procedureCount}</span>
                          </div>

                          {/* Exceptions */}
                          <div className={`arms-info-icon ${profile.openExceptions > 5 ? 'alert' : ''}`} title={`${t('openExceptions')}: ${profile.openExceptions}`}>
                            <div className={`info-icon-bg exceptions ${profile.openExceptions > 5 ? 'alert' : ''}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>
                              </svg>
                            </div>
                            {profile.openExceptions > 0 && (
                              <span className="info-icon-count">{profile.openExceptions}</span>
                            )}
                          </div>

                          {/* Materiality */}
                          <div className="arms-info-icon" title={`${t('materiality')}: ${profile.materiality}`}>
                            <div className="info-icon-bg materiality">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                              </svg>
                            </div>
                            <span className="info-icon-label small">{profile.materiality}</span>
                          </div>
                        </div>

                        {/* Risk Level */}
                        <div className="eng-footer">
                          <span className={`eng-risk ${profile.riskLevel}`}>
                            {profile.riskLevel === 'high' ? t('highRisk') : profile.riskLevel === 'medium' ? t('mediumRisk') : t('lowRisk')}
                          </span>
                          <span className="eng-arrow">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ClientSummary
