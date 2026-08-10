// PBC Management — Enhanced with filter, batch edit, list view, export, bulk ops, charts
import { useState, useRef, useEffect, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './PBCManager.css'

// ===== Types =====
interface PBCItem {
  id: string
  category: string
  description: string | ((isZh: boolean) => string)
  requestedBy: string
  requestedDate: string
  dueDate: string
  status: 'pending' | 'received' | 'reviewed' | 'accepted'
  priority: 'high' | 'medium' | 'low'
  dataType: 'structured' | 'unstructured'
  fileName?: string
  fileSize?: string
  assignee?: string
}

interface PoolFile {
  id: string
  name: string
  size: string
  category: string
  dataType: 'structured' | 'unstructured'
  status: 'raw' | 'meta' | 'processed'
  uploadDate: string
  pushedToDPE: boolean
}

// Helper for bilingual description
const resolveDesc = (desc: string | ((isZh: boolean) => string), isZh: boolean): string =>
  typeof desc === 'function' ? desc(isZh) : desc

// ===== Standard Account Categories (from guide screenshot) =====
interface CategoryDef {
  key: string           // internal key
  zh: string            // Chinese display name
  en: string            // English display name
  iconZh: string
  iconEn: string
  color: string
  bg: string
  type: 'structured' | 'unstructured' | 'mixed'
}

const CATEGORIES: CategoryDef[] = [
  { key: 'financial',   zh: '财务报表',     en: 'Financial Statements',    iconZh: '📊', iconEn: '📊', color: '#4f46e5', bg: '#eef2ff', type: 'structured' },
  { key: 'bank',        zh: '银行文档',     en: 'Bank Documents',          iconZh: '🏦', iconEn: '🏦', color: '#2563eb', bg: '#eff6ff', type: 'unstructured' },
  { key: 'contract',    zh: '合同与协议',   en: 'Contracts & Agreements',  iconZh: '📝', iconEn: '📝', color: '#059669', bg: '#ecfdf5', type: 'unstructured' },
  { key: 'tax',         zh: '税务文件',     en: 'Tax Documents',           iconZh: '📋', iconEn: '📋', color: '#d97706', bg: '#fffbeb', type: 'mixed' },
  { key: 'payroll',     zh: '工资与人事',   en: 'Payroll & HR',            iconZh: '👥', iconEn: '👥', color: '#dc2626', bg: '#fef2f2', type: 'mixed' },
  { key: 'fixedasset',  zh: '固定资产',     en: 'Fixed Assets',            iconZh: '🏗️', iconEn: '🏗️', color: '#ea580c', bg: '#fff7ed', type: 'mixed' },
  { key: 'inventory',   zh: '存货',         en: 'Inventory',               iconZh: '📦', iconEn: '📦', color: '#0891b2', bg: '#ecfeff', type: 'structured' },
  { key: 'legal',       zh: '法律文档',     en: 'Legal Documents',         iconZh: '⚖️', iconEn: '⚖️', color: '#7c3aed', bg: '#f5f3ff', type: 'unstructured' },
  { key: 'internalctrl',zh: '内部控制',     en: 'Internal Control',        iconZh: '🛡️', iconEn: '🛡️', color: '#0d9488', bg: '#f0fdfa', type: 'structured' },
  { key: 'other',       zh: '其他',         en: 'Other',                   iconZh: '📄', iconEn: '📄', color: '#64748b', bg: '#f8fafc', type: 'mixed' },
]

const categoryMetaMap = Object.fromEntries(CATEGORIES.map(c => [c.key, c]))
const getCategoryLabel = (key: string, isZh: boolean) => {
  const cat = CATEGORIES.find(c => c.key === key)
  return cat ? (isZh ? cat.zh : cat.en) : key
}

// ===== Demo Data =====
const pbcItems: PBCItem[] = [
  // 财务报表 / Financial Statements
  { id: '1', category: 'financial', description: (isZh => isZh ? '2025年度审计财务报表（草案）' : '2025 Annual Audit Financial Statements (Draft)'), requestedBy: 'Zhang San', requestedDate: '2026-07-01', dueDate: '2026-07-10', status: 'accepted', priority: 'high', dataType: 'structured', fileName: 'FS_2025_Draft.xlsx', fileSize: '1.8MB', assignee: 'Li Si' },
  { id: '2', category: 'financial', description: (isZh => isZh ? 'Q1-Q4 2025 管理账目（月度）' : 'Q1-Q4 2025 Management Accounts (Monthly)'), requestedBy: 'Zhang San', requestedDate: '2026-07-01', dueDate: '2026-07-12', status: 'accepted', priority: 'high', dataType: 'structured', fileName: 'MA_Q1Q4_2025.xlsx', fileSize: '2.4MB', assignee: 'Wang Wu' },
  { id: '3', category: 'financial', description: (isZh => isZh ? '试算平衡表（Level 4 明细）' : 'Trial Balance (Level 4 Detail)'), requestedBy: 'Zhang San', requestedDate: '2026-07-02', dueDate: '2026-07-14', status: 'received', priority: 'medium', dataType: 'structured', fileName: 'TB_L4_202512.xlsx', fileSize: '98KB', assignee: 'Li Si' },
  { id: '4', category: 'financial', description: (isZh => isZh ? '总账导出（全年）' : 'General Ledger Extract (Full Year)'), requestedBy: 'Li Si', requestedDate: '2026-07-03', dueDate: '2026-07-16', status: 'reviewed', priority: 'medium', dataType: 'structured', fileName: 'GL_FY2025.xlsx', fileSize: '1.2MB', assignee: 'Sun Ba' },
  { id: '5', category: 'financial', description: (isZh => isZh ? '合并报表及抵销分录' : 'Consolidation Package and Eliminations'), requestedBy: 'Zhang San', requestedDate: '2026-07-04', dueDate: '2026-07-18', status: 'pending', priority: 'high', dataType: 'structured', assignee: '' },
  { id: '6', category: 'financial', description: (isZh => isZh ? '财务报表附注披露' : 'Notes to Financial Statements Disclosures'), requestedBy: 'Li Si', requestedDate: '2026-07-05', dueDate: '2026-07-20', status: 'pending', priority: 'medium', dataType: 'structured', assignee: '' },

  // 银行文档 / Bank Documents
  { id: '7', category: 'bank', description: (isZh => isZh ? '2025年12月31日银行对账单及调节表' : 'Dec 31, 2025 Bank Statements and Reconciliation'), requestedBy: 'Li Si', requestedDate: '2026-07-02', dueDate: '2026-07-12', status: 'received', priority: 'high', dataType: 'unstructured', fileName: 'BankStmt_202512.pdf', fileSize: '320KB', assignee: 'Wang Wu' },
  { id: '8', category: 'bank', description: (isZh => isZh ? '全部银行函证（年末余额）' : 'All Bank Confirmations (Year-end Balances)'), requestedBy: 'Li Si', requestedDate: '2026-07-03', dueDate: '2026-07-14', status: 'received', priority: 'high', dataType: 'unstructured', fileName: 'BankConf_2025.pdf', fileSize: '180KB', assignee: 'Zhao Liu' },
  { id: '9', category: 'bank', description: (isZh => isZh ? '贷款协议及授信函件' : 'Loan Agreements and Facility Letters'), requestedBy: 'Wang Wu', requestedDate: '2026-07-04', dueDate: '2026-07-16', status: 'reviewed', priority: 'medium', dataType: 'unstructured', fileName: 'LoanAgreements.pdf', fileSize: '920KB', assignee: 'Qian Qi' },
  { id: '10', category: 'bank', description: (isZh => isZh ? '大额银行间资金划转记录' : 'Interbank Fund Transfer Records (Large)'), requestedBy: 'Li Si', requestedDate: '2026-07-06', dueDate: '2026-07-20', status: 'pending', priority: 'low', dataType: 'unstructured', assignee: '' },

  // 税务文件 / Tax Documents
  { id: '11', category: 'tax', description: (isZh => isZh ? '2025年度企业所得税汇算清缴申报表' : '2025 Annual CIT Settlement and Declaration Form'), requestedBy: 'Wang Wu', requestedDate: '2026-07-03', dueDate: '2026-07-15', status: 'pending', priority: 'medium', dataType: 'structured', assignee: '' },
  { id: '12', category: 'tax', description: (isZh => isZh ? '增值税申报表（月度，全年）' : 'VAT Returns (Monthly, Full Year)'), requestedBy: 'Wang Wu', requestedDate: '2026-07-04', dueDate: '2026-07-17', status: 'received', priority: 'medium', dataType: 'structured', fileName: 'VAT_Monthly_2025.xlsx', fileSize: '450KB', assignee: 'Sun Ba' },
  { id: '13', category: 'tax', description: (isZh => isZh ? '转让定价同期资料' : 'Transfer Pricing Documentation'), requestedBy: 'Wang Wu', requestedDate: '2026-07-06', dueDate: '2026-07-21', status: 'pending', priority: 'high', dataType: 'unstructured', assignee: '' },
  { id: '14', category: 'tax', description: (isZh => isZh ? '税款缴纳凭证及收据' : 'Tax Payment Vouchers and Receipts'), requestedBy: 'Sun Ba', requestedDate: '2026-07-07', dueDate: '2026-07-22', status: 'reviewed', priority: 'low', dataType: 'unstructured', fileName: 'TaxVouchers_2025.pdf', fileSize: '210KB', assignee: 'Li Si' },

  // 合同与协议 / Contracts & Agreements
  { id: '15', category: 'contract', description: (isZh => isZh ? '重大销售合同清单及样本（金额>100万）' : 'Major Sales Contracts List and Samples (Amount > 1M)'), requestedBy: 'Zhao Liu', requestedDate: '2026-07-05', dueDate: '2026-07-18', status: 'pending', priority: 'high', dataType: 'unstructured', assignee: '' },
  { id: '16', category: 'contract', description: (isZh => isZh ? '采购协议及框架合同' : 'Purchase Agreements and Framework Contracts'), requestedBy: 'Zhao Liu', requestedDate: '2026-07-06', dueDate: '2026-07-19', status: 'received', priority: 'medium', dataType: 'unstructured', fileName: 'PurchaseAgreements.zip', fileSize: '3.2MB', assignee: 'Wang Wu' },
  { id: '17', category: 'contract', description: (isZh => isZh ? '租赁协议（房产及设备）' : 'Lease Agreements (Property and Equipment)'), requestedBy: 'Zhao Liu', requestedDate: '2026-07-07', dueDate: '2026-07-20', status: 'reviewed', priority: 'low', dataType: 'unstructured', fileName: 'Lease_Agreements.pdf', fileSize: '880KB', assignee: 'Li Si' },
  { id: '18', category: 'contract', description: (isZh => isZh ? '关联方交易协议' : 'Related Party Transaction Agreements'), requestedBy: 'Qian Qi', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'pending', priority: 'high', dataType: 'unstructured', assignee: '' },

  // 工资与人事 / Payroll & HR
  { id: '19', category: 'payroll', description: (isZh => isZh ? '2025年度工资薪金明细表' : '2025 Annual Payroll Detail Schedule'), requestedBy: 'Sun Ba', requestedDate: '2026-07-06', dueDate: '2026-07-18', status: 'received', priority: 'medium', dataType: 'structured', fileName: 'Payroll_2025.xlsx', fileSize: '520KB', assignee: 'Li Si' },
  { id: '20', category: 'payroll', description: (isZh => isZh ? '员工花名册及社保公积金缴纳记录' : 'Employee Roster & Social Insurance Records'), requestedBy: 'Sun Ba', requestedDate: '2026-07-07', dueDate: '2026-07-19', status: 'pending', priority: 'medium', dataType: 'structured', assignee: '' },

  // 固定资产 / Fixed Assets
  { id: '21', category: 'fixedasset', description: (isZh => isZh ? '固定资产清单及折旧计算表' : 'Fixed Assets Register & Depreciation Schedule'), requestedBy: 'Qian Qi', requestedDate: '2026-07-07', dueDate: '2026-07-19', status: 'received', priority: 'medium', dataType: 'structured', fileName: 'FA_Register_2025.xlsx', fileSize: '340KB', assignee: 'Sun Ba' },
  { id: '22', category: 'fixedasset', description: (isZh => isZh ? '本年度新增/处置资产清单' : 'Additions/Disposals Schedule (Current Year)'), requestedBy: 'Qian Qi', requestedDate: '2026-07-08', dueDate: '2026-07-21', status: 'pending', priority: 'low', dataType: 'structured', assignee: '' },

  // 存货 / Inventory
  { id: '23', category: 'inventory', description: (isZh => isZh ? '期末存货盘点表及差异分析' : 'Year-end Inventory Count Sheet & Variance Analysis'), requestedBy: 'Sun Ba', requestedDate: '2026-07-08', dueDate: '2026-07-20', status: 'pending', priority: 'medium', dataType: 'structured', assignee: '' },
  { id: '24', category: 'inventory', description: (isZh => isZh ? '存货跌价准备计提表' : 'Inventory Write-down Provision Schedule'), requestedBy: 'Sun Ba', requestedDate: '2026-07-09', dueDate: '2026-07-23', status: 'reviewed', priority: 'low', dataType: 'structured', fileName: 'Inv_Provision.xlsx', fileSize: '150KB', assignee: 'Li Si' },

  // 法律文档 / Legal Documents
  { id: '25', category: 'legal', description: (isZh => isZh ? '未决诉讼及或有事项声明' : 'Pending Litigation and Contingencies Statement'), requestedBy: 'Qian Qi', requestedDate: '2026-07-06', dueDate: '2026-07-20', status: 'reviewed', priority: 'medium', dataType: 'unstructured', assignee: '' },
  { id: '26', category: 'legal', description: (isZh => isZh ? '公司章程及营业执照' : 'Certificate of Incorporation and Bylaws'), requestedBy: 'Qian Qi', requestedDate: '2026-07-07', dueDate: '2026-07-21', status: 'accepted', priority: 'low', dataType: 'unstructured', fileName: 'COI_Bylaws.pdf', fileSize: '340KB', assignee: 'Sun Ba' },
  { id: '27', category: 'legal', description: (isZh => isZh ? '董事会决议及会议纪要（FY2025）' : 'Board Resolutions and Minutes (FY2025)'), requestedBy: 'Qian Qi', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'received', priority: 'medium', dataType: 'unstructured', fileName: 'BoardMinutes_2025.pdf', fileSize: '520KB', assignee: 'Li Si' },

  // 内部控制 / Internal Control
  { id: '28', category: 'internalctrl', description: (isZh => isZh ? '2025年度内部控制自评报告' : '2025 Annual Internal Control Self-Assessment Report'), requestedBy: 'Sun Ba', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'pending', priority: 'low', dataType: 'structured', assignee: '' },
  { id: '29', category: 'internalctrl', description: (isZh => isZh ? 'IT一般控制文档' : 'IT General Controls Documentation'), requestedBy: 'Sun Ba', requestedDate: '2026-07-09', dueDate: '2026-07-23', status: 'received', priority: 'medium', dataType: 'structured', fileName: 'ITGC_Doc_2025.xlsx', fileSize: '760KB', assignee: 'Wang Wu' },
  { id: '30', category: 'internalctrl', description: (isZh => isZh ? '职责分离矩阵' : 'Segregation of Duties Matrix'), requestedBy: 'Sun Ba', requestedDate: '2026-07-10', dueDate: '2026-07-24', status: 'reviewed', priority: 'low', dataType: 'structured', fileName: 'SOD_Matrix.xlsx', fileSize: '120KB', assignee: 'Li Si' },
]

// File Pool demo data
const poolFiles: PoolFile[] = [
  { id: 'pf-1', name: 'FS_2025_Draft.xlsx', size: '1.8MB', category: 'financial', dataType: 'structured', status: 'raw', uploadDate: '2026-07-10', pushedToDPE: true },
  { id: 'pf-2', name: 'MA_Q1Q4_2025.xlsx', size: '2.4MB', category: 'financial', dataType: 'structured', status: 'raw', uploadDate: '2026-07-12', pushedToDPE: true },
  { id: 'pf-3', name: 'GL_FY2025.xlsx', size: '1.2MB', category: 'financial', dataType: 'structured', status: 'processed', uploadDate: '2026-07-16', pushedToDPE: true },
  { id: 'pf-4', name: 'TB_L4_202512.xlsx', size: '98KB', category: 'financial', dataType: 'structured', status: 'processed', uploadDate: '2026-07-14', pushedToDPE: false },
  { id: 'pf-5', name: 'BankStmt_202512.pdf', size: '320KB', category: 'bank', dataType: 'unstructured', status: 'raw', uploadDate: '2026-07-12', pushedToDPE: true },
  { id: 'pf-6', name: 'BankConf_2025.pdf', size: '180KB', category: 'bank', dataType: 'unstructured', status: 'raw', uploadDate: '2026-07-14', pushedToDPE: true },
  { id: 'pf-7', name: 'VAT_Monthly_2025.xlsx', size: '450KB', category: 'tax', dataType: 'structured', status: 'raw', uploadDate: '2026-07-17', pushedToDPE: false },
  { id: 'pf-8', name: 'PurchaseAgreements.zip', size: '3.2MB', category: 'contract', dataType: 'unstructured', status: 'raw', uploadDate: '2026-07-19', pushedToDPE: false },
  { id: 'pf-9', name: 'Lease_Agreements.pdf', size: '880KB', category: 'contract', dataType: 'unstructured', status: 'meta', uploadDate: '2026-07-20', pushedToDPE: false },
  { id: 'pf-10', name: 'Payroll_2025.xlsx', size: '520KB', category: 'payroll', dataType: 'structured', status: 'raw', uploadDate: '2026-07-18', pushedToDPE: false },
  { id: 'pf-11', name: 'FA_Register_2025.xlsx', size: '340KB', category: 'fixedasset', dataType: 'structured', status: 'raw', uploadDate: '2026-07-19', pushedToDPE: false },
  { id: 'pf-12', name: 'COI_Bylaws.pdf', size: '340KB', category: 'legal', dataType: 'unstructured', status: 'raw', uploadDate: '2026-07-21', pushedToDPE: false },
  { id: 'pf-13', name: 'ITGC_Doc_2025.xlsx', size: '760KB', category: 'internalctrl', dataType: 'structured', status: 'raw', uploadDate: '2026-07-23', pushedToDPE: false },
]

// Team members for assignment dropdown
const TEAM_MEMBERS = ['Zhang San', 'Li Si', 'Wang Wu', 'Zhao Liu', 'Qian Qi', 'Sun Ba']

// ===== Component =====
function PBCManager() {
  const { lang } = useLanguage()
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'pool'>('cards')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Filter states (from screenshot guide)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterSearch, setFilterSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Batch edit state
  const [showBatchEdit, setShowBatchEdit] = useState(false)
  const [batchAssignee, setBatchAssignee] = useState('')
  const [batchDueDate, setBatchDueDate] = useState('')
  const [batchPriority, setBatchPriority] = useState('')

  // Pool filter
  const [poolFilter, setPoolFilter] = useState<'all' | 'structured' | 'unstructured'>('all')

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isZh = lang === 'zh'
  const t = (zh: string, en: string) => (isZh ? zh : en)

  // --- Status config ---
  const sc = (key: string) => {
    const map: Record<string, Record<string, { label: string; color: string; bg: string }>> = {
      pending:   { zh: { label: '待处理', color: '#D69E2E', bg: '#FFFBEB' }, en: { label: 'Pending', color: '#D69E2E', bg: '#FFFBEB' } },
      received:  { zh: { label: '已接收', color: '#3182CE', bg: '#EBF4FF' }, en: { label: 'Received', color: '#3182CE', bg: '#EBF4FF' } },
      reviewed:  { zh: { label: '已审核', color: '#805AD5', bg: '#FAF5FF' }, en: { label: 'Reviewed', color: '#805AD5', bg: '#FAF5FF' } },
      accepted:  { zh: { label: '已接受', color: '#00A3A1', bg: '#E6FFFA' }, en: { label: 'Accepted', color: '#00A3A1', bg: '#E6FFFA' } },
    }
    return map[key]?.[lang] || map.pending[lang]
  }

  const poolStatusLabel = (s: string) => {
    const m: Record<string, Record<string, string>> = {
      raw:       { zh: '原始数据', en: 'Raw' },
      meta:      { zh: '元数据', en: 'Meta' },
      processed: { zh: '已处理', en: 'Processed' },
    }
    return m[s]?.[lang] || s
  }

  // --- Computed filtered data ---
  const filteredItems = useMemo(() => {
    let items = pbcItems
    if (filterStatus !== 'all') items = items.filter(i => i.status === filterStatus)
    if (filterCategory !== 'all') items = items.filter(i => i.category === filterCategory)
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase()
      items = items.filter(i =>
        resolveDesc(i.description, isZh).toLowerCase().includes(q) ||
        getCategoryLabel(i.category, isZh).toLowerCase().includes(q) ||
        i.requestedBy.toLowerCase().includes(q)
      )
    }
    return items
  }, [filterStatus, filterCategory, filterSearch, isZh])

  // Stats
  const stats = {
    total: pbcItems.length,
    pending: pbcItems.filter(i => i.status === 'pending').length,
    received: pbcItems.filter(i => i.status === 'received').length,
    reviewed: pbcItems.filter(i => i.status === 'reviewed').length,
    accepted: pbcItems.filter(i => i.status === 'accepted').length,
    structured: pbcItems.filter(i => i.dataType === 'structured').length,
    unstructured: pbcItems.filter(i => i.dataType === 'unstructured').length,
    inPool: poolFiles.length,
    pushedToDPE: poolFiles.filter(f => f.pushedToDPE).length,
  }

  // Chart data
  const chartData = {
    completionRate: Math.round((stats.accepted / stats.total) * 100),
    byStatus: {
      pending: stats.pending,
      received: stats.received,
      reviewed: stats.reviewed,
      accepted: stats.accepted,
    },
    byCategory: CATEGORIES.map(c => ({
      key: c.key,
      label: isZh ? c.zh : c.en,
      count: pbcItems.filter(i => i.category === c.key).length,
      color: c.color,
    })).filter(c => c.count > 0),
  }

  // Grouped for card view
  const grouped: Record<string, PBCItem[]> = {}
  filteredItems.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })

  // Pool filtered
  const filteredPool = poolFilter === 'all'
    ? poolFiles
    : poolFiles.filter(f => f.dataType === poolFilter)

  // --- Handlers ---
  const handleCardClick = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)))
    }
  }

  const clearFilters = () => {
    setFilterStatus('all')
    setFilterCategory('all')
    setFilterSearch('')
    setSelectedIds(new Set())
  }

  const applyBatchEdit = () => {
    // In real app this would call API
    alert(t(`批量更新 ${selectedIds.size} 条PBC：负责人=${batchAssignee}, 截止=${batchDueDate}, 优先级=${batchPriority}`,
             `Bulk update ${selectedIds.size} PBCs: Assignee=${batchAssignee}, Due=${batchDueDate}, Priority=${batchPriority}`))
    setSelectedIds(new Set())
    setShowBatchEdit(false)
    setBatchAssignee('')
    setBatchDueDate('')
    setBatchPriority('')
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpandedCategory(null) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // ======================== RENDER ========================
  return (
    <div className="pbc-manager animate-fade-in">
      {/* ===== Header ===== */}
      <div className="pbc-header-row">
        <div>
          <h1 className="pbc-title">{t('PBC 管理清单', 'PBC Management List')}</h1>
          <span className="pbc-subtitle">{t('客户文件采集 · 分类 · 处理与推送中心', 'Client document collection · categorization · processing & push center')}</span>
        </div>
        <div className="pbc-header-actions">
          <div className="pbc-view-toggle">
            <button className={`pvt-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              {t('分类视图', 'Cards')}
            </button>
            <button className={`pvt-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              {t('列表视图', 'List')}
            </button>
            <button className={`pvt-btn ${viewMode === 'pool' ? 'active' : ''}`} onClick={() => setViewMode('pool')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              File Pool
            </button>
          </div>
          <button className="pbc-new-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t('新建请求', 'New Request')}
          </button>
        </div>
      </div>

      {/* ===== Overview Statistics Charts (moved to top) ===== */}
      <div className="pbc-charts-section">
        <h3 className="pch-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="2"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>
          {t('概览统计', 'Overview Statistics')}
        </h3>
        <div className="pch-grid">
          {/* Pie chart: completion rate */}
          <div className="pch-card pch-pie">
            <h4>{t('完成率', 'Completion Rate')}</h4>
            <div className="pie-chart-viz">
              <svg viewBox="0 0 100 100" className="pie-svg">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="12"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#059669" strokeWidth="12"
                  strokeDasharray={(chartData.completionRate * 2.64) + ' 264'}
                  strokeDashoffset="66" strokeLinecap="round"
                  transform="rotate(-90 50 50)" />
              </svg>
              <div className="pie-center">
                <span className="pie-percent">{chartData.completionRate}%</span>
                <span className="pie-label">{t('已完成', 'Done')}</span>
              </div>
            </div>
            <div className="pie-legend">
              <div className="pleg-item"><span className="pleg-dot" style={{background:'#059669'}}></span>{t('已接受', 'Accepted')} ({stats.accepted})</div>
              <div className="pleg-item"><span className="pleg-dot" style={{background:'#e2e8f0'}}></span>{t('进行中', 'In Progress')} ({stats.total - stats.accepted})</div>
            </div>
          </div>

          {/* Status distribution cards */}
          <div className="pch-card pch-status-cards">
            <h4>{t('状态分布', 'Status Distribution')}</h4>
            <div className="psc-grid">
              <div className="psc-item psc-pending">
                <span className="psc-num">{chartData.byStatus.pending}</span>
                <span className="psc-lbl">{sc('pending').label}</span>
                <div className="psc-bar"><div className="psc-bar-fill" style={{width: ((chartData.byStatus.pending/stats.total)*100) + '%'}}></div></div>
              </div>
              <div className="psc-item psc-received">
                <span className="psc-num">{chartData.byStatus.received}</span>
                <span className="psc-lbl">{sc('received').label}</span>
                <div className="psc-bar"><div className="psc-bar-fill" style={{width: ((chartData.byStatus.received/stats.total)*100) + '%'}}></div></div>
              </div>
              <div className="psc-item psc-reviewed">
                <span className="psc-num">{chartData.byStatus.reviewed}</span>
                <span className="psc-lbl">{sc('reviewed').label}</span>
                <div className="psc-bar"><div className="psc-bar-fill" style={{width: ((chartData.byStatus.reviewed/stats.total)*100) + '%'}}></div></div>
              </div>
              <div className="psc-item psc-accepted">
                <span className="psc-num">{chartData.byStatus.accepted}</span>
                <span className="psc-lbl">{sc('accepted').label}</span>
                <div className="psc-bar"><div className="psc-bar-fill" style={{width: ((chartData.byStatus.accepted/stats.total)*100) + '%'}}></div></div>
              </div>
            </div>
          </div>

          {/* Category distribution */}
          <div className="pch-card pch-categories">
            <h4>{t('类别分布', 'Category Distribution')}</h4>
            <div className="pcat-list">
              {chartData.byCategory.map(cat => (
                <div key={cat.key} className="pcat-row">
                  <span className="pcat-dot" style={{background: cat.color}}></span>
                  <span className="pcat-name">{cat.label}</span>
                  <span className="pcat-count">{cat.count}</span>
                  <div className="pcat-bar-track">
                    <div className="pcat-bar-fill" style={{width: ((cat.count/stats.total)*100) + '%', background: cat.color}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== FILTER SECTION (from guide screenshot) ===== */}
        <div className="pbc-filter-section">
        <div className="pfs-row">
          {/* Status filter */}
          <div className="pfs-group">
            <label>{t('状态筛选', 'Status')}</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">{t('全部状态', 'All Statuses')}</option>
              <option value="pending">{sc('pending').label}</option>
              <option value="received">{sc('received').label}</option>
              <option value="reviewed">{sc('reviewed').label}</option>
              <option value="accepted">{sc('accepted').label}</option>
            </select>
          </div>
          {/* Category filter */}
          <div className="pfs-group">
            <label>{t('类别筛选', 'Category')}</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">{t('全部类别', 'All Categories')}</option>
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{isZh ? c.zh : c.en}</option>
              ))}
            </select>
          </div>
          {/* Search */}
          <div className="pfs-group pfs-search">
            <label>{t('搜索', 'Search')}</label>
            <input type="text" value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
              placeholder={t('搜索描述、类别或负责人...', 'Search description, category or assignee...')} />
          </div>
          {/* Clear button */}
          <button className="pfs-clear-btn" onClick={clearFilters}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>
            {t('清除筛选条件', 'Clear Filters')}
          </button>
        </div>
        <div className="pfs-result-hint">
          {t(`筛选结果：${filteredItems.length} 条 PBC`, `Filtered: ${filteredItems.length} PBC items`)}
          {(filterStatus !== 'all' || filterCategory !== 'all' || filterSearch.trim()) && (
            <span className="pfs-active-tags">
              {filterStatus !== 'all' && <span className="pfs-tag">{sc(filterStatus).label}<button onClick={() => setFilterStatus('all')}>×</button></span>}
              {filterCategory !== 'all' && <span className="pfs-tag">{getCategoryLabel(filterCategory, isZh)}<button onClick={() => setFilterCategory('all')}>×</button></span>}
              {filterSearch.trim() && <span className="pfs-tag">"{filterSearch}"<button onClick={() => setFilterSearch('')}>×</button></span>}
            </span>
          )}
        </div>
      </div>

      {/* ===== EXPORT & BULK OPS SECTION (from guide screenshot) ===== */}
      <div className="pbc-action-bar">
        <div className="pab-left">
          {/* Export buttons */}
          <button className="pab-btn pab-export" title={t('导出PBC列表为Excel', 'Export PBC list as Excel')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {t('导出PBC列表', 'Export PBC List')}
          </button>
          <button className="pab-btn pab-export" title={t('导出文件清单', 'Export file manifest')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {t('导出文件清单', 'Export Files')}
          </button>
        </div>
        <div className="pab-right">
          {/* Bulk operations */}
          <button className={`pab-btn pab-bulk ${selectedIds.size > 0 ? 'has-selection' : ''}`}
            disabled={selectedIds.size === 0}
            onClick={() => setShowBatchEdit(!showBatchEdit)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {t('批量下载', 'Batch Download')}
            {selectedIds.size > 0 && <span className="pab-badge">{selectedIds.size}</span>}
          </button>
          <button className={`pab-btn pab-bulk ${selectedIds.size > 0 ? 'has-selection' : ''}`}
            disabled={selectedIds.size === 0}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {t('批量更新状态', 'Batch Update Status')}
            {selectedIds.size > 0 && <span className="pab-badge">{selectedIds.size}</span>}
          </button>
        </div>
      </div>

      {/* ===== BATCH EDIT PANEL (collapsible) ===== */}
      {showBatchEdit && selectedIds.size > 0 && (
        <div className="pbc-batch-edit-panel animate-fade-in">
          <div className="pbep-header">
            <strong>{t('PBC编辑配置 — 批量修改所选条目', 'PBC Edit Config — Bulk edit selected items')}</strong>
            <span>{t(`已选 ${selectedIds.size} 条`, `${selectedIds.size} selected`)}</span>
          </div>
          <div className="pbep-fields">
            <div className="pbep-field">
              <label>{t('分配负责人', 'Assign To')}</label>
              <select value={batchAssignee} onChange={e => setBatchAssignee(e.target.value)}>
                <option value="">-- {t('不更改', 'No change')} --</option>
                {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="pbep-field">
              <label>{t('截止日期', 'Due Date')}</label>
              <input type="date" value={batchDueDate} onChange={e => setBatchDueDate(e.target.value)} />
            </div>
            <div className="pbep-field">
              <label>{t('优先级', 'Priority')}</label>
              <select value={batchPriority} onChange={e => setBatchPriority(e.target.value)}>
                <option value="">-- {t('不更改', 'No change')} --</option>
                <option value="high">{t('高', 'High')}</option>
                <option value="medium">{t('中', 'Medium')}</option>
                <option value="low">{t('低', 'Low')}</option>
              </select>
            </div>
            <div className="pbep-actions">
              <button className="pbep-apply" onClick={applyBatchEdit}>{t('应用更改', 'Apply Changes')}</button>
              <button className="pbep-cancel" onClick={() => setShowBatchEdit(false)}>{t('取消', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIEW: Category Cards ===== */}
      {viewMode === 'cards' && (
        <div className={`pbc-cards-grid ${expandedCategory ? 'grid-dimmed' : ''}`}>
          {Object.entries(grouped).map(([catKey, items]) => {
            const meta = categoryMetaMap[catKey] || { iconZh: '📄', iconEn: '📄', color: '#64748b', bg: '#f8fafc', type: 'mixed' as const, zh: catKey, en: catKey }
            const isExpanded = expandedCategory === catKey
            const pushableCount = items.filter(i => i.fileName && (i.status === 'received' || i.status === 'reviewed' || i.status === 'accepted')).length

            return (
              <div key={catKey} ref={el => { cardRefs.current[catKey] = el }}
                className={`pbc-category-card ${isExpanded ? 'card-expanded' : 'card-lift'}`}
                style={{ borderTop: `3px solid ${meta.color}` }}
                onClick={() => handleCardClick(catKey)}
              >
                <div className="pbc-card-header" style={{ background: meta.bg }}>
                  <div className="pbc-card-icon" style={{ background: meta.color }}>{isZh ? meta.iconZh : meta.iconEn}</div>
                  <div className="pbc-card-title-wrap">
                    <h3 className="pbc-card-title">{isZh ? meta.zh : meta.en}</h3>
                    <div className="pbc-card-tags">
                      <span className="pbc-data-type-badge" style={{
                        background: meta.type === 'structured' ? '#eef2ff' : meta.type === 'unstructured' ? '#f3effb' : '#fffbeb',
                        color: meta.type === 'structured' ? '#4f46e5' : meta.type === 'unstructured' ? '#805AD5' : '#d97706',
                      }}>
                        {meta.type === 'structured' ? t('结构化', 'Structured') : meta.type === 'unstructured' ? t('非结构化', 'Unstructured') : t('混合', 'Mixed')}
                      </span>
                      <span className="pbc-card-count">{items.length} {t('项', 'items')}</span>
                    </div>
                  </div>
                  {pushableCount > 0 && (
                    <button className="pbc-push-btn" onClick={e => e.stopPropagation()} title={t('推送到 DPE', 'Push to DPE')}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                      DPE
                    </button>
                  )}
                  <div className="pbc-card-expand-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
                <div className="pbc-card-list">
                  {items.slice(0, isExpanded ? undefined : 3).map(item => (
                    <div key={item.id} className={`pbc-card-item priority-${item.priority}`}>
                      <div className="pbc-card-item-top">
                        <p className="pbc-card-desc">{resolveDesc(item.description, isZh)}</p>
                        <span className="pbc-status" style={{ background: sc(item.status).bg, color: sc(item.status).color }}>
                          {sc(item.status).label}
                        </span>
                      </div>
                      <div className="pbc-card-item-bottom">
                        <div className="pbc-card-dates">
                          <span>{t('截止:', 'Due:')} {item.dueDate}</span>
                          <span>{item.assignee || item.requestedBy}</span>
                          {item.fileName && <span className="pbc-file-tag">📎 {item.fileName}</span>}
                        </div>
                        <div className="pbc-card-priority">
                          <span className={`priority-dot priority-${item.priority}`}></span>{item.priority}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!isExpanded && items.length > 3 && (
                    <div className="pbc-more-items">+{items.length - 3} {t('更多', 'more')}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== VIEW: List View with Category Tree (from guide screenshot) ===== */}
      {viewMode === 'list' && (
        <div className="pbc-list-view animate-fade-in">
          <div className="plv-layout">
            {/* Left sidebar: category tree */}
            <aside className="plv-sidebar">
              <h4 className="plv-sidebar-title">{t('按会计科目/类别筛选', 'Filter by Account Category')}</h4>
              <ul className="plv-tree">
                <li className={`plt-item ${filterCategory === 'all' ? 'active' : ''}`} onClick={() => setFilterCategory('all')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                  <span>{t('全部分类', 'All Categories')}</span>
                  <span className="plt-count">{pbcItems.length}</span>
                </li>
                {CATEGORIES.map(cat => {
                  const count = pbcItems.filter(i => i.category === cat.key).length
                  if (count === 0) return null
                  return (
                    <li key={cat.key} className={`plt-item ${filterCategory === cat.key ? 'active' : ''}`}
                      onClick={() => setFilterCategory(cat.key)}>
                      <span className="plt-dot" style={{ background: cat.color }}></span>
                      <span>{isZh ? cat.zh : cat.en}</span>
                      <span className="plt-count">{count}</span>
                    </li>
                  )
                })}
              </ul>
            </aside>

            {/* Right: table list */}
            <main className="plv-main">
              <div className="plv-table-header">
                <label className="plv-select-all">
                  <input type="checkbox" checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
                    onChange={toggleSelectAll} />
                  <span>{t('全选', 'Select All')}</span>
                </label>
                <span className="plv-table-info">
                  {t(`${filteredItems.length} 条结果`, `${filteredItems.length} results`)}
                </span>
              </div>
              <table className="plv-table">
                <thead>
                  <tr>
                    <th style={{width:'36px'}}></th>
                    <th>{t('ID', 'ID')}</th>
                    <th>{t('描述', 'Description')}</th>
                    <th>{t('类别', 'Category')}</th>
                    <th>{t('负责人', 'Assignee')}</th>
                    <th>{t('截止日期', 'Due Date')}</th>
                    <th>{t('状态', 'Status')}</th>
                    <th>{t('优先级', 'Priority')}</th>
                    <th>{t('数据类型', 'Data Type')}</th>
                    <th>{t('文件', 'File')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const meta = categoryMetaMap[item.category]
                    const isSelected = selectedIds.has(item.id)
                    return (
                      <tr key={item.id} className={`${isSelected ? 'row-selected' : ''} priority-${item.priority}`}
                        onClick={() => toggleSelect(item.id)}>
                        <td><input type="checkbox" checked={isSelected} readOnly /></td>
                        <td className="plv-id">{item.id}</td>
                        <td className="plv-desc">{resolveDesc(item.description, isZh)}</td>
                        <td>
                          <span className="plv-cat-badge" style={{
                            background: meta?.bg || '#f1f5f9',
                            color: meta?.color || '#64748b',
                          }}>{getCategoryLabel(item.category, isZh)}</span>
                        </td>
                        <td>{item.assignee || item.requestedBy}</td>
                        <td>{item.dueDate}</td>
                        <td>
                          <span className="pbc-status" style={{ background: sc(item.status).bg, color: sc(item.status).color }}>
                            {sc(item.status).label}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-dot priority-${item.priority}`}></span>
                          {item.priority}
                        </td>
                        <td>
                          <span className={`plv-dtype ${item.dataType}`}>
                            {item.dataType === 'structured' ? t('结构化', 'Str') : t('非结构化', 'Unstr')}
                          </span>
                        </td>
                        <td>{item.fileName ? <span className="plv-file-tag">📎 {item.fileName}</span> : '-'}</td>
                      </tr>
                    )
                  })}
                  {filteredItems.length === 0 && (
                    <tr><td colSpan={10} className="plv-empty">{t('无匹配的PBC条目', 'No matching PBC items')}</td></tr>
                  )}
                </tbody>
              </table>
            </main>
          </div>
        </div>
      )}

      {/* ===== VIEW: File Pool ===== */}
      {viewMode === 'pool' && (
        <div className="pbc-pool-view animate-fade-in">
          <div className="pp-header">
            <div className="pp-title-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              <strong>File Pool (S3)</strong>
              <span className="pp-count">{filteredPool.length} {t('个文件', 'files')}</span>
            </div>
            <div className="pp-filters">
              <button className={`ppf-btn ${poolFilter === 'all' ? 'active' : ''}`} onClick={() => setPoolFilter('all')}>{t('全部', 'All')}</button>
              <button className={`ppf-btn ${poolFilter === 'structured' ? 'active' : ''}`} onClick={() => setPoolFilter('structured')}>
                <span className="ppf-dot str"></span>{t('结构化', 'Structured')}
              </button>
              <button className={`ppf-btn ${poolFilter === 'unstructured' ? 'active' : ''}`} onClick={() => setPoolFilter('unstructured')}>
                <span className="ppf-dot unstr"></span>{t('非结构化', 'Unstructured')}
              </button>
            </div>
          </div>
          <div className="pp-buckets">
            <div className="pp-bucket pp-bucket-kcc"><div className="ppb-label">KCC Bucket</div><div className="ppb-count">{poolFiles.filter(f => f.category === 'financial' || f.category === 'internalctrl').length}</div></div>
            <div className="pp-bucket pp-bucket-oak"><div className="ppb-label">OAK Bucket</div><div className="ppb-count">{poolFiles.filter(f => f.category === 'tax').length}</div></div>
            <div className="pp-bucket pp-bucket-aap"><div className="ppb-label">AAP Bucket</div><div className="ppb-count">{poolFiles.filter(f => f.category === 'bank' || f.category === 'contract' || f.category === 'legal' || f.category === 'payroll' || f.category === 'fixedasset' || f.category === 'inventory').length}</div></div>
            <div className="pp-bucket pp-bucket-dpe"><div className="ppb-label">DPE Bucket</div><div className="ppb-count">{poolFiles.filter(f => f.pushedToDPE).length}</div></div>
          </div>
          <div className="pp-table-wrap">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>{t('文件名', 'Filename')}</th>
                  <th>{t('类别', 'Category')}</th>
                  <th>{t('数据类型', 'Data Type')}</th>
                  <th>{t('状态', 'Status')}</th>
                  <th>{t('大小', 'Size')}</th>
                  <th>{t('上传时间', 'Upload Date')}</th>
                  <th>DPE</th>
                </tr>
              </thead>
              <tbody>
                {filteredPool.map(f => (
                  <tr key={f.id}>
                    <td className="pp-filename">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {f.name}
                    </td>
                    <td><span className="pp-cat-tag">{getCategoryLabel(f.category, isZh)}</span></td>
                    <td>
                      <span className={`pp-dtype ${f.dataType}`}>
                        {f.dataType === 'structured' ? t('结构化', 'Structured') : t('非结构化', 'Unstructured')}
                      </span>
                    </td>
                    <td><span className={`pp-status ${f.status}`}>{poolStatusLabel(f.status)}</span></td>
                    <td>{f.size}</td>
                    <td className="pp-date">{f.uploadDate}</td>
                    <td>
                      {f.pushedToDPE
                        ? <span className="pp-push-done">✓</span>
                        : <button className="pp-push-mini" title={t('推送到 DPE', 'Push to DPE')}>→</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expanded overlay (cards view) */}
      {expandedCategory && viewMode === 'cards' && (
        <>
          <div className="pbc-overlay-backdrop" onClick={() => setExpandedCategory(null)} />
          <div className="pbc-expanded-card-wrapper">
            {(() => {
              const items = grouped[expandedCategory] || []
              const meta = categoryMetaMap[expandedCategory] || { iconZh: '📄', iconEn: '📄', color: '#64748b', bg: '#f8fafc', type: 'mixed' as const, zh: expandedCategory, en: expandedCategory }
              return (
                <div className="pbc-category-card pbc-expanded-card" style={{ borderTop: `3px solid ${meta.color}` }} onClick={e => e.stopPropagation()}>
                  <div className="pbc-card-header" style={{ background: meta.bg }}>
                    <div className="pbc-card-icon" style={{ background: meta.color }}>{isZh ? meta.iconZh : meta.iconEn}</div>
                    <div className="pbc-card-title-wrap">
                      <h3 className="pbc-card-title">{isZh ? (meta.zh || expandedCategory) : (meta.en || expandedCategory)}</h3>
                      <span className="pbc-card-count">{items.length} {t('项', 'items')}</span>
                    </div>
                    <button className="pbc-card-close" onClick={() => setExpandedCategory(null)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div className="pbc-card-list">
                    {items.map(item => (
                      <div key={item.id} className={`pbc-card-item priority-${item.priority}`}>
                        <div className="pbc-card-item-top">
                          <p className="pbc-card-desc">{resolveDesc(item.description, isZh)}</p>
                          <span className="pbc-status" style={{ background: sc(item.status).bg, color: sc(item.status).color }}>{sc(item.status).label}</span>
                        </div>
                        <div className="pbc-card-item-bottom">
                          <div className="pbc-card-dates">
                            <span>{t('截止:', 'Due:')} {item.dueDate}</span>
                            <span>{item.assignee || item.requestedBy}</span>
                            {item.fileName && <span className="pbc-file-tag">📎 {item.fileName}</span>}
                          </div>
                          <div className="pbc-card-priority">
                            <span className={`priority-dot priority-${item.priority}`}></span>{item.priority}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}

export default PBCManager
