import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  findProcedureItem,
  findProcedureType,
  procedureTypeIcon,
  procedureTypeShortName,
} from '../data/auditProcedures'
import { downloadSampleWorkPaperTemplate } from '../utils/sampleExcel'
import './WorkPaperStation.css'

// ===== Data Types =====
interface WpRow {
  id: string
  name: string
  category: string
  requiredType: 'Required' | 'Highly Rec.'
  linkedKcwActivity: string
  status: 'Not Selected' | 'Selected'
}

// 与 Audit Procedure 模块的关联：指向某个程序类型下的具体程序
interface WpAuditProcedure {
  typeKey: string   // ProcedureType 的 key/id
  itemCode: string  // ProcedureItem 的 code
}

interface SubstWpRow {
  id: string
  businessProcess: string
  procedureName: string
  type: 'WT' | 'TOE' | 'TOD' | 'SAP'
  sampleInfo: string
  samplingFeature: string
  populationAmount: string
  samplingDetail: string
  progress: number
  wpTemplate: string
  workingPaper: string
  reviewStatus: '未复核' | '复核中' | '已复核'
  uploader: string
  rmId: string
  kcwActivity: string
  preChecked: boolean
  actions: string[]
  /** 对应的 Audit Procedure（用于跳转到程序卡片 / 明细） */
  auditProcedure: WpAuditProcedure
}

/** 表体数据（不含跨模块关联），关联见下方 AUDIT_PROCEDURE_LINKS */
type SubstWpRowSeed = Omit<SubstWpRow, 'auditProcedure'>

// KCW File type — mirrors EngagementHub's KCwFile for cross-page consistency
interface KcwFileOption {
  id: string
  name: string
  status: string
  type: string
}

// ===== Demo Data =====
const standardWpRows: WpRow[] = [
  { id: 's1', name: 'D&A Routine Output', category: 'Other', requiredType: 'Required', linkedKcwActivity: 'kcw_act_778095', status: 'Not Selected' },
  { id: 's2', name: 'Independent Workpaper on Fees-related Requirements', category: 'Independent', requiredType: 'Required', linkedKcwActivity: 'kcw_act_82144d', status: 'Not Selected' },
  { id: 's3', name: 'Tax Provision Review – Specialist WP', category: 'Specialists', requiredType: 'Required', linkedKcwActivity: 'kcw_act_599xe5', status: 'Not Selected' },
  { id: 'o1', name: 'Other Payables – Vouching', category: 'General Purpose', requiredType: 'Highly Rec.', linkedKcwActivity: 'kcw_act_cfdtbo', status: 'Not Selected' },
]

