import { useParams } from 'react-router-dom'
import { WorkPaperStationView, findKcwFileOption } from './WorkPaperStation'
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

// Completion data for the chart
const completionData = [
  { label: 'Preliminary Activities', value: 85 },
  { label: 'Planning', value: 72 },
  { label: 'Inteim response', value: 45 },
  { label: 'Final response', value: 20 },
  { label: 'Completion', value: 0 },
]

function KcwFileDetail() {
  const { engagementId, kcwId } = useParams<{ clientId: string; engagementId: string; kcwId: string }>()
  const boundKcw = findKcwFileOption(engagementId, kcwId)

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

      {/* Section 2: Work Paper Station — 复用 Engagement 层同一套界面（KPI + Standard + Substantive） */}
      <div className="kcw-section kcw-wps-section">
        <div className="kcw-section-badge">Work Paper Station</div>
        <div className="kcw-wps-kcw-info">
          <span className="kcw-wps-kcw-label">Bound KCW File:</span>
          <strong>{boundKcw?.name ?? kcwId ?? '241231_Stat_RF_sample2_F_SA_ISA_single'}</strong>
          <span className="kcw-wps-kcw-hint">All work papers below are specific to this file</span>
        </div>

        {/* KCW File 页面：不重复展示统计卡片，也无需再次选择 KCW File（天然绑定当前文件） */}
        <WorkPaperStationView showKpi={false} showKcwSelector={false} />
      </div>
    </div>
  )
}

export default KcwFileDetail
