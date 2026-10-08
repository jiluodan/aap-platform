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
import { useLanguage } from '../contexts/LanguageContext'
import type { Lang } from '../i18n/translations'
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

/** 抽样方法：KSP / MUS，或 N/A（不涉及抽样） */
type SamplingMethod = 'KSP' | 'MUS' | 'N/A'

const SAMPLING_METHODS: SamplingMethod[] = ['KSP', 'MUS', 'N/A']

interface SubstWpRow {
  id: string
  businessProcess: string
  procedureName: string
  type: 'WT' | 'TOE' | 'TOD' | 'SAP'
  samplingMethod: SamplingMethod
  /** 样本量；抽样方法为 N/A 时为 null（该列显示 N/A） */
  sampleCount: number | null
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
  { id: 'r01', businessProcess: '财务报告', procedureName: 'Additional Personal Independence Requirements for CSA Audit Engagements', type: 'WT', samplingMethod: 'N/A', sampleCount: null, wpTemplate: 'Wp Temp', workingPaper: 'Indep_WP.docx', reviewStatus: '已复核', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_e56af2', kcwActivity: 'kcw_act_342b0', preChecked: true, actions: ['AFP'] },
  { id: 'r02', businessProcess: '财务报告', procedureName: 'Group Audit Instructions – Component Auditors', type: 'TOE', samplingMethod: 'KSP', sampleCount: 64, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '复核中', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_c6633b', kcwActivity: 'kcw_act_4c38e', preChecked: true, actions: ['OAK'] },
  { id: 'r03', businessProcess: '财务报告', procedureName: 'Financial Statement Close – Substantive Analytical Procedures', type: 'SAP', samplingMethod: 'MUS', sampleCount: 20, wpTemplate: 'Wp Temp', workingPaper: 'FS_Close.xlsx', reviewStatus: '复核中', uploader: 'Chen (SZ/CP2)', rmId: 'RM_a12c44', kcwActivity: 'kcw_act_778095', preChecked: true, actions: ['OA Review'] },
  // 诉讼
  { id: 'r04', businessProcess: '诉讼', procedureName: 'Litigation & Contingencies – Legal Letter', type: 'TOE', samplingMethod: 'MUS', sampleCount: 20, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Wang (BJ/Legal)', rmId: 'RM_l98f21', kcwActivity: 'kcw_act_55a21', preChecked: false, actions: ['OA Confirm'] },
  { id: 'r05', businessProcess: '诉讼', procedureName: 'Contingent Liabilities Assessment', type: 'WT', samplingMethod: 'N/A', sampleCount: null, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Wang (BJ/Legal)', rmId: 'RM_l98f22', kcwActivity: 'kcw_act_55a22', preChecked: false, actions: ['OA Review'] },
  // 销售
  { id: 'r06', businessProcess: '销售', procedureName: 'Revenue Recognition – Cut-off Testing', type: 'TOD', samplingMethod: 'KSP', sampleCount: 40, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Chen (SZ/CP2)', rmId: 'RM_e86a38', kcwActivity: 'kcw_act_3bH60', preChecked: false, actions: ['OA Vouching'] },
  { id: 'r07', businessProcess: '销售', procedureName: 'Trade Receivables – Circularisation', type: 'TOE', samplingMethod: 'KSP', sampleCount: 62, wpTemplate: 'Wp Temp', workingPaper: 'AR_Circ.xlsx', reviewStatus: '复核中', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_c73f0e5', kcwActivity: 'kcw_act_63e9e9', preChecked: true, actions: ['OA Confirm'] },
  { id: 'r08', businessProcess: '销售', procedureName: 'Sales Volume & Allowance (Bad Debt)', type: 'SAP', samplingMethod: 'MUS', sampleCount: 30, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Hu, Freya (BJ/CP3)', rmId: 'RM_d47b01', kcwActivity: 'kcw_act_77c10', preChecked: false, actions: ['OA Model'] },
  // 采购
  { id: 'r09', businessProcess: '采购', procedureName: 'Procurement – Vendor Confirmation', type: 'TOE', samplingMethod: 'KSP', sampleCount: 30, wpTemplate: 'Wp Temp', workingPaper: 'Vendor_Conf.xlsx', reviewStatus: '复核中', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_p22a90', kcwActivity: 'kcw_act_88d22', preChecked: true, actions: ['OA Confirm'] },
  { id: 'r10', businessProcess: '采购', procedureName: 'Purchase Price Variance', type: 'WT', samplingMethod: 'N/A', sampleCount: null, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Chen (SZ/CP2)', rmId: 'RM_p22a91', kcwActivity: 'kcw_act_88d23', preChecked: false, actions: ['OA Review'] },
  // 存货与成本
  { id: 'r11', businessProcess: '存货与成本', procedureName: 'Inventory Work Paper – Existence & Valuation', type: 'TOD', samplingMethod: 'KSP', sampleCount: 25, wpTemplate: 'Wp Temp', workingPaper: 'Inv_WP.xlsx', reviewStatus: '已复核', uploader: 'Chen (SZ/CP2)', rmId: 'RM_44159f', kcwActivity: 'kcw_act_47000', preChecked: true, actions: ['OA Vouching'] },
  { id: 'r12', businessProcess: '存货与成本', procedureName: 'Cost of Sales – Roll-forward', type: 'SAP', samplingMethod: 'MUS', sampleCount: 35, wpTemplate: 'Wp Temp', workingPaper: 'COS_RF.xlsx', reviewStatus: '复核中', uploader: 'Hu, Freya (BJ/CP3)', rmId: 'RM_4415a0', kcwActivity: 'kcw_act_47001', preChecked: true, actions: ['OA Model'] },
  { id: 'r13', businessProcess: '存货与成本', procedureName: 'Inventory NRV Impairment', type: 'WT', samplingMethod: 'N/A', sampleCount: null, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Chen (SZ/CP2)', rmId: 'RM_4415a1', kcwActivity: 'kcw_act_47002', preChecked: false, actions: ['OA Review'] },
  // 固定资产与在建工程
  { id: 'r14', businessProcess: '固定资产与在建工程', procedureName: 'PPE – Addition & Depreciation', type: 'TOD', samplingMethod: 'KSP', sampleCount: 40, wpTemplate: 'Wp Temp', workingPaper: 'FA_Tag.xlsx', reviewStatus: '已复核', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_fa001', kcwActivity: 'kcw_act_99001', preChecked: true, actions: ['OA Vouching'] },
  { id: 'r15', businessProcess: '固定资产与在建工程', procedureName: 'Construction in Progress – Capitalisation', type: 'TOE', samplingMethod: 'MUS', sampleCount: 15, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '复核中', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_fa002', kcwActivity: 'kcw_act_99002', preChecked: true, actions: ['OA Site'] },
  { id: 'r16', businessProcess: '固定资产与在建工程', procedureName: 'Impairment of Long-lived Assets', type: 'WT', samplingMethod: 'N/A', sampleCount: null, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Hu, Freya (BJ/CP3)', rmId: 'RM_fa003', kcwActivity: 'kcw_act_99003', preChecked: false, actions: ['OA Review'] },
  // 税务
  { id: 'r17', businessProcess: '税务', procedureName: 'Tax Provision Review – Specialist WP', type: 'WT', samplingMethod: 'N/A', sampleCount: null, wpTemplate: 'Wp Temp', workingPaper: 'Tax_Prov.xlsx', reviewStatus: '已复核', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_21f971', kcwActivity: 'kcw_act_599xe5', preChecked: true, actions: ['AFP'] },
  { id: 'r18', businessProcess: '税务', procedureName: 'Transfer Pricing Documentation', type: 'TOE', samplingMethod: 'MUS', sampleCount: 18, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '未复核', uploader: 'Wang (BJ/Tax)', rmId: 'RM_tx002', kcwActivity: 'kcw_act_599xe6', preChecked: false, actions: ['OA Review'] },
  // 人力资源
  { id: 'r19', businessProcess: '人力资源', procedureName: 'Payroll – Completeness', type: 'TOD', samplingMethod: 'KSP', sampleCount: 30, wpTemplate: 'Wp Temp', workingPaper: 'Payroll.xlsx', reviewStatus: '复核中', uploader: 'Hu, Freya (BJ/CP3)', rmId: 'RM_hr001', kcwActivity: 'kcw_act_66100', preChecked: true, actions: ['OA Vouching'] },
  { id: 'r20', businessProcess: '人力资源', procedureName: 'Independent Workpaper on Fees-related Requirements', type: 'WT', samplingMethod: 'N/A', sampleCount: null, wpTemplate: 'Wp Temp', workingPaper: 'Fees_WP.xlsx', reviewStatus: '已复核', uploader: 'Huang lan (SH/AQPF)', rmId: 'RM_89bf72', kcwActivity: 'kcw_act_82144d', preChecked: true, actions: ['AFP'] },
  // 资金与融资
  { id: 'r21', businessProcess: '资金与融资', procedureName: 'Bank Balances – Confirmation', type: 'TOE', samplingMethod: 'KSP', sampleCount: 60, wpTemplate: 'Wp Temp', workingPaper: 'Bank_Conf.xlsx', reviewStatus: '已复核', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_tr001', kcwActivity: 'kcw_act_77001', preChecked: true, actions: ['OA Confirm'] },
  { id: 'r22', businessProcess: '资金与融资', procedureName: 'Borrowings – Existence & Obligations', type: 'WT', samplingMethod: 'N/A', sampleCount: null, wpTemplate: 'Wp Temp', workingPaper: '', reviewStatus: '复核中', uploader: 'Lu los (HZ/CP1)', rmId: 'RM_tr002', kcwActivity: 'kcw_act_77002', preChecked: true, actions: ['OA Review'] },
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
  info,
}: {
  search: string
  searchPlaceholder: string
  onSearch: (v: string) => void
  /** 右侧附加信息（如已选项计数） */
  info?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="wps-toolbar">
      {/* 整个搜索框可点击聚焦，不只是中间那条输入区域 */}
      <div className="wps-search-box" onClick={() => inputRef.current?.focus()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          ref={inputRef}
          type="text"
          className="wps-search-input"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="wps-search-clear"
            aria-label="Clear"
            onClick={e => {
              e.stopPropagation()
              onSearch('')
              inputRef.current?.focus()
            }}
          >
            ×
          </button>
        )}
      </div>
      {info ? <span className="wps-toolbar-info">{info}</span> : null}
    </div>
  )
}

// ===== 页面文案：跟随顶部 EN / 中 语言切换 =====
interface WpsCopy {
  kpiTotal: string
  kpiUploadRate: string
  kpiUploaded: string
  kpiPrecheckRate: string
  kpiPrecheckPassed: string
  kpiReviewRate: string
  kpiPassed: string
  kpiNotPassed: string
  kpiMateriality: string
  kpiPerfMateriality: string
  kpiMinThreshold: string
  pageShowing: (start: number, end: number, total: number) => string
  perPage: string
  rowUnit: string
  colWpName: string
  colCategory: string
  colReqLevel: string
  colLinkedKcw: string
  colStatus: string
  colSelect: string
  statusNotSelected: string
  statusSelected: string
  selectAllAria: string
  selectRowAria: (name: string) => string
  selectedCount: (n: number, total: number) => string
  colBusinessProcess: string
  colProcedureDesc: string
  colType: string
  colSamplingMethod: string
  colNoOfSamples: string
  colAuditProcedure: string
  colWpTemplate: string
  colWorkingPaper: string
  colUploader: string
  colReviewStatus: string
  colActions: string
  s1Note: string
  s1Search: string
  s1Empty: string
  s2Note: string
  s2Search: string
  s2Empty: string
  samplingMethodAria: (name: string) => string
  noOfSamplesAria: (name: string) => string
  upload: string
  removeWpTitle: string
  removeWpAria: (name: string) => string
  downloadTplTitle: (name: string) => string
  openProcedureTitle: (label: string, code: string, itemName: string) => string
}

const WPS_COPY: Record<Lang, WpsCopy> = {
  zh: {
    kpiTotal: '实质性程序总数',
    kpiUploadRate: '底稿上传率',
    kpiUploaded: '已上传',
    kpiPrecheckRate: '底稿预检率',
    kpiPrecheckPassed: 'PreCheck 已通过',
    kpiReviewRate: '底稿复核通过率',
    kpiPassed: '已通过',
    kpiNotPassed: '未通过',
    kpiMateriality: '重要性水平',
    kpiPerfMateriality: '实际执行重要性水平',
    kpiMinThreshold: '最小阈值',
    pageShowing: (s, e, t) => `显示第 ${s} 至 ${e} 条，共 ${t} 条实质性程序记录`,
    perPage: '每页',
    rowUnit: '条',
    colWpName: '底稿名称',
    colCategory: '类别',
    colReqLevel: '必要级别',
    colLinkedKcw: '关联 KCw Activity',
    colStatus: '状态',
    colSelect: '选择',
    statusNotSelected: '未选择',
    statusSelected: '已选择',
    selectAllAria: '全选当前列表',
    selectRowAria: n => `选择底稿模板 ${n}`,
    selectedCount: (n, total) => `已选择 ${n} / ${total} 项`,
    colBusinessProcess: '业务流程',
    colProcedureDesc: '程序描述',
    colType: '类型',
    colSamplingMethod: '抽样方法',
    colNoOfSamples: '样本量',
    colAuditProcedure: '审计程序',
    colWpTemplate: '底稿模板',
    colWorkingPaper: '工作底稿',
    colUploader: '上传人',
    colReviewStatus: '底稿复核状态',
    colActions: '操作',
    s1Note: '系统将筛选出 Kcw Opinion Profile 中适用的审计计准则 / 工作底稿 / 实体类型/是否那个逻辑，与您管理范围的 Engagement 属性匹配则展示关联匹配。',
    s1Search: '搜索底稿名称、KCw Activity',
    s1Empty: '无匹配的底稿模板',
    s2Note: '系统解析用户上传的 RAAR Report，提取给 Engagement 下已计划的 RM 及对应的 Substantive Procedure，遍历管理链配置的实属性程序定义模板规则。',
    s2Search: '搜索 RMM ID、程序编号、科...',
    s2Empty: '无匹配的实质性程序底稿',
    samplingMethodAria: n => `选择「${n}」的抽样方法`,
    noOfSamplesAria: n => `填写「${n}」的样本量`,
    upload: '上传',
    removeWpTitle: '删除该工作底稿',
    removeWpAria: n => `删除 ${n}`,
    downloadTplTitle: n => `下载底稿模板（Excel）：${n}`,
    openProcedureTitle: (label, code, itemName) => `在 Audit Procedure 中查看「${label}」\n${code}${itemName}`,
  },
  en: {
    kpiTotal: 'Substantive Procedures',
    kpiUploadRate: 'WP Upload Rate',
    kpiUploaded: 'Uploaded',
    kpiPrecheckRate: 'WP Pre-check Rate',
    kpiPrecheckPassed: 'PreCheck passed',
    kpiReviewRate: 'WP Review Pass Rate',
    kpiPassed: 'Passed',
    kpiNotPassed: 'Not passed',
    kpiMateriality: 'Materiality',
    kpiPerfMateriality: 'Performance materiality',
    kpiMinThreshold: 'Minimum threshold',
    pageShowing: (s, e, t) => `Showing ${s}–${e} of ${t} substantive procedure records`,
    perPage: 'Per page',
    rowUnit: 'rows',
    colWpName: 'Work Paper Name',
    colCategory: 'Category',
    colReqLevel: 'Requirement Level',
    colLinkedKcw: 'Linked KCw Activity',
    colStatus: 'Status',
    colSelect: 'Select',
    statusNotSelected: 'Not Selected',
    statusSelected: 'Selected',
    selectAllAria: 'Select all in current list',
    selectRowAria: n => `Select work paper template ${n}`,
    selectedCount: (n, total) => `${n} of ${total} selected`,
    colBusinessProcess: 'Business Process',
    colProcedureDesc: 'Procedure Description',
    colType: 'Type',
    colSamplingMethod: 'Sampling Method',
    colNoOfSamples: 'No. of samples',
    colAuditProcedure: 'Audit Procedure',
    colWpTemplate: 'WP Template',
    colWorkingPaper: 'Working Paper',
    colUploader: 'Uploader',
    colReviewStatus: 'WP Review Status',
    colActions: 'Actions',
    s1Note: 'The system filters the applicable auditing standards / work papers / entity types from the KCw Opinion Profile and shows the linked matches against the attributes of engagements within your management scope.',
    s1Search: 'Search work paper name, KCw Activity',
    s1Empty: 'No matching work paper templates',
    s2Note: 'The system parses the uploaded RAAR Report, extracts the planned RMs and corresponding Substantive Procedures for the engagement, and walks the template rules configured for substantive procedures in the management chain.',
    s2Search: 'Search RMM ID, procedure code...',
    s2Empty: 'No matching substantive procedure work papers',
    samplingMethodAria: n => `Sampling method for ${n}`,
    noOfSamplesAria: n => `No. of samples for ${n}`,
    upload: 'Upload',
    removeWpTitle: 'Remove this working paper',
    removeWpAria: n => `Remove ${n}`,
    downloadTplTitle: n => `Download WP template (Excel): ${n}`,
    openProcedureTitle: (label, code, itemName) => `Open in Audit Procedure — "${label}"\n${code}${itemName}`,
  },
}

function useCopy(): WpsCopy {
  const { lang } = useLanguage()
  return WPS_COPY[lang]
}

// 业务流程：受控词表，英文界面下展示英文分类名
const BUSINESS_PROCESS_EN: Record<string, string> = {
  '财务报告': 'Financial Reporting',
  '诉讼': 'Litigation',
  '销售': 'Sales',
  '采购': 'Procurement',
  '存货与成本': 'Inventory & Cost',
  '固定资产与在建工程': 'Fixed Assets & CIP',
  '税务': 'Tax',
  '人力资源': 'Human Resources',
  '资金与融资': 'Treasury & Financing',
}

const REVIEW_STATUS_EN: Record<SubstWpRow['reviewStatus'], string> = {
  '未复核': 'Not Reviewed',
  '复核中': 'In Review',
  '已复核': 'Reviewed',
}

const businessProcessLabel = (v: string, lang: Lang) => (lang === 'zh' ? v : BUSINESS_PROCESS_EN[v] || v)

const reviewStatusLabel = (s: SubstWpRow['reviewStatus'], lang: Lang) => (lang === 'zh' ? s : REVIEW_STATUS_EN[s])

// 「抽样方法 / 样本量」两列：抽样方法为下拉（KSP / MUS / N/A），
// 选 N/A 时样本量不可填，该单元格直接显示 N/A
function SamplingMethodCell({ row, onChange }: { row: SubstWpRow; onChange: (method: SamplingMethod) => void }) {
  const c = useCopy()
  return (
    <select
      className="wps-sampling-select"
      value={row.samplingMethod}
      aria-label={c.samplingMethodAria(row.procedureName)}
      onChange={e => onChange(e.target.value as SamplingMethod)}
    >
      {SAMPLING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  )
}

function SampleCountCell({ row, onChange }: { row: SubstWpRow; onChange: (raw: string) => void }) {
  const c = useCopy()
  if (row.samplingMethod === 'N/A') return <span className="wps-na-text">N/A</span>
  return (
    <input
      type="number"
      min={1}
      className="wps-sample-count-input"
      value={row.sampleCount ?? ''}
      placeholder="—"
      aria-label={c.noOfSamplesAria(row.procedureName)}
      onChange={e => onChange(e.target.value)}
    />
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
  const c = useCopy()
  const uploadRate = total ? Math.round((uploaded / total) * 100) : 0
  const precheckRate = total ? Math.round((prechecked / total) * 100) : 0
  const reviewRate = total ? Math.round((reviewed / total) * 100) : 0
  return (
    <div className="wps-kpi-strip">
      <div className="wps-kpi wps-kpi-primary">
        <div className="wps-kpi-label">{c.kpiTotal}</div>
        <div className="wps-kpi-num">{total}<span>Procedures</span></div>
      </div>
      <div className="wps-kpi">
        <div className="wps-kpi-label"><span className="wps-kpi-name">{c.kpiUploadRate}</span> <b>{uploadRate}%</b> <span className="wps-kpi-detail">{c.kpiUploaded} {uploaded}/{total}</span></div>
        <div className="wps-kpi-bar"><div className="wps-kpi-bar-fill" style={{ width: `${uploadRate}%` }} /></div>
      </div>
      <div className="wps-kpi">
        <div className="wps-kpi-label"><span className="wps-kpi-name">{c.kpiPrecheckRate}</span> <b>{precheckRate}%</b> <span className="wps-kpi-detail">{c.kpiPrecheckPassed} {prechecked}</span></div>
        <div className="wps-kpi-bar"><div className="wps-kpi-bar-fill orange" style={{ width: `${precheckRate}%` }} /></div>
      </div>
      <div className="wps-kpi">
        <div className="wps-kpi-label"><span className="wps-kpi-name">{c.kpiReviewRate}</span> <b>{reviewRate}%</b> <span className="wps-kpi-detail">{c.kpiPassed} {reviewed} · {c.kpiNotPassed} {total - reviewed}</span></div>
        <div className="wps-kpi-bar"><div className="wps-kpi-bar-fill green" style={{ width: `${reviewRate}%` }} /></div>
      </div>
      <div className="wps-kpi">
        <div className="wps-kpi-label">{c.kpiMateriality}</div>
        <div className="wps-kpi-num small">CNY 12,600,000</div>
        <div className="wps-kpi-sub">{c.kpiPerfMateriality} CNY 9,450,000<br />{c.kpiMinThreshold} CNY 630,000</div>
      </div>
    </div>
  )
}

function WpsPagination({ total, page, pageSize, onPage, onPageSize }: {
  total: number; page: number; pageSize: number; onPage: (p: number) => void; onPageSize: (s: number) => void
}) {
  const c = useCopy()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)
  return (
    <div className="wps-pagination">
      <span className="wps-page-info">{c.pageShowing(start, end, total)}</span>
      <div className="wps-page-right">
        <span>{c.perPage}</span>
        <select className="wps-page-size" value={pageSize} onChange={e => onPageSize(Number(e.target.value))}>
          <option value={15}>15 {c.rowUnit}</option>
          <option value={10}>10 {c.rowUnit}</option>
          <option value={20}>20 {c.rowUnit}</option>
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
  const c = useCopy()
  const type = findProcedureType(row.auditProcedure.typeKey)
  if (!type) return <span className="wps-proc-empty">—</span>

  const item = findProcedureItem(type, row.auditProcedure.itemCode)
  const code = item?.code ?? row.auditProcedure.itemCode
  return (
    <button
      type="button"
      className="wps-proc-link"
      title={c.openProcedureTitle(type.label, code, item ? ` ${item.name}` : '')}
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
  const { lang } = useLanguage()
  const c = useCopy()

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

  // Section 1 (Standard WP Templates) search + selection state
  const [s1Search, setS1Search] = useState('')
  const [s1SelectedIds, setS1SelectedIds] = useState<string[]>(
    () => standardWpRows.filter(r => r.status === 'Selected').map(r => r.id),
  )
  const s1AllCheckRef = useRef<HTMLInputElement>(null)

  // Section 2 (Substantive Procedure WP) search + pagination state
  const [s2Search, setS2Search] = useState('')
  const [s2Page, setS2Page] = useState(1)
  const [s2PageSize, setS2PageSize] = useState(15)

  // 抽样方法：切换为 N/A 时样本量一并置空（该列展示 N/A）
  const handleSamplingMethodChange = (rowId: string, method: SamplingMethod) => {
    setS2Data(rows => rows.map(r => (r.id === rowId
      ? { ...r, samplingMethod: method, sampleCount: method === 'N/A' ? null : r.sampleCount }
      : r)))
  }

  // 样本量：允许留空，留空时按 null 存（展示占位符）
  const handleSampleCountChange = (rowId: string, raw: string) => {
    const value = raw.trim() === '' ? null : Math.max(0, Number(raw))
    setS2Data(rows => rows.map(r => (r.id === rowId ? { ...r, sampleCount: value } : r)))
  }

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

  // Section 1 selection：勾选后 Status 列同步为「已选择 / 未选择」
  const isS1Selected = (id: string) => s1SelectedIds.includes(id)
  const toggleS1Row = (id: string) =>
    setS1SelectedIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]))
  const s1VisibleIds = s1Filtered.map(r => r.id)
  const s1AllVisibleSelected = s1VisibleIds.length > 0 && s1VisibleIds.every(id => isS1Selected(id))
  const s1SomeVisibleSelected = s1VisibleIds.some(id => isS1Selected(id))
  const toggleS1All = () =>
    setS1SelectedIds(ids =>
      s1AllVisibleSelected
        ? ids.filter(id => !s1VisibleIds.includes(id))
        : Array.from(new Set([...ids, ...s1VisibleIds])),
    )

  // 表头全选框的「半选」态
  useEffect(() => {
    if (s1AllCheckRef.current) {
      s1AllCheckRef.current.indeterminate = !s1AllVisibleSelected && s1SomeVisibleSelected
    }
  }, [s1AllVisibleSelected, s1SomeVisibleSelected])

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
      </div>

      {/* KPI Strip */}
      <WpsKpiStrip total={wpTotal} uploaded={wpUploaded} prechecked={wpPrechecked} reviewed={wpReviewed} />

      {/* ============ Section 1: Standard Work Paper Templates ============ */}
      <div className="wps-section">
        <div className="wps-section-header">
          <h2 className="wps-section-title">
            <span className="wps-section-num">1</span> Standard Work Paper Templates
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
          {c.s1Note}
        </div>

        <WpsToolbar
          search={s1Search}
          searchPlaceholder={c.s1Search}
          onSearch={setS1Search}
          info={c.selectedCount(s1SelectedIds.length, standardWpRows.length)}
        />

        <div className="wps-table-wrap">
          <table className="wps-table wps-table-sm">
            <thead>
              <tr>
                <th className="wps-col-select">
                  <input
                    ref={s1AllCheckRef}
                    type="checkbox"
                    className="wps-check"
                    aria-label={c.selectAllAria}
                    checked={s1AllVisibleSelected}
                    onChange={toggleS1All}
                  />
                  <span className="wps-col-select-label">{c.colSelect}</span>
                </th>
                <th>{c.colWpName}</th>
                <th>{c.colCategory}</th>
                <th>{c.colReqLevel}</th>
                <th>{c.colLinkedKcw}</th>
                <th>{c.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {s1Filtered.map(row => {
                const selected = isS1Selected(row.id)
                return (
                  <tr key={row.id} className={selected ? 'is-selected' : undefined}>
                    <td className="wps-col-select">
                      <input
                        type="checkbox"
                        className="wps-check"
                        aria-label={c.selectRowAria(row.name)}
                        checked={selected}
                        onChange={() => toggleS1Row(row.id)}
                      />
                    </td>
                    <td className="wp-name-cell">{row.name}</td>
                    <td>{row.category}</td>
                    <td><span className={`req-badge ${row.requiredType === 'Required' ? 'required' : 'highly-rec'}`}>{row.requiredType}</span></td>
                    <td>{row.linkedKcwActivity}</td>
                    <td>
                      <span className={`status-dot ${selected ? 'selected' : 'not-selected'}`}></span>
                      {selected ? c.statusSelected : c.statusNotSelected}
                    </td>
                  </tr>
                )
              })}
              {s1Filtered.length === 0 && (
                <tr><td colSpan={6} className="wps-empty-cell">{c.s1Empty}</td></tr>
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
          </h2>
        </div>

        <div className="wps-info-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
          {c.s2Note}
        </div>

        <div className="wps-section-body">
          <WpsToolbar
              search={s2Search}
              searchPlaceholder={c.s2Search}
              onSearch={setS2Search}
            />

            <div className="wps-table-wrap">
              <table className="wps-table subst-table">
                <thead>
                  <tr>
                    <th>{c.colBusinessProcess}</th>
                    <th>{c.colProcedureDesc}</th>
                    <th>{c.colType}</th>
                    <th>{c.colSamplingMethod}</th>
                    <th>{c.colNoOfSamples}</th>
                    <th>{c.colAuditProcedure}</th>
                    <th>{c.colWpTemplate}</th>
                    <th>{c.colWorkingPaper}</th>
                    <th>{c.colUploader}</th>
                    <th>{c.colReviewStatus}</th>
                    <th>{c.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {s2Rows.map(row => (
                    <tr key={row.id}>
                      <td>{businessProcessLabel(row.businessProcess, lang)}</td>
                      <td className="wp-name-cell">{row.procedureName}</td>
                      <td><span className={`type-badge ${typeClass(row.type)}`}>{row.type}</span></td>
                      <td>
                        <SamplingMethodCell row={row} onChange={m => handleSamplingMethodChange(row.id, m)} />
                      </td>
                      <td className="wps-num">
                        <SampleCountCell row={row} onChange={raw => handleSampleCountChange(row.id, raw)} />
                      </td>
                      <td>
                        <AuditProcedureCell row={row} onOpen={handleOpenProcedure} />
                      </td>
                      <td>
                        {/* 底稿模版：一个可点击的下载链接，点击生成样例 Excel */}
                        <button
                          type="button"
                          className="wps-tpl-link"
                          title={c.downloadTplTitle(row.wpTemplate)}
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
                              title={c.removeWpTitle}
                              aria-label={c.removeWpAria(row.workingPaper)}
                              onClick={() => handleRemoveWorkingPaper(row.id)}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                                <path d="M5 5l14 14M19 5 5 19" />
                              </svg>
                            </button>
                          </span>
                        ) : (
                          <button type="button" className="wps-mini-upload" onClick={() => handlePickWorkingPaper(row.id)}>{c.upload}</button>
                        )}
                      </td>
                      <td className="wps-uploader">{row.uploader}</td>
                      <td><span className={`review-badge ${reviewClass(row.reviewStatus)}`}>{reviewStatusLabel(row.reviewStatus, lang)}</span></td>
                      <td>
                        <div className="wps-action-chips">
                          {row.actions.map(a => <span key={a} className="wps-action-chip">{a}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {s2Rows.length === 0 && (
                    <tr><td colSpan={11} className="wps-empty-cell">{c.s2Empty}</td></tr>
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