const substWpRowSeeds: SubstWpRowSeed[] = [
  // 财务报告
  { id: 'r01', businessProcess: '财务报告', procedureName: 'Additional Personal Independence Requirements for CSA Audit Engagements', type: 'WT', sampleInfo: 'sample', samplingFeature: 'N/A', populationAmount: '—', samplingDetail: '查看', progress: 100, wpTemplate: 'Wp Temp', workingPaper: 'Indep_WP.docx', reviewStatus: '已复核', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_e56af2', kcwActivity: 'kcw_act_342b0', preChecked: true, actions: ['AFP'] },
  { id: 'r02', businessProcess: '财务报告', procedureName: 'Group Audit Instructions – Component Auditors', type: 'TOE', sampleInfo: 'sample', samplingFeature: 'Component', populationAmount: '—', samplingDetail: '12/64', progress: 60, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '复核中', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_c6633b', kcwActivity: 'kcw_act_4c38e', preChecked: true, actions: ['OAK'] },
  { id: 'r03', businessProcess: '财务报告', procedureName: 'Financial Statement Close – Substantive Analytical Procedures', type: 'SAP', sampleInfo: 'sample', samplingFeature: 'Analytical', populationAmount: '2,800,000.00', samplingDetail: '查看', progress: 75, wpTemplate: 'Wp Temp', workingPaper: 'FS_Close.xlsx', reviewStatus: '复核中', uploader: 'Chen (SZ/CP2)', rmId: 'RM_a12c44', kcwActivity: 'kcw_act_778095', preChecked: true, actions: ['OA Review'] },
  // 诉讼
  { id: 'r04', businessProcess: '诉讼', procedureName: 'Litigation & Contingencies – Legal Letter', type: 'TOE', sampleInfo: 'sample', samplingFeature: 'Legal Letter', populationAmount: '—', samplingDetail: '8/20', progress: 40, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Wang (BJ/Legal)', rmId: 'RM_l98f21', kcwActivity: 'kcw_act_55a21', preChecked: false, actions: ['OA Confirm'] },
  { id: 'r05', businessProcess: '诉讼', procedureName: 'Contingent Liabilities Assessment', type: 'WT', sampleInfo: 'sample', samplingFeature: 'N/A', populationAmount: '—', samplingDetail: '查看', progress: 30, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Wang (BJ/Legal)', rmId: 'RM_l98f22', kcwActivity: 'kcw_act_55a22', preChecked: false, actions: ['OA Review'] },
  // 销售
  { id: 'r06', businessProcess: '销售', procedureName: 'Revenue Recognition – Cut-off Testing', type: 'TOD', sampleInfo: 'sample', samplingFeature: 'Invoice', populationAmount: '75,000.00', samplingDetail: '38/40', progress: 50, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Chen (SZ/CP2)', rmId: 'RM_e86a38', kcwActivity: 'kcw_act_3bH60', preChecked: false, actions: ['OA Vouching'] },
  { id: 'r07', businessProcess: '销售', procedureName: 'Trade Receivables – Circularisation', type: 'TOE', sampleInfo: 'sample', samplingFeature: 'Confirmation', populationAmount: '58,200.00', samplingDetail: '56/62', progress: 90, wpTemplate: 'Wp Temp', workingPaper: 'AR_Circ.xlsx', reviewStatus: '复核中', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_c73f0e5', kcwActivity: 'kcw_act_63e9e9', preChecked: true, actions: ['OA Confirm'] },
  { id: 'r08', businessProcess: '销售', procedureName: 'Sales Volume & Allowance (Bad Debt)', type: 'SAP', sampleInfo: 'sample', samplingFeature: 'Model', populationAmount: '120,000.00', samplingDetail: '查看', progress: 65, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Hu, Freya (BJ/CP3)', rmId: 'RM_d47b01', kcwActivity: 'kcw_act_77c10', preChecked: false, actions: ['OA Model'] },
  // 采购
  { id: 'r09', businessProcess: '采购', procedureName: 'Procurement – Vendor Confirmation', type: 'TOE', sampleInfo: 'sample', samplingFeature: 'Vendor', populationAmount: '45,000.00', samplingDetail: '21/30', progress: 70, wpTemplate: 'Wp Temp', workingPaper: 'Vendor_Conf.xlsx', reviewStatus: '复核中', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_p22a90', kcwActivity: 'kcw_act_88d22', preChecked: true, actions: ['OA Confirm'] },
  { id: 'r10', businessProcess: '采购', procedureName: 'Purchase Price Variance', type: 'WT', sampleInfo: 'sample', samplingFeature: 'N/A', populationAmount: '33,000.00', samplingDetail: '查看', progress: 55, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Chen (SZ/CP2)', rmId: 'RM_p22a91', kcwActivity: 'kcw_act_88d23', preChecked: false, actions: ['OA Review'] },
  // 存货与成本
  { id: 'r11', businessProcess: '存货与成本', procedureName: 'Inventory Work Paper – Existence & Valuation', type: 'TOD', sampleInfo: 'sample', samplingFeature: 'Invoice', populationAmount: '100,000.00', samplingDetail: '25/25', progress: 100, wpTemplate: 'Wp Temp', workingPaper: 'Inv_WP.xlsx', reviewStatus: '已复核', uploader: 'Chen (SZ/CP2)', rmId: 'RM_44159f', kcwActivity: 'kcw_act_47000', preChecked: true, actions: ['OA Vouching'] },
  { id: 'r12', businessProcess: '存货与成本', procedureName: 'Cost of Sales – Roll-forward', type: 'SAP', sampleInfo: 'sample', samplingFeature: 'Roll-forward', populationAmount: '210,000.00', samplingDetail: '查看', progress: 80, wpTemplate: 'Wp Temp', workingPaper: 'COS_RF.xlsx', reviewStatus: '复核中', uploader: 'Hu, Freya (BJ/CP3)', rmId: 'RM_4415a0', kcwActivity: 'kcw_act_47001', preChecked: true, actions: ['OA Model'] },
  { id: 'r13', businessProcess: '存货与成本', procedureName: 'Inventory NRV Impairment', type: 'WT', sampleInfo: 'sample', samplingFeature: 'N/A', populationAmount: '18,000.00', samplingDetail: '查看', progress: 45, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Chen (SZ/CP2)', rmId: 'RM_4415a1', kcwActivity: 'kcw_act_47002', preChecked: false, actions: ['OA Review'] },
  // 固定资产与在建工程
  { id: 'r14', businessProcess: '固定资产与在建工程', procedureName: 'PPE – Addition & Depreciation', type: 'TOD', sampleInfo: 'sample', samplingFeature: 'Tag', populationAmount: '320,000.00', samplingDetail: '40/40', progress: 95, wpTemplate: 'Wp Temp', workingPaper: 'FA_Tag.xlsx', reviewStatus: '已复核', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_fa001', kcwActivity: 'kcw_act_99001', preChecked: true, actions: ['OA Vouching'] },
  { id: 'r15', businessProcess: '固定资产与在建工程', procedureName: 'Construction in Progress – Capitalisation', type: 'TOE', sampleInfo: 'sample', samplingFeature: 'Site Visit', populationAmount: '150,000.00', samplingDetail: '9/15', progress: 60, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '复核中', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_fa002', kcwActivity: 'kcw_act_99002', preChecked: true, actions: ['OA Site'] },
  { id: 'r16', businessProcess: '固定资产与在建工程', procedureName: 'Impairment of Long-lived Assets', type: 'WT', sampleInfo: 'sample', samplingFeature: 'N/A', populationAmount: '60,000.00', samplingDetail: '查看', progress: 35, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Hu, Freya (BJ/CP3)', rmId: 'RM_fa003', kcwActivity: 'kcw_act_99003', preChecked: false, actions: ['OA Review'] },
  // 税务
  { id: 'r17', businessProcess: '税务', procedureName: 'Tax Provision Review – Specialist WP', type: 'WT', sampleInfo: 'sample', samplingFeature: 'N/A', populationAmount: '—', samplingDetail: '查看', progress: 40, wpTemplate: 'Wp Temp', workingPaper: 'Tax_Prov.xlsx', reviewStatus: '已复核', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_21f971', kcwActivity: 'kcw_act_599xe5', preChecked: true, actions: ['AFP'] },
  { id: 'r18', businessProcess: '税务', procedureName: 'Transfer Pricing Documentation', type: 'TOE', sampleInfo: 'sample', samplingFeature: 'Doc Review', populationAmount: '90,000.00', samplingDetail: '14/18', progress: 50, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Wang (BJ/Tax)', rmId: 'RM_tx002', kcwActivity: 'kcw_act_599xe6', preChecked: false, actions: ['OA Review'] },
  // 人力资源
  { id: 'r19', businessProcess: '人力资源', procedureName: 'Payroll – Completeness', type: 'TOD', sampleInfo: 'sample', samplingFeature: 'Payroll', populationAmount: '75,000.00', samplingDetail: '30/30', progress: 85, wpTemplate: 'Wp Temp', workingPaper: 'Payroll.xlsx', reviewStatus: '复核中', uploader: 'Hu, Freya (BJ/CP3)', rmId: 'RM_hr001', kcwActivity: 'kcw_act_66100', preChecked: true, actions: ['OA Vouching'] },
  { id: 'r20', businessProcess: '人力资源', procedureName: 'Independent Workpaper on Fees-related Requirements', type: 'WT', sampleInfo: 'sample', samplingFeature: 'N/A', populationAmount: '—', samplingDetail: '查看', progress: 80, wpTemplate: 'Wp Temp', workingPaper: 'Fees_WP.xlsx', reviewStatus: '已复核', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_89bf72', kcwActivity: 'kcw_act_82144d', preChecked: true, actions: ['AFP'] },
  // 资金与融资
  { id: 'r21', businessProcess: '资金与融资', procedureName: 'Bank Balances – Confirmation', type: 'TOE', sampleInfo: 'sample', samplingFeature: 'Confirmation', populationAmount: '500,000.00', samplingDetail: '60/60', progress: 100, wpTemplate: 'Wp Temp', workingPaper: 'Bank_Conf.xlsx', reviewStatus: '已复核', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_tr001', kcwActivity: 'kcw_act_77001', preChecked: true, actions: ['OA Confirm'] },
  { id: 'r22', businessProcess: '资金与融资', procedureName: 'Borrowings – Existence & Obligations', type: 'WT', sampleInfo: 'sample', samplingFeature: 'N/A', populationAmount: '280,000.00', samplingDetail: '查看', progress: 60, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '复核中', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_tr002', kcwActivity: 'kcw_act_77002', preChecked: true, actions: ['OA Review'] },
]

// 行 → Audit Procedure 模块的对应关系（按业务实质手工关联的 demo 映射）
const AUDIT_PROCEDURE_LINKS: Record<string, WpAuditProcedure> = {
  r01: { typeKey: 'fsr', itemCode: 'FSR-001' },
  r02: { typeKey: 'group-audit', itemCode: 'GA-001' },
  r03: { typeKey: 'fsr', itemCode: 'FSR-002' },
  r04: { typeKey: 'kdc-confirm', itemCode: 'KDC-F003' },
  r05: { typeKey: 'credit-review', itemCode: 'CR-002' },
  r06: { typeKey: 'vouching', itemCode: 'VO-001' },
  r07: { typeKey: 'kdc-confirm', itemCode: 'KDC-F002' },
  r08: { typeKey: 'credit-review', itemCode: 'CR-001' },
  r09: { typeKey: 'vouching', itemCode: 'VO-003' },
  r10: { typeKey: 'je-testing', itemCode: 'JE-003' },
  r11: { typeKey: 'inventory-obs', itemCode: 'IO-001' },
  r12: { typeKey: 'inventory-obs', itemCode: 'IO-003' },
  r13: { typeKey: 'inventory-obs', itemCode: 'IO-002' },
  r14: { typeKey: 'physical-attn', itemCode: 'PA-001' },
  r15: { typeKey: 'physical-attn', itemCode: 'PA-002' },
  r16: { typeKey: 'vouching', itemCode: 'VO-002' },
  r17: { typeKey: 'fsr', itemCode: 'FSR-003' },
  r18: { typeKey: 'group-audit', itemCode: 'GA-002' },
  r19: { typeKey: 'vouching', itemCode: 'VO-004' },
  r20: { typeKey: 'vouching', itemCode: 'VO-002' },
  r21: { typeKey: 'kdc-cash', itemCode: 'KDC-C001' },
  r22: { typeKey: 'kdc-cash', itemCode: 'KDC-C002' },
}

const DEFAULT_AUDIT_PROCEDURE: WpAuditProcedure = { typeKey: 'fsr', itemCode: 'FSR-001' }

const substWpRows: SubstWpRow[] = substWpRowSeeds.map(seed => ({
  ...seed,
  auditProcedure: AUDIT_PROCEDURE_LINKS[seed.id] ?? DEFAULT_AUDIT_PROCEDURE,
}))

// KCW File demo data — mirrors EngagementHub's KCW File list.
const DEMO_KCW_FILES_BY_ENGAGEMENT: Record<string, KcwFileOption[]> = {
  default: [
    { id: 'KC001', name: '241231_Stat_RF_Aurora_Planning', status: 'completed', type: 'Planning' },
    { id: 'KC002', name: '241231_Stat_RF_Aurora_Risk', status: 'in-progress', type: 'Risk' },
    { id: 'KC003', name: '241231_Stat_RF_GoldenHorizon_Planning', status: 'pending', type: 'Planning' },
    { id: 'KC004', name: '241231_Stat_RF_GoldenHorizon_Fraud', status: 'not-started', type: 'Fraud' },
    { id: 'KC005', name: '241231_Stat_RF_PacificStar_Single', status: 'on-hold', type: 'Risk' },
  ],
}


function WpsToolbar({
  search,
  searchPlaceholder,
  onSearch,
}: {
  search: string
  searchPlaceholder: string
  onSearch: (v: string) => void
}) {
  return (
    <div className="wps-toolbar">
      <div className="wps-search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          className="wps-search-input"
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
    </div>
  )
}

// 「抽样详情 / 进度」列只有两种状态：
//   1) 抽样进行中 —— 显示「已抽/总数」+ 细进度条，不再用圆点
//   2) 抽样已完成（不涉及抽样，或进度已满）—— 只显示一个可点击的「查看」入口
const SAMPLE_COUNT_RE = /^\d+\s*\/\s*\d+$/

function isSamplingInProgress(row: SubstWpRow) {
  return SAMPLE_COUNT_RE.test(row.samplingDetail) && row.progress < 100
}

function SampleProgressCell({ row, onView }: { row: SubstWpRow; onView: (row: SubstWpRow) => void }) {
  if (!isSamplingInProgress(row)) {
    return (
      <button
        type="button"
        className="wps-sample-done"
        title="抽样已完成，查看抽样详情"
        onClick={() => onView(row)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        查看
      </button>
    )
  }

  return (
    <div className="wps-sample-progress">
      <div className="wps-sample-progress-top">
        <span className="wps-sample-count">{row.samplingDetail}</span>
        <span className="wps-sample-pct">{row.progress}%</span>
      </div>
      <div
        className="wps-sample-bar"
        role="progressbar"
        aria-label="抽样进度"
        aria-valuenow={row.progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className={`wps-sample-bar-fill${row.progress >= 80 ? ' high' : ''}`}
          style={{ width: `${row.progress}%` }}
        />
      </div>
    </div>
  )
}

function reviewClass(s: SubstWpRow['reviewStatus']) {
  if (s === '已复核') return 'done'
  if (s === '复核中') return 'doing'
  return 'todo'
}

function typeClass(t: SubstWpRow['type']) {
  return `type-${t.toLowerCase()}`
}

function WpsKpiStrip({ total, uploaded, prechecked, reviewed }: { total: number; uploaded: number; prechecked: number; reviewed: number }) {
  const uploadRate = total ? Math.round((uploaded / total) * 100) : 0
  const precheckRate = total ? Math.round((prechecked / total) * 100) : 0
  const reviewRate = total ? Math.round((reviewed / total) * 100) : 0
  return (
    <div className="wps-kpi-strip">
      <div className="wps-kpi wps-kpi-primary">
        <div className="wps-kpi-label">实质性程序总数</div>
        <div className="wps-kpi-num">{total}<span>Procedures</span></div>
      </div>
      <div className="wps-kpi">
        <div className="wps-kpi-label">底稿上传率 <b>{uploadRate}%</b> <span>已上传 {uploaded}/{total}</span></div>
        <div className="wps-kpi-bar"><div className="wps-kpi-bar-fill" style={{ width: `${uploadRate}%` }} /></div>
      </div>
      <div className="wps-kpi">
        <div className="wps-kpi-label">底稿预检率 <b>{precheckRate}%</b> <span>PreCheck 已通过 {prechecked}</span></div>
        <div className="wps-kpi-bar"><div className="wps-kpi-bar-fill orange" style={{ width: `${precheckRate}%` }} /></div>
      </div>
      <div className="wps-kpi">
        <div className="wps-kpi-label">底稿复核通过率 <b>{reviewRate}%</b> <span>已通过 {reviewed} · 未通过 {total - reviewed}</span></div>
        <div className="wps-kpi-bar"><div className="wps-kpi-bar-fill green" style={{ width: `${reviewRate}%` }} /></div>
      </div>
      <div className="wps-kpi">
        <div className="wps-kpi-label">重要性水平</div>
        <div className="wps-kpi-num small">CNY 12,600,000</div>
        <div className="wps-kpi-sub">实际执行重要性水平 CNY 9,450,000<br />最小阈值 CNY 630,000</div>
      </div>
    </div>
  )
}

function WpsPagination({ total, page, pageSize, onPage, onPageSize }: {
  total: number; page: number; pageSize: number; onPage: (p: number) => void; onPageSize: (s: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)
  return (
    <div className="wps-pagination">
      <span className="wps-page-info">显示第 {start} 至 {end} 条，共 {total} 条实质性程序记录</span>
      <div className="wps-page-right">
        <span>每页</span>
        <select className="wps-page-size" value={pageSize} onChange={e => onPageSize(Number(e.target.value))}>
          <option value={15}>15 条</option>
          <option value={10}>10 条</option>
          <option value={20}>20 条</option>
        </select>
        <div className="wps-page-nav">
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
          <span>{page} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>›</button>
        </div>
      </div>
    </div>
  )
}

// ===== 文件图标 =====
// Excel：绿色圆角方块 + 白色 X，贴近 Excel 真实标识
function ExcelIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2" width="19" height="20" rx="3.5" fill="#107C41" />
      <path
        d="M9 8.2h2.35l1.65 2.7 1.65-2.7H17l-2.85 3.8L17.15 16h-2.35L13.1 13.3 11.2 16H8.85l2.95-3.9z"
        fill="#fff"
      />
    </svg>
  )
}

// Word：蓝色圆角方块 + 白色 W
function WordIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2" width="19" height="20" rx="3.5" fill="#2B579A" />
      <text x="12" y="16.6" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff" fontFamily="'Segoe UI', Arial, sans-serif">
        W
      </text>
    </svg>
  )
}

// 其他格式：通用文档图标
function DocIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 2h7.5L19 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#64748b" />
      <path d="M13.5 2 19 7.5h-4.5a1 1 0 0 1-1-1z" fill="#fff" opacity=".45" />
    </svg>
  )
}

function fileKind(name: string) {
  const ext = name.toLowerCase().split('.').pop() || ''
  if (['xlsx', 'xls', 'xlsm', 'csv'].includes(ext)) return 'excel'
  if (['docx', 'doc'].includes(ext)) return 'word'
  return 'other'
}

function FileTypeIcon({ name }: { name: string }) {
  const kind = fileKind(name)
  if (kind === 'excel') return <ExcelIcon />
  if (kind === 'word') return <WordIcon />
  return <DocIcon />
}

// ===== 「审计程序」列 =====
// 展示该行关联的 Audit Procedure 程序类型（短名 + 程序编号），点击跳转到程序明细
function AuditProcedureCell({ row, onOpen }: { row: SubstWpRow; onOpen: (row: SubstWpRow) => void }) {
  const type = findProcedureType(row.auditProcedure.typeKey)
  if (!type) return <span className="wps-proc-empty">—</span>

  const item = findProcedureItem(type, row.auditProcedure.itemCode)
  const code = item?.code ?? row.auditProcedure.itemCode
  return (
    <button
      type="button"
      className="wps-proc-link"
      title={`在 Audit Procedure 中查看「${type.label}」\n${code}${item ? ` ${item.name}` : ''}`}
      onClick={() => onOpen(row)}
    >
      <span className="wps-proc-icon" style={{ background: `${type.color}1A`, color: type.color }}>
        {procedureTypeIcon(type, 12)}
      </span>
      <span className="wps-proc-label">{procedureTypeShortName(type)}</span>
      <span className="wps-proc-code">{code}</span>
      <svg className="wps-proc-go" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17 17 7" />
        <path d="M9 7h8v8" />
      </svg>
    </button>
  )
}

function WorkPaperStation() {
  const { clientId, engagementId } = useParams<{ clientId: string; engagementId: string }>()
  const navigate = useNavigate()

  const kcwFileList: KcwFileOption[] = (engagementId && DEMO_KCW_FILES_BY_ENGAGEMENT[engagementId])
    ? DEMO_KCW_FILES_BY_ENGAGEMENT[engagementId]
    : DEMO_KCW_FILES_BY_ENGAGEMENT.default

  const [selectedKcw, setSelectedKcw] = useState(kcwFileList[0]?.id || '')

  // 第 2 节表格数据：工作底稿的上传 / 删除都维护在本地状态里
  const [s2Data, setS2Data] = useState<SubstWpRow[]>(substWpRows)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingRowRef = useRef<string | null>(null)

  // KPI inputs (derived from substantive procedure rows)
  const wpTotal = s2Data.length
  const wpUploaded = s2Data.filter(r => r.workingPaper).length
  const wpPrechecked = s2Data.filter(r => r.preChecked).length
  const wpReviewed = s2Data.filter(r => r.reviewStatus === '已复核').length

  // Section 1 (Standard WP Templates) search state
  const [s1Search, setS1Search] = useState('')

  // Section 2 (Substantive Procedure WP) search + pagination state
  const [s2Search, setS2Search] = useState('')
  const [s2Page, setS2Page] = useState(1)
  const [s2PageSize, setS2PageSize] = useState(15)

  const handleAction = (_name: string) => {
    /* TODO: wire toolbar actions to backend */
  }

  const handleViewSampling = (row: SubstWpRow) => handleAction(`查看抽样详情 · ${row.procedureName}`)

  // 底稿模版：点击即生成并下载一份样例 Excel
  const handleDownloadTemplate = (row: SubstWpRow) => {
    downloadSampleWorkPaperTemplate({
      templateName: row.wpTemplate,
      procedureName: row.procedureName,
      rmId: row.rmId,
      kcwActivity: row.kcwActivity,
      procedureType: row.type,
      businessProcess: row.businessProcess,
    })
  }

  // 工作底稿：上传（借用同一个隐藏 input，记录当前操作的行）
  const handlePickWorkingPaper = (rowId: string) => {
    pendingRowRef.current = rowId
    fileInputRef.current?.click()
  }

  const handleWorkingPaperSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const rowId = pendingRowRef.current
    if (file && rowId) {
      setS2Data(rows => rows.map(r => (r.id === rowId ? { ...r, workingPaper: file.name } : r)))
    }
    e.target.value = '' // 允许重复选择同一个文件
    pendingRowRef.current = null
  }

  // 工作底稿：删除已上传的文件
  const handleRemoveWorkingPaper = (rowId: string) => {
    setS2Data(rows => rows.map(r => (r.id === rowId ? { ...r, workingPaper: '' } : r)))
  }

  // 审计程序：跳转到 Audit Procedure 模块，直接打开对应程序类型的明细并高亮该程序
  const handleOpenProcedure = (row: SubstWpRow) => {
    const { typeKey, itemCode } = row.auditProcedure
    const query = new URLSearchParams({ type: typeKey, item: itemCode })
    navigate(`/engagement/${clientId}/${engagementId}/procedures?${query.toString()}`)
  }

  // Reset page when search/pagesize changes
  useEffect(() => { setS2Page(1) }, [s2Search, s2PageSize])

  // Section 1 filtered by search
  const s1Filtered = standardWpRows.filter(r => {
    const q = s1Search.trim().toLowerCase()
    return !q || r.name.toLowerCase().includes(q) || r.linkedKcwActivity.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  })

  // Section 2 filtered by search
  const s2Filtered = s2Data.filter(r => {
    const q = s2Search.trim().toLowerCase()
    return !q ||
      r.businessProcess.toLowerCase().includes(q) ||
      r.procedureName.toLowerCase().includes(q) ||
      r.rmId.toLowerCase().includes(q) ||
      r.kcwActivity.toLowerCase().includes(q)
  })
  const s2PageCount = Math.max(1, Math.ceil(s2Filtered.length / s2PageSize))
  const s2SafePage = Math.min(s2Page, s2PageCount)
  const s2Rows = s2Filtered.slice((s2SafePage - 1) * s2PageSize, s2SafePage * s2PageSize)

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

      {/* KPI Strip (new, screenshot-style) */}
      <WpsKpiStrip total={wpTotal} uploaded={wpUploaded} prechecked={wpPrechecked} reviewed={wpReviewed} />

      {/* ============ Section 1: Standard Work Paper Templates ============ */}
      <div className="wps-section">
        <div className="wps-section-header">
          <h2 className="wps-section-title">
            <span className="wps-section-num">1</span> Standard Work Paper Templates
            <span className="wps-section-meta">(M1F3 - Filter by Engagement Nature)</span>
          </h2>
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

        <div className="wps-info-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
          系统将筛选出 Kcw Opinion Profile 中适用的审计计准则 / 工作底稿 / 实体类型/是否那个逻辑，与您管理范围的 Engagement 属性匹配则展示关联匹配。
        </div>

        <WpsToolbar
          search={s1Search}
          searchPlaceholder="搜索底稿名称、KCw Activity"
          onSearch={setS1Search}
        />

        <div className="wps-table-wrap">
          <table className="wps-table wps-table-sm">
            <thead>
              <tr>
                <th>底稿名称</th>
                <th>类别</th>
                <th>必要级别</th>
                <th>关联 KCw Activity</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {s1Filtered.map(row => (
                <tr key={row.id}>
                  <td className="wp-name-cell">{row.name}</td>
                  <td>{row.category}</td>
                  <td><span className={`req-badge ${row.requiredType === 'Required' ? 'required' : 'highly-rec'}`}>{row.requiredType}</span></td>
                  <td>{row.linkedKcwActivity}</td>
                  <td><span className="status-dot not-selected"></span> Not Selected</td>
                </tr>
              ))}
              {s1Filtered.length === 0 && (
                <tr><td colSpan={5} className="wps-empty-cell">无匹配的底稿模板</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ Section 2: Substantive Procedure Work Papers ============ */}
      <div className="wps-section">
        <div className="wps-section-header">
          <h2 className="wps-section-title">
            <span className="wps-section-num">2</span> Substantive Procedure Work Papers
            <span className="wps-section-meta">(M1F4 - Match WP Templates to Substantive Procedures)</span>
          </h2>
        </div>

        <div className="wps-info-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
          系统解析用户上传的 RAAR Report，提取给 Engagement 下已计划的 RM 及对应的 Substantive Procedure，遍历管理链配置的实属性程序定义模板规则。
        </div>

        <div className="wps-section-body">
          <WpsToolbar
              search={s2Search}
              searchPlaceholder="搜索 RMM ID、程序编号、科..."
              onSearch={setS2Search}
            />

            <div className="wps-table-wrap">
              <table className="wps-table subst-table">
                <thead>
                  <tr>
                    <th>业务流程</th>
                    <th>程序描述</th>
                    <th>类型</th>
                    <th>样本信息</th>
                    <th>抽样特征</th>
                    <th>总体金额</th>
                    <th>抽样详情 / 进度</th>
                    <th>审计程序</th>
                    <th>底稿模板</th>
                    <th>工作底稿</th>
                    <th>上传人</th>
                    <th>底稿复核状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {s2Rows.map(row => (
                    <tr key={row.id}>
                      <td>{row.businessProcess}</td>
                      <td className="wp-name-cell">{row.procedureName}</td>
                      <td><span className={`type-badge ${typeClass(row.type)}`}>{row.type}</span></td>
                      <td><span className="wps-sample-link">{row.sampleInfo} <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M9 7h8v8" /></svg></span></td>
                      <td>{row.samplingFeature}</td>
                      <td className="wps-num">{row.populationAmount}</td>
                      <td>
                        <SampleProgressCell row={row} onView={handleViewSampling} />
                      </td>
                      <td>
                        <AuditProcedureCell row={row} onOpen={handleOpenProcedure} />
                      </td>
                      <td>
                        {/* 底稿模版：一个可点击的下载链接，点击生成样例 Excel */}
                        <button
                          type="button"
                          className="wps-tpl-link"
                          title={`下载底稿模版（Excel）：${row.wpTemplate}`}
                          onClick={() => handleDownloadTemplate(row)}
                        >
                          <span className="wps-tpl-icon"><ExcelIcon /></span>
                          <span className="wps-tpl-name">{row.wpTemplate}</span>
                          <svg className="wps-tpl-dl" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 3v11" />
                            <path d="m7.5 10 4.5 4.5 4.5-4.5" />
                            <path d="M4 20h16" />
                          </svg>
                        </button>
                      </td>
                      <td>
                        {row.workingPaper ? (
                          <span className="wps-file-chip" data-kind={fileKind(row.workingPaper)}>
                            <span className="wps-file-icon"><FileTypeIcon name={row.workingPaper} /></span>
                            <span className="wps-file-name" title={row.workingPaper}>{row.workingPaper}</span>
                            <button
                              type="button"
                              className="wps-file-del"
                              title="删除该工作底稿"
                              aria-label={`删除 ${row.workingPaper}`}
                              onClick={() => handleRemoveWorkingPaper(row.id)}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                                <path d="M5 5l14 14M19 5 5 19" />
                              </svg>
                            </button>
                          </span>
                        ) : (
                          <button type="button" className="wps-mini-upload" onClick={() => handlePickWorkingPaper(row.id)}>上传</button>
                        )}
                      </td>
                      <td className="wps-uploader">{row.uploader}</td>
                      <td><span className={`review-badge ${reviewClass(row.reviewStatus)}`}>{row.reviewStatus}</span></td>
                      <td>
                        <div className="wps-action-chips">
                          {row.actions.map(a => <span key={a} className="wps-action-chip">{a}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {s2Rows.length === 0 && (
                    <tr><td colSpan={13} className="wps-empty-cell">无匹配的实质性程序底稿</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <WpsPagination
              total={s2Filtered.length}
              page={s2SafePage}
              pageSize={s2PageSize}
              onPage={setS2Page}
              onPageSize={s => { setS2PageSize(s); setS2Page(1) }}
            />
        </div>
      </div>

      {/* 工作底稿上传用的隐藏 input，所有行共用 */}
      <input
        ref={fileInputRef}
        type="file"
        className="wps-file-input"
        accept=".xlsx,.xls,.xlsm,.csv,.docx,.doc,.pdf"
        onChange={handleWorkingPaperSelected}
      />
    </div>
  )
}

export default WorkPaperStation
