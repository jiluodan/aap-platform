import { useState } from 'react'
import { useParams } from 'react-router-dom'
import './KcwFileDetail.css'

// Phase icon component - consistent with EngagementHub
const PhaseIcon = ({ status, size = 12 }: { status: 'done' | 'current' | 'pending'; size?: number }) => {
  if (status === 'done') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="phase-icon-done">
        <circle cx="8" cy="8" r="7" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="1.2" />
        <path d="M5 8l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === 'current') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="phase-icon-current">
        <circle cx="8" cy="8" r="7" fill="#F59E0B" fillOpacity="0.18" stroke="#F59E0B" strokeWidth="1.2" />
        <circle cx="8" cy="8" r="3.5" fill="#F59E0B" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="phase-icon-pending">
      <circle cx="7" cy="7" r="6" fill="#EF4444" fillOpacity="0.15" stroke="#EF4444" strokeWidth="1.2" />
      <line x1="7" y1="3.5" x2="7" y2="8" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="7" cy="10.5" r="0.9" fill="#EF4444" />
    </svg>
  )
}

// Mock data for linked Opinion Profiles
interface LinkedOpinion {
  id: string
  kcwOpinionName: string
  aapId: string
  entityName: string
  opinionType: string
  reportType: string
  financialPeriodEnd: string
  reportDate: string
  phase1: 'done' | 'current' | 'pending'
  phase2: 'done' | 'current' | 'pending'
  phase3: 'done' | 'current' | 'pending'
  phase4: 'done' | 'current' | 'pending'
}

const linkedOpinions: LinkedOpinion[] = [
  {
    id: 'op-001',
    kcwOpinionName: 'KCw opinion 1',
    aapId: 'R00001051234',
    entityName: 'A Limited / A公署',
    opinionType: 'Financial statement audit',
    reportType: '审報審計',
    financialPeriodEnd: '2025-12-31',
    reportDate: '2026-08-30',
    phase1: 'done',
    phase2: 'done',
    phase3: 'current',
    phase4: 'pending',
  },
  {
    id: 'op-002',
    kcwOpinionName: 'KCw opinion 1',
    aapId: 'R00001057271',
    entityName: 'B Limited / B公署',
    opinionType: 'Component reporting',
    reportType: 'Specific audit procedure',
    financialPeriodEnd: '2026-03-31',
    reportDate: '2026-05-09',
    phase1: 'done',
    phase2: 'done',
    phase3: 'done',
    phase4: 'pending',
  },
  {
    id: 'op-003',
    kcwOpinionName: 'KCw opinion 2',
    aapId: 'R00001058233',
    entityName: 'C Limited / C公署',
    opinionType: 'Financial statement audit',
    reportType: 'Annual statutory audit',
    financialPeriodEnd: '2025-12-31',
    reportDate: '2026-03-31',
    phase1: 'done',
    phase2: 'done',
    phase3: 'current',
    phase4: 'pending',
  },
  {
    id: 'op-004',
    kcwOpinionName: 'KCw opinion 3',
    aapId: 'R00001052532',
    entityName: 'D Limited / D公署',
    opinionType: 'Assurance',
    reportType: 'L&C',
    financialPeriodEnd: '2025-12-31',
    reportDate: '2026-01-31',
    phase1: 'done',
    phase2: 'done',
    phase3: 'done',
    phase4: 'pending',
  },
]

// ===== WPS Data (Two-Section structure: Standard + Substantive) =====

interface WpsRow {
  id: string
  name: string
  requiredType: 'Required' | 'Highly Rec.'
  linkedKcwActivity: string
  wpTemplates: string[]
}

interface SubstWpRow {
  id: string
  name: string
  procedureId: string
  subType: string
  rmId: string
  mesp: string
  required: boolean
  kcwActivity: string
  wpTemplates: string[]
}

interface WpsSubGroup {
  key: string
  label: string
  subtitle?: string
  isOptional?: boolean
  rows: (WpsRow | SubstWpRow)[]
}

interface WpsSection {
  key: string
  number: string
  label: string
  subtitle?: string
  requiredTag: boolean
  totalCount: number
  subGroups: WpsSubGroup[]
  isSubst: boolean // true = Substantive section with extra columns
}

