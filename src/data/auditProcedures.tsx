// Audit Procedure 程序类型数据（从 AuditProcedures 页面抽出，供 Work Paper Station 等处复用）
import { cloneElement } from 'react'
import type { ReactElement, ReactNode } from 'react'

// ===== Types =====
export interface ProcedureItem {
  id: string
  code: string
  name: string
  description: string
  status: 'not-started' | 'in-progress' | 'completed' | 'reviewed'
  risk: 'high' | 'medium' | 'low'
  workpapers: number
  assignedTo: string
  rmId: string           // RM ID from template (e.g. "100.1.01")
  procedureRef: string    // Procedure Ref (e.g. "SPD02006")
  tags: string[]         // Category tags this procedure belongs to
}

export interface ProcedureType {
  id: string
  key: string
  label: string
  icon: ReactNode
  color: string
  bg: string
  items: ProcedureItem[]
}

// ===== Demo Data - 12 Procedure Types (from image) =====
export const procedureTypesData: ProcedureType[] = [
  {
    id: 'fsr', key: 'fsr', label: 'Financial Statements Reconciliation and/or Formatting',
    color: '#00338D', bg: '#e8edf5',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
    items: [
      { id: 'fsr-1', code: 'FSR-001', name: 'Balance Sheet Reconciliation', description: '资产负债表项目核对与格式化', status: 'completed', risk: 'medium', workpapers: 3, assignedTo: '张三', rmId: '207.1.02', procedureRef: 'GOSPD06004', tags: ['cash-bank'] },
      { id: 'fsr-2', code: 'FSR-002', name: 'Income Statement Formatting', description: '利润表格式调整与数据核对', status: 'in-progress', risk: 'low', workpapers: 2, assignedTo: '李四', rmId: '207.1.03', procedureRef: 'GOSPD06008', tags: ['cash-bank'] },
      { id: 'fsr-3', code: 'FSR-003', name: 'Cash Flow Reconciliation', description: '现金流量表勾稽关系验证', status: 'not-started', risk: 'medium', workpapers: 0, assignedTo: '王五', rmId: '207.1.03', procedureRef: 'GOSPD06004', tags: ['cash-bank'] },
    ]
  },
  {
    id: 'kdc-cash', key: 'kdc-cash', label: 'KDC Service on Cash at Bank Work Paper',
    color: '#0091DA', bg: '#e5f4ff',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    items: [
      { id: 'kdc-1', code: 'KDC-C001', name: 'Bank Balance Verification', description: '银行存款余额调节表编制', status: 'in-progress', risk: 'high', workpapers: 2, assignedTo: '赵六', rmId: '207.1.02', procedureRef: 'GOSPD06004', tags: ['cash-bank'] },
      { id: 'kdc-2', code: 'KDC-C002', name: 'Cash Count Workpaper', description: '现金盘点工作底稿', status: 'completed', risk: 'low', workpapers: 1, assignedTo: '钱七', rmId: '210.1.04', procedureRef: 'GOSPD10004', tags: ['cash-bank'] },
    ]
  },
  {
    id: 'kdc-confirm', key: 'kdc-confirm', label: 'KDC Service on Audit Confirmations',
    color: '#00A3A1', bg: '#e6fffa',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    items: [
      { id: 'kdc-f1', code: 'KDC-F001', name: 'Bank Confirmation Follow-up', description: '银行函证跟进与回函核对', status: 'in-progress', risk: 'high', workpapers: 3, assignedTo: '孙八', rmId: '207.1.02', procedureRef: 'GOSPD06004', tags: ['cash-bank'] },
      { id: 'kdc-f2', code: 'KDC-F002', name: 'AR Confirmation Service', description: '应收账款函证服务', status: 'not-started', risk: 'medium', workpapers: 0, assignedTo: '周九', rmId: '109.6.02.S', procedureRef: 'GOSPD01001', tags: ['ar-revenue'] },
      { id: 'kdc-f3', code: 'KDC-F003', name: 'Legal Confirmation', description: '法律事务函证服务', status: 'not-started', risk: 'low', workpapers: 0, assignedTo: '吴十', rmId: '109.6.02.S', procedureRef: 'GOSPD01001', tags: ['ar-revenue'] },
    ]
  },
  {
    id: 'credit-review', key: 'credit-review', label: 'Credit Review',
    color: '#805AD5', bg: '#faf5ff',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    items: [
      { id: 'cr-1', code: 'CR-001', name: 'AR Aging Analysis Review', description: '应收账款账龄分析审查', status: 'in-progress', risk: 'high', workpapers: 2, assignedTo: '郑十一', rmId: '109.6.02.S', procedureRef: 'GOSPD01001', tags: ['ar-revenue'] },
      { id: 'cr-2', code: 'CR-002', name: 'Bad Debt Provision Assessment', description: '坏账准备计提评估', status: 'not-started', risk: 'high', workpapers: 0, assignedTo: '张三', rmId: '109.6.02.S', procedureRef: 'GOSPD01001', tags: ['ar-revenue'] },
    ]
  },
  {
    id: 'alteryx', key: 'alteryx', label: 'Alteryx D&A Service',
    color: '#E4002B', bg: '#fef2f2',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    items: [
      { id: 'al-1', code: 'ALY-001', name: 'Full Population Testing', description: '全量数据测试（Alteryx）', status: 'completed', risk: 'medium', workpapers: 4, assignedTo: '李四', rmId: '115.2.02', procedureRef: 'GOSPD01911', tags: ['revenue'] },
      { id: 'al-2', code: 'ALY-002', name: 'Data Analytics Workflow', description: '数据分析工作流执行', status: 'in-progress', risk: 'medium', workpapers: 1, assignedTo: '王五', rmId: '115.2.02', procedureRef: 'GOSPD01911', tags: ['revenue'] },
    ]
  },
  {
    id: 'je-testing', key: 'je-testing', label: 'Journal Entries Testing',
    color: '#D69E2E', bg: '#fefce8',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    items: [
      { id: 'je-1', code: 'JE-001', name: 'JE Risk Assessment', description: '日记账分录风险评估', status: 'in-progress', risk: 'high', workpapers: 3, assignedTo: '赵六', rmId: '115.2.13', procedureRef: 'GOSPD01931', tags: ['revenue'] },
      { id: 'je-2', code: 'JE-002', name: 'Manual JE Sampling', description: '手工分录抽样测试', status: 'not-started', risk: 'high', workpapers: 0, assignedTo: '钱七', rmId: '115.2.14', procedureRef: 'GOSPD01030', tags: ['revenue'] },
      { id: 'je-3', code: 'JE-003', name: 'Period-end JE Review', description: '期末分录复核', status: 'completed', risk: 'medium', workpapers: 2, assignedTo: '孙八', rmId: '100.2.06', procedureRef: 'SPD02005', tags: ['procurement-ap'] },
    ]
  },
  {
    id: 'lease-recalc', key: 'lease-recalc', label: 'Lease recalculation',
    color: '#38A169', bg: '#f0fff4',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>,
    items: [
      { id: 'lr-1', code: 'LR-001', name: 'Lease Liability Recalculation', description: '租赁负债重新计算', status: 'in-progress', risk: 'medium', workpapers: 2, assignedTo: '周九', rmId: '109.7.121', procedureRef: 'GOSPD06403', tags: ['ar-revenue'] },
      { id: 'lr-2', code: 'LR-002', name: 'ROU Asset Verification', description: '使用权资产确认验证', status: 'not-started', risk: 'medium', workpapers: 0, assignedTo: '吴十', rmId: '109.7.121', procedureRef: 'GOSPD06403', tags: ['ar-revenue'] },
    ]
  },
  {
    id: 'group-audit', key: 'group-audit', label: 'Group Audit',
    color: '#DD6B20', bg: '#fffaf0',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    items: [
      { id: 'ga-1', code: 'GA-001', name: 'Component Auditor Coordination', description: '组成部分审计师协调', status: 'completed', risk: 'high', workpapers: 3, assignedTo: '郑十一', rmId: '232.3.15a', procedureRef: 'GOSPD10004', tags: ['share-capital'] },
      { id: 'ga-2', code: 'GA-002', name: 'Group Consolidation Review', description: '集团合并报表审核', status: 'in-progress', risk: 'high', workpapers: 2, assignedTo: '张三', rmId: '232.3.01', procedureRef: 'GOSPD10009', tags: ['share-capital'] },
    ]
  },
  {
    id: 'inventory-obs', key: 'inventory-obs', label: 'Inventory observations',
    color: '#319795', bg: '#e6fffa',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    items: [
      { id: 'io-1', code: 'IO-001', name: 'Physical Inventory Observation', description: '存货实地监盘观察', status: 'completed', risk: 'medium', workpapers: 2, assignedTo: '李四', rmId: '202.1.02', procedureRef: 'SPD03027', tags: ['inventory'] },
      { id: 'io-2', code: 'IO-002', name: 'Inventory Cut-off Test', description: '存货截止性测试', status: 'in-progress', risk: 'medium', workpapers: 1, assignedTo: '王五', rmId: '201.1.04', procedureRef: 'SPD03019', tags: ['inventory'] },
      { id: 'io-3', code: 'IO-003', name: 'Inventory Valuation Check', description: '存货计价检查', status: 'not-started', risk: 'low', workpapers: 0, assignedTo: '赵六', rmId: '202.2.07', procedureRef: 'SPD03014', tags: ['inventory'] },
    ]
  },
  {
    id: 'physical-attn', key: 'physical-attn', label: 'Physical attendance procedures',
    color: '#B83280', bg: '#fff5f7',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    items: [
      { id: 'pa-1', code: 'PA-001', name: 'Year-end Attendance', description: '年末实地出席程序', status: 'in-progress', risk: 'high', workpapers: 2, assignedTo: '钱七', rmId: '216.1.02', procedureRef: 'SPD05002', tags: ['fixed-assets'] },
      { id: 'pa-2', code: 'PA-002', name: 'Stocktake Participation', description: '盘点参与记录', status: 'not-started', risk: 'medium', workpapers: 0, assignedTo: '孙八', rmId: '216.5.01', procedureRef: 'GOSPD05004', tags: ['fixed-assets'] },
    ]
  },
  {
    id: 'vouching', key: 'vouching', label: 'Vouching',
    color: '#00338D', bg: '#e8edf5',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    items: [
      { id: 'vo-1', code: 'VO-001', name: 'Revenue Vouching', description: '收入凭证抽查', status: 'in-progress', risk: 'high', workpapers: 4, assignedTo: '周九', rmId: '115.2.15', procedureRef: 'GOSPD01010.7', tags: ['revenue'] },
      { id: 'vo-2', code: 'VO-002', name: 'Expense Vouching', description: '费用凭证抽查', status: 'in-progress', risk: 'high', workpapers: 3, assignedTo: '吴十', rmId: '100.1.01', procedureRef: 'SPD02006', tags: ['procurement-ap'] },
      { id: 'vo-3', code: 'VO-003', name: 'Purchase Vouching', description: '采购凭证抽查', status: 'completed', risk: 'medium', workpapers: 2, assignedTo: '郑十一', rmId: '100.1.02', procedureRef: 'SPD02007', tags: ['procurement-ap'] },
      { id: 'vo-4', code: 'VO-004', name: 'Payroll Vouching', description: '薪酬凭证抽查', status: 'not-started', risk: 'low', workpapers: 0, assignedTo: '张三', rmId: '219GN.101', procedureRef: 'SPD04002', tags: ['payroll-hr'] },
    ]
  },
]

