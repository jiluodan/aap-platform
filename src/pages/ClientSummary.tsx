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
  budgetOverrun: boolean
}

interface Client {
  id: string
  name: string
  nameEn: string
  industry: string
  gaap: string
  market: string
  armsProfiles: ArmsProfile[]
  kycRiskLevel: 'red' | 'yellow' | 'green'
  // ARMS Profile Code and client classification info
  armsProfileCode: string
  clientType: string
  clientLob: string
  sector: string
}

const clients: Client[] = [
  {
    id: '1',
    name: 'Aurora Robotics Systems Group.',
    nameEn: 'Aurora Robotics Aurora Robotics Systems Group. 1001452765',
    industry: '工业机器人与智能制造系统集成',
    gaap: '中国企业会计准则',
    market: 'Pre-IPO Growth Company',
    kycRiskLevel: 'red',
    armsProfileCode: '2025-00479-01',
    clientType: 'State owned enterprise',
    clientLob: 'IGH',
    sector: 'Real Estate and Building Construction',
    armsProfiles: [
      {
        id: 'e1', code: '1668465', name: '2025 Aurora Robotics SH annual audit',
        period: '2025.01-2025.12', status: 'active', progress: 68, riskLevel: 'high',
        lifecyclePhase: '执行阶段', lifecyclePhaseEn: 'Execution',
        pbcStatus: 'pending', workPaperCount: 156, procedureCount: 42,
        openExceptions: 8, materiality: 'CNY 4.2M',
        dataCollectionStatus: 'complete', opinionProfileStatus: 'draft',
        budgetOverrun: true,
      },
      {
        id: 'e2', code: '1659011', name: '2025 Aurora Robotics BJ annual audit',
        period: '2024.01-2025.12', status: 'active', progress: 35, riskLevel: 'high',
        lifecyclePhase: '计划阶段', lifecyclePhaseEn: 'Planning',
        pbcStatus: 'overdue', workPaperCount: 89, procedureCount: 28,
        openExceptions: 12, materiality: 'CNY 6.8M',
        dataCollectionStatus: 'in-progress', opinionProfileStatus: 'draft',
        budgetOverrun: false,
      },
      {
        id: 'e3', code: '1605824', name: '2025 Aurora Robotics HK annual audit',
        period: '2025.01-2025.12', status: 'planning', progress: 10, riskLevel: 'medium',
        lifecyclePhase: '风险评估', lifecyclePhaseEn: 'Risk Assessment',
        pbcStatus: 'complete', workPaperCount: 12, procedureCount: 8,
        openExceptions: 0, materiality: 'CNY 3.5M',
        dataCollectionStatus: 'not-started', opinionProfileStatus: 'draft',
        budgetOverrun: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Stellar Pharma Inc.',
    nameEn: 'Stellar Pharma Inc.',
    industry: '生物医药研发与制造',
    gaap: '中国企业会计准则',
    market: '科创板上市公司',
    kycRiskLevel: 'yellow',
    armsProfileCode: '2025-00382-15',
    clientType: 'Private enterprise',
    clientLob: 'GFS',
    sector: 'Pharmaceuticals and Biotechnology',
    armsProfiles: [
      {
        id: 'e4', code: '1668779', name: '2025 Stellar Pharma annual audit',
        period: '2025.01-2025.12', status: 'active', progress: 45, riskLevel: 'medium',
        lifecyclePhase: '执行阶段', lifecyclePhaseEn: 'Execution',
        pbcStatus: 'complete', workPaperCount: 134, procedureCount: 38,
        openExceptions: 3, materiality: 'CNY 2.8M',
        dataCollectionStatus: 'complete', opinionProfileStatus: 'draft',
        budgetOverrun: false,
      },
    ],
  },
  {
    id: '3',
    name: 'Nova Energy Holdings',
    nameEn: 'Nova Energy Holdings',
    industry: '新能源发电与储能',
    gaap: '中国企业会计准则',
    market: '主板上市公司',
    kycRiskLevel: 'green',
    armsProfileCode: '2025-00156-08',
    clientType: 'Listed company',
    clientLob: 'E&Y',
    sector: 'Energy and Utilities',
    armsProfiles: [
      {
        id: 'e5', code: '1549770', name: 'Nova Energy - health check',
        period: '2025.01-2025.12', status: 'active', progress: 72, riskLevel: 'medium',
        lifecyclePhase: '报告阶段', lifecyclePhaseEn: 'Reporting',
        pbcStatus: 'complete', workPaperCount: 198, procedureCount: 51,
        openExceptions: 2, materiality: 'CNY 8.5M',
        dataCollectionStatus: 'complete', opinionProfileStatus: 'submitted',
        budgetOverrun: false,
      },
      {
        id: 'e6', code: '1684752', name: 'Nova Energy Holdings IPO 2023-2025',
        period: '2025.01-2025.12', status: 'planning', progress: 5, riskLevel: 'low',
        lifecyclePhase: '项目启动', lifecyclePhaseEn: 'Initiation',
        pbcStatus: 'complete', workPaperCount: 5, procedureCount: 3,
        openExceptions: 0, materiality: 'N/A',
        dataCollectionStatus: 'not-started', opinionProfileStatus: 'draft',
        budgetOverrun: false,
      },
    ],
  },
  {
    id: '4',
    name: 'Quantum Finance Corporation',
    nameEn: 'Quantum Finance Corporation',
    industry: '金融科技与数字支付',
    gaap: '中国企业会计准则',
    market: 'Pre-IPO',
    kycRiskLevel: 'red',
    armsProfileCode: '2025-00621-03',
    clientType: 'Foreign invested enterprise',
    clientLob: 'FSO',
    sector: 'Financial Services',
    armsProfiles: [
      {
        id: 'e7', code: '16538418', name: '2025 Quantum Finance annual audit',
        period: '2025.01-2025.12', status: 'active', progress: 55, riskLevel: 'high',
        lifecyclePhase: '执行阶段', lifecyclePhaseEn: 'Execution',
        pbcStatus: 'overdue', workPaperCount: 112, procedureCount: 35,
        openExceptions: 15, materiality: 'CNY 1.9M',
        dataCollectionStatus: 'in-progress', opinionProfileStatus: 'draft',
        budgetOverrun: true,
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

  return (
    <div className="client-summary animate-fade-in">
      {/* Page Header */}
      <div className="summary-header">
        <div>
          <h1 className="summary-title">{lang === 'zh' ? t('clientOverviewCn') : t('clientOverview')}</h1>
        </div>
      </div>

      {/* Client Cards List */}
      <div className="clients-list">
        {clients.map((client, index) => {
          return (
            <div
              key={client.id}
              className={`client-card kyc-border-${client.kycRiskLevel} ${expandedClient === client.id ? 'expanded' : ''}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Client Header */}
              <div className="client-card-header" onClick={() => toggleExpand(client.id)}>
                <div className="client-identity">
                  <div className="client-avatar-large">{client.name.charAt(0)}</div>
                  <div className="client-names">
                    <h3 className="client-name-cn">{client.name}</h3>
                    <p className="client-name-en">ARMS's profile code: {client.armsProfileCode}</p>
                    <div className="client-tags">
                      <span className="client-tag">{client.clientType}</span>
                      <span className="client-tag">{client.clientLob}</span>
                      <span className="client-tag">{client.sector}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: mini cards + roll forward + expand */}
                <div className="header-right">
                  {/* Quick Access System Cards */}
                  <div className="quick-access-inline">
                  <div className="qa-mini-card qa-sentinel" onClick={(e) => { e.stopPropagation() }}>
                    <div className="qa-mini-icon sentinel">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <span className="qa-mini-label">Sentinel</span>
                  </div>

                  <div className="qa-mini-card qa-ceac" onClick={(e) => { e.stopPropagation() }}>
                    <div className="qa-mini-icon ceac">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <span className="qa-mini-label">CEAC</span>
                  </div>

                  <div className={`qa-mini-card qa-kyc-risk ${client.kycRiskLevel}`} onClick={(e) => { e.stopPropagation() }}>
                    <div className={`qa-mini-icon kyc-risk ${client.kycRiskLevel}`}>
                      {client.kycRiskLevel === 'red' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>
                        </svg>
                      )}
                      {client.kycRiskLevel === 'yellow' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>
                        </svg>
                      )}
                      {client.kycRiskLevel === 'green' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      )}
                    </div>
                    <span className="qa-mini-label">KYC Risk</span>
                  </div>
                  </div>

                  <div className="client-expand-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d={expandedClient === client.id ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'}/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded ARMS Profile Cards */}
              {expandedClient === client.id && (
                <div className="engagements-section animate-fade-in">
                  <div className="engagements-header">
                    <h4>{t('engagementCodes')}</h4>
                  </div>
                  <div className="engagements-grid">
                    {client.armsProfiles.map((profile, pi) => (
                      <div
                        key={profile.id}
                        className={`engagement-card card-lift`}
                        style={{ animationDelay: `${pi * 0.08}s` }}
                        onClick={() => navigate(`/engagement/${client.id}/${profile.id}`)}
                      >
                        <div className="eng-card-header">
                          <span className="eng-code">{profile.code}</span>
                        </div>

                        {/* ARMS Profile Name */}
                        <h5 className="eng-name">
                          <span className="arms-name-text">{profile.name}</span>
                        </h5>

                        {/* Financial Info Icons */}
                        <div className="arms-info-row">
                          {/* Fee */}
                          <div className="arms-info-icon" title="Fee">
                            <div className="info-icon-bg fee">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                              </svg>
                            </div>
                            <span className="info-icon-label">Fee</span>
                          </div>

                          {/* FRR% */}
                          <div className="arms-info-icon" title="FRR%">
                            <div className="info-icon-bg frr">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                              </svg>
                            </div>
                            <span className="info-icon-label">FRR%</span>
                          </div>

                          {/* NI (Net Income) */}
                          <div className="arms-info-icon" title="NI">
                            <div className="info-icon-bg ni">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                              </svg>
                            </div>
                            <span className="info-icon-label">NI</span>
                          </div>

                          {/* Billing */}
                          <div className="arms-info-icon" title="Billing">
                            <div className="info-icon-bg billing">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                              </svg>
                            </div>
                            <span className="info-icon-label">Billing</span>
                          </div>

                          {/* WIP */}
                          <div className="arms-info-icon" title="WIP">
                            <div className="info-icon-bg wip">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                              </svg>
                            </div>
                            <span className="info-icon-label">WIP</span>
                          </div>

                          {/* Budget Overrun (是否超支) */}
                          <div className={`arms-info-icon ${profile.budgetOverrun ? 'alert' : ''}`} title={profile.budgetOverrun ? (lang === 'zh' ? '超支' : 'Over Budget') : (lang === 'zh' ? '正常' : 'Within Budget')}>
                            <div className={`info-icon-bg overrun ${profile.budgetOverrun ? 'over' : ''}`}>
                              {profile.budgetOverrun ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>
                                </svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                              )}
                            </div>
                            <span className={`info-icon-label ${profile.budgetOverrun ? 'overrun-text' : 'normal-text'}`}>
                              {profile.budgetOverrun
                                ? (lang === 'zh' ? '超支' : 'Over')
                                : (lang === 'zh' ? '正常' : 'OK')}
                            </span>
                          </div>
                        </div>

                        {/* Footer - only arrow */}
                        <div className="eng-footer">
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
