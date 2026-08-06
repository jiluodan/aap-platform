import { useParams } from 'react-router-dom'
import './KcwFileDetail.css'

// Phase icon component - consistent with EngagementHub
const PhaseIcon = ({ status, size = 14 }: { status: 'done' | 'current' | 'pending'; size?: number }) => {
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

// Mock data for Work Paper Station templates
interface WpsTemplate {
  id: string
  templateName: string
  category: string
  lastModified: string
  status: 'completed' | 'in-progress' | 'not-started'
}

const wpsTemplates: WpsTemplate[] = [
  { id: 'wps-001', templateName: 'FSR Template v6.4 - Lead Schedule', category: 'FSR', lastModified: '2026-07-28 14:30', status: 'completed' },
  { id: 'wps-002', templateName: 'Treasury Confirmation Letter', category: 'Treasury', lastModified: '2026-07-29 10:15', status: 'in-progress' },
  { id: 'wps-003', templateName: 'KDC Cash Count Sheet', category: 'KDC', lastModified: '2026-07-27 16:45', status: 'completed' },
  { id: 'wps-004', templateName: 'Credit Review Checklist', category: 'Credit Review', lastModified: '2026-07-26 09:20', status: 'not-started' },
]

// Completion data for the chart
const completionData = [
  { label: 'Planning', value: 100, color: '#22c55e' },
  { label: 'Risk', value: 85, color: '#22c55e' },
  { label: 'Fieldwork', value: 70, color: '#22c55e' },
  { label: 'Reporting', value: 45, color: '#22c55e' },
  { label: 'Review', value: 20, color: '#22c55e' },
  { label: 'Finalization', value: 5, color: '#22c55e' },
]

function KcwFileDetail() {
  const { clientId, engagementId, kcwId } = useParams<{ clientId: string; engagementId: string; kcwId: string }>()

  return (
    <div className="kcw-detail">
      {/* Breadcrumb */}
      <div className="kcw-breadcrumb">
        <span className="kcw-crumb-item">客户总览</span>
        <span className="kcw-crumb-sep">/</span>
        <span className="kcw-crumb-item">{clientId || '1688465'}</span>
        <span className="kcw-crumb-sep">/</span>
        <span className="kcw-crumb-item active">{kcwId || '241231_Stat_RF_sample2_F_SA_ISA_single'}</span>
      </div>

      {/* Header Card */}
      <div className="kcw-header-card">
        <div className="kcw-header-left">
          <h1 className="kcw-title">2025 Aurora Robotics SH annual audit</h1>
          <p className="kcw-subtitle">Aurora Robotics Systems Group.</p>
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
        <div className="kcw-header-right">
          <div className="kcw-completion-card">
            <div className="kcw-comp-title">Completion #data</div>
            <div className="kcw-comp-chart">
              {completionData.map((item, idx) => (
                <div key={idx} className="kcw-comp-row">
                  <span className="kcw-comp-label">{item.label}</span>
                  <div className="kcw-comp-bar-wrap">
                    <div
                      className="kcw-comp-bar"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
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

      {/* Section 2: Work Paper Station */}
      <div className="kcw-section">
        <div className="kcw-section-badge">Work Paper Station</div>
        <div className="kcw-wps-list">
          {wpsTemplates.length > 0 ? (
            wpsTemplates.map((tpl) => (
              <div key={tpl.id} className={`kcw-wps-card ${tpl.status}`}>
                <div className="kcw-wps-info">
                  <div className="kcw-wps-name">{tpl.templateName}</div>
                  <div className="kcw-wps-meta">
                    <span className="kcw-wps-category">{tpl.category}</span>
                    <span className="kcw-wps-date">{tpl.lastModified}</span>
                  </div>
                </div>
                <div className="kcw-wps-status">
                  <span className={`kcw-status-dot ${tpl.status}`}></span>
                  <span className="kcw-status-text">{tpl.status === 'completed' ? 'Completed' : tpl.status === 'in-progress' ? 'In Progress' : 'Not Started'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="kcw-wps-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
              <p>No templates have been selected from Work Paper Station for this KCW file yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KcwFileDetail
