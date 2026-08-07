import { useState } from 'react'
import { useParams } from 'react-router-dom'
import './WorkPaperStation.css'

// ===== Data Types =====
interface WpRow {
  id: string
  name: string
  requiredType: 'Required' | 'Highly Rec.'
  linkedKcwActivity: string
  wpTemplates: string[]
  status: 'Not Selected' | 'Selected'
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
  status: 'Not Selected' | 'Selected'
}

// KCW File type — mirrors EngagementHub's KCwFile for cross-page consistency
interface KcwFileOption {
  id: string
  name: string
  status: string
  type: string
}

// ===== Demo Data =====
const standardWpRows: WpRow[] = [
  { id: 's1', name: 'D&A Routine Output', requiredType: 'Required', linkedKcwActivity: 'kcw_act_778095', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
  { id: 's2', name: 'Independent Workpaper on Fees-related Requirements', requiredType: 'Required', linkedKcwActivity: 'kcw_act_82144d', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
  { id: 's3', name: 'Tax Provision Review – Specialist WP', requiredType: 'Required', linkedKcwActivity: 'kcw_act_599xe5', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
]

const optionalWpRows: WpRow[] = [
  { id: 'o1', name: 'Other Payables – Vouching', requiredType: 'Highly Rec.', linkedKcwActivity: 'kcw_act_cfdtbo', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
]

const substWpRows: SubstWpRow[] = [
  { id: 'sub1', name: 'Additional Personal Independence Requirements for CSA Audit Engagements', procedureId: 'PROC_e56af2', subType: 'General Purpose', rmId: 'RM_e56af2', mesp: '', required: true, kcwActivity: 'kcw_act_342b0', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
  { id: 'sub2', name: 'Group Audit Instructions – Component Auditors', procedureId: 'PROC_c6633b', subType: 'General Purpose', rmId: 'RM_c6633b', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_4c38e', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
  { id: 'sub3', name: 'Independent Workpaper on Fees-related Requirements', procedureId: 'PROC_89bf72', subType: 'General Purpose', rmId: 'RM_89bf72', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_82144d', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
  { id: 'sub4', name: 'Inventory Work Paper – Existence & Valuation', procedureId: 'PROC_44159f', subType: 'General Purpose', rmId: 'RM_44159f', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_47000', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
  { id: 'sub5', name: 'Tax Provision Review – Specialist WP', procedureId: 'PROC_21f971', subType: 'General Purpose', rmId: 'RM_21f971', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_599xe5', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
  { id: 'sub6', name: 'Trade Receivables – Circularisation', procedureId: 'PROC_c73f0e5', subType: 'General Purpose', rmId: 'RM_c73f0e5', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_63e9e9', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
  { id: 'sub7', name: 'wendy001', procedureId: 'PROC_e86a28', subType: 'General Purpose', rmId: 'RM_e86a38', mesp: 'Yes', required: true, kcwActivity: 'kcw_act_3bH60', wpTemplates: ['CN', 'EN', 'BL'], status: 'Not Selected' },
]

// KCW File demo data — mirrors EngagementHub's KCW File list.
// In production this would be fetched by engagementId from API.
const DEMO_KCW_FILES_BY_ENGAGEMENT: Record<string, KcwFileOption[]> = {
  default: [
    { id: 'KC001', name: '241231_Stat_RF_Aurora_Planning', status: 'completed', type: 'Planning' },
    { id: 'KC002', name: '241231_Stat_RF_Aurora_Risk', status: 'in-progress', type: 'Risk' },
    { id: 'KC003', name: '241231_Stat_RF_GoldenHorizon_Planning', status: 'pending', type: 'Planning' },
    { id: 'KC004', name: '241231_Stat_RF_GoldenHorizon_Fraud', status: 'not-started', type: 'Fraud' },
    { id: 'KC005', name: '241231_Stat_RF_PacificStar_Single', status: 'on-hold', type: 'Risk' },
  ],
}

function WorkPaperStation() {
  const { engagementId } = useParams<{ clientId: string; engagementId: string }>()

  // Resolve KCW files for current engagement (demo: falls back to default list)
  const kcwFileList: KcwFileOption[] = (engagementId && DEMO_KCW_FILES_BY_ENGAGEMENT[engagementId])
    ? DEMO_KCW_FILES_BY_ENGAGEMENT[engagementId]
    : DEMO_KCW_FILES_BY_ENGAGEMENT.default

  const [selectedKcw, setSelectedKcw] = useState(kcwFileList[0]?.id || '')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'std-other': true,
    'std-indep': true,
    'std-spec': true,
    'opt-general': true,
  })

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="wps-page animate-fade-in">
      {/* Title Row */}
      <div className="wps-title-row">
        <h1 className="wps-title">Work Paper Station</h1>
        <span className="wps-view-tag">Project Team View</span>
      </div>

      {/* Info Bar */}
      <div className="wps-info-bar">
        <span className="wps-info-label">Audit Team Member</span>
        <span className="wps-info-desc">本视图展示项目组可见的全部场景（M1F3 • M1F4 • M1F5）</span>
        <span className="wps-info-right">Engagement: 1299419 · Client: AAP Demo Co., Ltd.</span>
      </div>

      {/* Stats Cards */}
      <div className="wps-stats-row">
        <div className="wps-stat-card">
          <div className="wps-stat-label">Work Paper Templates (Transferred / Total)</div>
          <div className="wps-stat-num">4<span className="wps-stat-unit">WP</span></div>
          <div className="wps-stat-sub">Standard WP Templates · 自动按 Engagement 属性过滤</div>
        </div>
        <div className="wps-stat-card">
          <div className="wps-stat-label">Work Paper from Procedures (Matched)</div>
          <div className="wps-stat-num">7<span className="wps-stat-unit">WP</span></div>
          <div className="wps-stat-sub">RM → Procedure 匹配 → 子系统列表</div>
        </div>
        <div className="wps-stat-card">
          <div className="wps-stat-label">Total Progress (Synced)</div>
          <div className="wps-stat-num">5<span className="wps-stat-unit">WP</span></div>
          <div className="wps-stat-sub">子案例同步估计</div>
        </div>
      </div>

      {/* Section 1: Standard Work Paper Templates */}
      <div className="wps-section">
        <div className="wps-section-header">
          <h2 className="wps-section-title">
            <span className="wps-section-num">1</span> Standard Work Paper Templates
            <span className="wps-section-meta">(M1F3 - Filter by Engagement Nature)</span>
          </h2>
          <button className="wps-run-btn" onClick={() => {}}>
            <i className="fas fa-play"></i> Run Match
          </button>
        </div>

        {/* Select KCW file row — dynamically populated from current Engagement's KCW Files */}
        <div className="wps-kcw-select-row">
          <label>*Select the KCw file:</label>
          <select className="wps-kcw-dropdown" value={selectedKcw} onChange={e => setSelectedKcw(e.target.value)}>
            {kcwFileList.map(kf => (
              <option key={kf.id} value={kf.id}>{kf.name}</option>
            ))}
          </select>
          {(() => {
            const current = kcwFileList.find(k => k.id === selectedKcw)
            return current ? (
              <span className="wps-opinion-link">
                Type: <strong>{current.type}</strong> &middot; Status: <span className={`status-dot ${current.status === 'completed' ? 'selected' : 'not-selected'}`}></span> {current.status}
              </span>
            ) : null
          })()}
        </div>

        {/* Info note */}
        <div className="wps-info-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          系统将筛选出 Kcw Opinion Profile 中适用的审计计准则 / 工作底稿 / 实体类型/是否那个逻辑，与您管理范围的 Engagement 属性匹配则展示关联匹配。
        </div>

        {/* REQUIRED Group */}
        <div className="wps-group">
          <div className="wps-group-header">
            <span className="wps-group-badge required">REQUIRED</span>
            <span className="wps-group-desc">Required Work Papers · 3 条</span>
          </div>

          {/* 1. Other */}
          <div className="wps-subgroup">
            <div className="wps-subgroup-header" onClick={() => toggleGroup('std-other')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: expandedGroups['std-other'] ? '' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <span className="wps-subgroup-title">1. Other</span>
              <span className="wps-subgroup-count">{standardWpRows.filter(r => r.id.startsWith('s')).length} / 1</span>
            </div>
            {expandedGroups['std-other'] && (
              <table className="wps-table">
                <thead>
                  <tr>
                    <th>底稿名称</th><th>必要级别</th><th>关联 KCw Activity</th><th>WP 模版</th><th>状态</th><th>迁移操作</th>
                  </tr>
                </thead>
                <tbody>
                  {standardWpRows.filter(r => r.id === 's1').map(row => (
                    <tr key={row.id}>
                      <td className="wp-name-cell">{row.name}</td>
                      <td><span className={`req-badge ${row.requiredType === 'Required' ? 'required' : 'highly-rec'}`}>{row.requiredType}</span></td>
                      <td>{row.linkedKcwActivity}</td>
                      <td>{row.wpTemplates.map(t => <span key={t} className="lang-tag">{t}</span>)}</td>
                      <td><span className="status-dot not-selected"></span> Not Selected</td>
                      <td><select className="migrate-select"><option>-- 选择语言 --</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 2. Independent Work Papers */}
          <div className="wps-subgroup">
            <div className="wps-subgroup-header" onClick={() => toggleGroup('std-indep')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: expandedGroups['std-indep'] ? '' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <span className="wps-subgroup-title">2.2. Independent Work Papers</span>
              <span className="wps-subgroup-count">{standardWpRows.filter(r => r.id === 's2').length} / 1</span>
            </div>
            {expandedGroups['std-indep'] && (
              <table className="wps-table">
                <thead>
                  <tr>
                    <th>底稿名称</th><th>必要级别</th><th>关联 KCw Activity</th><th>WP 模版</th><th>状态</th><th>迁移操作</th>
                  </tr>
                </thead>
                <tbody>
                  {standardWpRows.filter(r => r.id === 's2').map(row => (
                    <tr key={row.id}>
                      <td className="wp-name-cell">{row.name}</td>
                      <td><span className="req-badge required">Required</span></td>
                      <td>{row.linkedKcwActivity}</td>
                      <td>{row.wpTemplates.map(t => <span key={t} className="lang-tag">{t}</span>)}</td>
                      <td><span className="status-dot not-selected"></span> Not Selected</td>
                      <td><select className="migrate-select"><option>-- 选择语言 --</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 3. Specialists */}
          <div className="wps-subgroup">
            <div className="wps-subgroup-header" onClick={() => toggleGroup('std-spec')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: expandedGroups['std-spec'] ? '' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <span className="wps-subgroup-title">3.3. Specialists and Specific Team Members</span>
              <span className="wps-subgroup-count">{standardWpRows.filter(r => r.id === 's3').length} / 1</span>
            </div>
            {expandedGroups['std-spec'] && (
              <table className="wps-table">
                <thead>
                  <tr>
                    <th>底稿名称</th><th>必要级别</th><th>关联 KCw Activity</th><th>WP 模版</th><th>状态</th><th>迁移操作</th>
                  </tr>
                </thead>
                <tbody>
                  {standardWpRows.filter(r => r.id === 's3').map(row => (
                    <tr key={row.id}>
                      <td className="wp-name-cell">{row.name}</td>
                      <td><span className="req-badge required">Required</span></td>
                      <td>{row.linkedKcwActivity}</td>
                      <td>{row.wpTemplates.map(t => <span key={t} className="lang-tag">{t}</span>)}</td>
                      <td><span className="status-dot not-selected"></span> Not Selected</td>
                      <td><select className="migrate-select"><option>-- 选择语言 --</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* OPTIONAL Group */}
        <div className="wps-group">
          <div className="wps-group-header">
            <span className="wps-group-badge optional">OPTIONAL</span>
            <span className="wps-group-desc">Optional Work Papers · Highly Recommended · Optional 1 条</span>
          </div>

          <div className="wps-subgroup">
            <div className="wps-subgroup-header" onClick={() => toggleGroup('opt-general')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: expandedGroups['opt-general'] ? '' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <span className="wps-subgroup-title">1.1. General Purpose Work Papers</span>
              <span className="wps-subgroup-count">{optionalWpRows.length} / 1</span>
            </div>
            {expandedGroups['opt-general'] && (
              <table className="wps-table">
                <thead>
                  <tr>
                    <th>底稿名称</th><th>必要级别</th><th>关联 KCw Activity</th><th>WP 模版</th><th>状态</th><th>迁移操作</th>
                  </tr>
                </thead>
                <tbody>
                  {optionalWpRows.map(row => (
                    <tr key={row.id}>
                      <td className="wp-name-cell">{row.name}</td>
                      <td><span className="req-badge highly-rec">Highly Rec.</span></td>
                      <td>{row.linkedKcwActivity}</td>
                      <td>{row.wpTemplates.map(t => <span key={t} className="lang-tag">{t}</span>)}</td>
                      <td><span className="status-dot not-selected"></span> Not Selected</td>
                      <td><select className="migrate-select"><option>-- 选择语言 --</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Substantive Procedure Work Papers */}
      <div className="wps-section">
        <div className="wps-section-header">
          <h2 className="wps-section-title">
            <span className="wps-section-num">2</span> Substantive Procedure Work Papers
            <span className="wps-section-meta">(M1F4 - Match WP Templates to Substantive Procedures)</span>
          </h2>
          <button className="wps-run-btn" onClick={() => {}}>
            <i className="fas fa-play"></i> Run Match
          </button>
        </div>

        <div className="wps-info-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          系统解析用户上传的 RAAR Report，提取给 Engagement 下已计划的 RM 及对应的 Substantive Procedure，遍历管理链配置的实属性程序定义模板规则。
        </div>

        <div className="wps-group">
          <div className="wps-group-header">
            <span className="wps-group-badge required">REQUIRED</span>
            <span className="wps-group-desc">Required · 7 条</span>
          </div>

          <div className="wps-subgroup">
            <div className="wps-subgroup-header" onClick={() => toggleGroup('subst')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: expandedGroups['subst'] ? '' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <span className="wps-subgroup-title">Substantive Procedure Work Papers</span>
              <span className="wps-subgroup-count">{substWpRows.length} / 7</span>
            </div>
            {expandedGroups['subst'] && (
              <div className="wps-table-wrap">
              <table className="wps-table subst-table">
                <thead>
                  <tr>
                    <th>底稿名称</th><th>Procedure ID</th><th>子类型</th><th>RM ID</th><th>MESP</th><th>必要级别</th><th>KCw Activity</th><th>WP 模版</th><th>状态</th><th>迁移操作</th>
                  </tr>
                </thead>
                <tbody>
                  {substWpRows.map(row => (
                    <tr key={row.id}>
                      <td className="wp-name-cell">{row.name}</td>
                      <td>{row.procedureId}</td>
                      <td>{row.subType}</td>
                      <td>{row.rmId}</td>
                      <td>{row.mesp || '-'}</td>
                      <td><span className="req-badge required">Required</span></td>
                      <td>{row.kcwActivity}</td>
                      <td>{row.wpTemplates.map(t => <span key={t} className="lang-tag">{t}</span>)}</td>
                      <td><span className="status-dot not-selected"></span> Not Selected</td>
                      <td><select className="migrate-select"><option>-- 选择语言 --</option></select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

export default WorkPaperStation