const wpsSections: WpsSection[] = [
  // ===== Section 1: Standard Work Paper Templates =====
  {
    key: 'standard',
    number: '1',
    label: 'Standard Work Paper Templates',
    subtitle: '[M1F3 - Filter by Engagement Nature]',
    requiredTag: true,
    totalCount: 4,
    isSubst: false,
    subGroups: [
      {
        key: 'other',
        label: '1. Other',
        isOptional: false,
        rows: [
          { id: 's1', name: 'D&A Routine Output', requiredType: 'Required', linkedKcwActivity: 'kcw_act_778095', wpTemplates: ['CN', 'EN', 'BL'] },
          { id: 's2', name: 'Independent Workpaper on Fees-related Requirements', requiredType: 'Required', linkedKcwActivity: 'kcw_act_82144d', wpTemplates: ['CN', 'EN', 'BL'] },
        ] as WpsRow[],
      },
      {
        key: 'independent',
        label: '2.2 Independent Work Papers',
        isOptional: false,
        rows: [
          { id: 's3', name: 'Independent Workpaper on Fees-related Requirements', requiredType: 'Required', linkedKcwActivity: 'kcw_act_82144d', wpTemplates: ['CN', 'EN', 'BL'] },
        ] as WpsRow[],
      },
      {
        key: 'specialists',
        label: '3.3 Specialists and Specific Team Members',
        isOptional: false,
        rows: [
          { id: 's4', name: 'Tax Provision Review – Specialist WP', requiredType: 'Required', linkedKcwActivity: 'kcw_act_599xe5', wpTemplates: ['CN', 'EN', 'BL'] },
        ] as WpsRow[],
      },
      {
        key: 'general-purpose',
        label: '1.1 General Purpose Work Papers',
        subtitle: 'Optional',
        isOptional: true,
        rows: [
          { id: 'o1', name: 'Other Payables – Vouching', requiredType: 'Highly Rec.', linkedKcwActivity: 'kcw_act_cfdtbo', wpTemplates: ['CN', 'EN', 'BL'] },
        ] as WpsRow[],
      },
    ],
  },

  // ===== Section 2: Substantive Procedure Work Papers =====
  {
    key: 'subst',
    number: '2',
    label: 'Substantive Procedure Work Papers',
    subtitle: '[M1F4 - Match WP Templates to Substantive Procedures]',
    requiredTag: true,
    totalCount: 7,
    isSubst: true,
    subGroups: [
      {
        key: 'subst-all',
        label: 'Substantive Procedure Work Papers',
        rows: [
          { id: 'sub1', name: 'Additional Personal Independence Requirements for CSA Audit Engagements', procedureId: 'PROC_e56af2', subType: 'General Purpose', rmId: 'RM_e56af2', mesp: '', required: true, kcwActivity: 'kcw_act_342b0', wpTemplates: ['CN', 'EN', 'BL'] },
          { id: 'sub2', name: 'Group Audit Instructions – Component Auditors', procedureId: 'PROC_c6633b', subType: 'General Purpose', rmId: 'RM_c6633b', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_4c38e', wpTemplates: ['CN', 'EN', 'BL'] },
          { id: 'sub3', name: 'Independent Workpaper on Fees-related Requirements', procedureId: 'PROC_89bf72', subType: 'General Purpose', rmId: 'RM_89bf72', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_82144d', wpTemplates: ['CN', 'EN', 'BL'] },
          { id: 'sub4', name: 'Inventory Work Paper – Existence & Valuation', procedureId: 'PROC_44159f', subType: 'General Purpose', rmId: 'RM_44159f', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_47000', wpTemplates: ['CN', 'EN', 'BL'] },
          { id: 'sub5', name: 'Tax Provision Review – Specialist WP', procedureId: 'PROC_21f971', subType: 'General Purpose', rmId: 'RM_21f971', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_599xe5', wpTemplates: ['CN', 'EN', 'BL'] },
          { id: 'sub6', name: 'Trade Receivables – Circularisation', procedureId: 'PROC_c73f0e5', subType: 'General Purpose', rmId: 'RM_c73f0e5', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_63e9e9', wpTemplates: ['CN', 'EN', 'BL'] },
          { id: 'sub7', name: 'wendy001', procedureId: 'PROC_e86a28', subType: 'General Purpose', rmId: 'RM_e86a38', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_3bH60', wpTemplates: ['CN', 'EN', 'BL'] },
        ] as SubstWpRow[],
      },
    ],
  },
]

// Completion data for the chart
const completionData = [
  { label: 'Preliminary Activities', value: 85 },
  { label: 'Planning', value: 72 },
  { label: 'Inteim response', value: 45 },
  { label: 'Final response', value: 20 },
  { label: 'Completion', value: 0 },
]

function KcwFileDetail() {
  const { clientId, kcwId } = useParams<{ clientId: string; engagementId: string; kcwId: string }>()
  // WPS section/subgroup expand/collapse state — default all collapsed
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const toggleKey = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const isExpanded = (key: string) => expandedKeys.has(key)

  return (
    <div className="kcw-detail">
      {/* Header Card */}
      <div className="kcw-header-card">
        <div className="kcw-header-left">
          <h1 className="kcw-title">2025 Aurora Robotics SH annual audit</h1>
          <p className="kcw-subtitle">Aurora Robotics Systems Group.</p>
          <div className="kcw-header-meta">
            <div className="kcw-guid">
              <span className="kcw-guid-icon">&#128196;</span> GUID: b50e79fc-135c-44f7-a9dd-23b02d175acd3
            </div>
            <button className="kcw-manage-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Manage team member
            </button>
          </div>
        </div>
        <div className="kcw-header-right">
          <div className="kcw-completion-card">
            <div className="kcw-comp-title">Completion status</div>
            <div className="kcw-comp-list">
              {completionData.map((item, idx) => (
                <div key={idx} className="kcw-comp-item">
                  <span className="kcw-comp-item-label">{item.label}</span>
                  <span className="kcw-comp-item-value">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Link to Opinion profile(s) */}
      <div className="kcw-section">
        <div className="kcw-section-badge">Link to Opinion profile(s)</div>
        <div className="kcw-table-wrap">
          <table className="kcw-op-table">
            <thead>
              <tr>
                <th className="col-kcw-op-name">KCw opinion name</th>
                <th className="col-kcw-aap-id">AAP ID</th>
                <th className="col-kcw-entity">Entity name (或名稱)</th>
                <th className="col-kcw-op-type">Opinion type</th>
                <th className="col-kcw-report-type">Report type</th>
                <th className="col-kcw-period">Financial period end</th>
                <th className="col-kcw-report-date">Report date</th>
                <th className="col-kcw-phase">Phase1</th>
                <th className="col-kcw-phase">Phase2</th>
                <th className="col-kcw-phase">Phase3</th>
                <th className="col-kcw-phase">Phase4</th>
              </tr>
            </thead>
            <tbody>
              {linkedOpinions.map((op) => (
                <tr key={op.id} className="kcw-op-row">
                  <td className="col-kcw-op-name">{op.kcwOpinionName}</td>
                  <td className="col-kcw-aap-id"><a href="#" className="kcw-link">{op.aapId}</a></td>
                  <td className="col-kcw-entity">{op.entityName}</td>
                  <td className="col-kcw-op-type">{op.opinionType}</td>
                  <td className="col-kcw-report-type">{op.reportType}</td>
                  <td className="col-kcw-period">{op.financialPeriodEnd}</td>
                  <td className="col-kcw-report-date">{op.reportDate}</td>
                  <td className="col-kcw-phase"><PhaseIcon status={op.phase1} /></td>
                  <td className="col-kcw-phase"><PhaseIcon status={op.phase2} /></td>
                  <td className="col-kcw-phase"><PhaseIcon status={op.phase3} /></td>
                  <td className="col-kcw-phase"><PhaseIcon status={op.phase4} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Work Paper Station — Two-Section structure (Standard + Substantive) */}
      <div className="kcw-section kcw-wps-section">
        <div className="kcw-section-badge">Work Paper Station</div>
        <div className="kcw-wps-kcw-info">
          <span className="kcw-wps-kcw-label">Bound KCW File:</span>
          <strong>{kcwId || '241231_Stat_RF_sample2_F_SA_ISA_single'}</strong>
          <span className="kcw-wps-kcw-hint">All work papers below are specific to this file</span>
        </div>

        {wpsSections.map(section => (
          <div key={section.key} className={`kcw-wps-section-block ${isExpanded(section.key) ? 'expanded' : ''}`}>
            {/* Section header (major category) */}
            <div className="kcw-wps-section-header" onClick={() => toggleKey(section.key)}>
              <span className="kcw-wps-group-arrow">{isExpanded(section.key) ? '▾' : '▸'}</span>
              <span className="kcw-wps-section-number">{section.number}</span>
              <span className="kcw-wps-section-title">{section.label}</span>
              {section.subtitle && <span className="kcw-wps-group-sub">{section.subtitle}</span>}
              {section.requiredTag && <span className="kcw-wps-req-tag">REQUIRED</span>}
              {section.isSubst && (
                <button className="kcw-wps-run-btn" onClick={e => { e.stopPropagation() /* Run Match */ }}>Run Match</button>
              )}
              <span className="kcw-wps-group-count">{section.totalCount} 条</span>
            </div>

            {isExpanded(section.key) && (
              <div className="kcw-wps-section-body">
                {section.subGroups.map(subGroup => (
                  <div key={subGroup.key} className={`kcw-wps-subgroup ${isExpanded(subGroup.key) ? 'expanded' : ''}`}>
                    {/* Subgroup header (minor category) */}
                    <div className="kcw-wps-subgroup-header" onClick={() => toggleKey(subGroup.key)}>
                      <span className="kcw-wps-group-arrow">{isExpanded(subGroup.key) ? '▾' : '▸'}</span>
                      <span className="kcw-wps-group-title">{subGroup.label}</span>
                      {subGroup.subtitle && <span className="kcw-wps-group-sub">{subGroup.subtitle}</span>}
                      {!subGroup.isOptional && section.requiredTag && <span className="kcw-wps-req-tag-sm">Required Work Papers · {subGroup.rows.length} 条</span>}
                      {subGroup.isOptional && <span className="kcw-wps-opt-tag">OPTIONAL Optional Work Papers · Highly Recommended · Optional 1 条</span>}
                      <span className="kcw-wps-group-count">{subGroup.rows.length} / {subGroup.rows.length}</span>
                    </div>

                    {isExpanded(subGroup.key) && (
                      <div className="kcw-wps-table-wrap">
                        <table className={`kcw-wps-table ${section.isSubst ? 'subst' : ''}`}>
                          <thead>
                            <tr>
                              <th>底稿名称</th>
                              {!section.isSubst && <th>必要级别</th>}
                              {section.isSubst && <><th>Procedure ID</th><th>子类型</th><th>RM ID</th><th>MESP</th></>}
                              <th>{section.isSubst ? '必要级别' : '关联 KCW Activity'}</th>
                              <th>{section.isSubst ? 'KCW Activity' : 'WP 模版'}</th>
                              <th>状态</th>
                              <th>迁移操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subGroup.rows.map(row => {
                              if ('procedureId' in row) {
                                const r = row as SubstWpRow
                                return (
                                  <tr key={r.id}>
                                    <td className="wp-name-cell">{r.name}</td>
                                    <td>{r.procedureId}</td>
                                    <td>{r.subType}</td>
                                    <td>{r.rmId}</td>
                                    <td>{r.mesp || '-'}</td>
                                    <td><span className="req-badge required">Required</span></td>
                                    <td>{r.kcwActivity}</td>
                                    <td>{r.wpTemplates.map(t => <span key={t} className="lang-tag">{t}</span>)}</td>
                                    <td><span className="status-dot not-selected"></span> Not Selected</td>
                                    <td><select className="migrate-select"><option>-- 选择语言 --</option></select></td>
                                  </tr>
                                )
                              } else {
                                const r = row as WpsRow
                                return (
                                  <tr key={r.id}>
                                    <td className="wp-name-cell">{r.name}</td>
                                    <td><span className={`req-badge ${r.requiredType === 'Required' ? 'required' : 'highly-rec'}`}>{r.requiredType}</span></td>
                                    <td>{r.linkedKcwActivity}</td>
                                    <td>{r.wpTemplates.map(t => <span key={t} className="lang-tag">{t}</span>)}</td>
                                    <td><span className="status-dot not-selected"></span> Not Selected</td>
                                    <td><select className="migrate-select"><option>-- 选择语言 --</option></select></td>
                                  </tr>
                                )
                              }
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default KcwFileDetail