// Only show types that have items (non-empty detail list)
export const visibleProcedureTypes = procedureTypesData.filter(t => t.items.length > 0)

// ===== Helpers =====

/** 按 id 或 key 查程序类型 */
export function findProcedureType(keyOrId: string | null | undefined) {
  if (!keyOrId) return undefined
  return procedureTypesData.find(t => t.id === keyOrId || t.key === keyOrId)
}

/** 在某个程序类型下按 id 或 code 查具体程序 */
export function findProcedureItem(type: ProcedureType | undefined, key: string | null | undefined) {
  if (!type || !key) return undefined
  return type.items.find(i => i.id === key || i.code === key)
}

/** 复用类型自带的 SVG 图标，并缩放到表格需要的尺寸 */
export function procedureTypeIcon(type: ProcedureType, size = 13): ReactElement {
  return cloneElement(type.icon as ReactElement<{ width?: number; height?: number }>, { width: size, height: size })
}

/** 紧凑场景（如表格单元格）使用的短名称，完整名称见 type.label */
const SHORT_LABELS: Record<string, string> = {
  fsr: 'FSR',
  'kdc-cash': 'KDC Cash',
  'kdc-confirm': 'KDC Confirmation',
  'credit-review': 'Credit Review',
  alteryx: 'Alteryx D&A',
  'je-testing': 'JE Testing',
  'lease-recalc': 'Lease Recalc',
  'group-audit': 'Group Audit',
  'inventory-obs': 'Inventory Obs.',
  'physical-attn': 'Physical Attend.',
  vouching: 'Vouching',
}

export function procedureTypeShortName(type: ProcedureType) {
  return SHORT_LABELS[type.key] ?? type.label
}
