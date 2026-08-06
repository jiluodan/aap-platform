import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './AuditProcedures.css'

// ===== Types =====
interface ProcedureItem {
  id: string
  code: string
  name: string
  description: string
  status: 'not-started' | 'in-progress' | 'completed' | 'reviewed'
  risk: 'high' | 'medium' | 'low'
  workpapers: number
  assignedTo: string
}

interface ProcedureType {
  id: string
  key: string
  label: string
  icon: React.ReactNode
  color: string
  bg: string
  items: ProcedureItem[]
}

// ===== Demo Data - 12 Procedure Types (from image) =====
const procedureTypesData: ProcedureType[] = [
  {
    id: 'fsr', key: 'fsr', label: 'Financial Statements Reconciliation and/or Formatting',
    color: '#00338D', bg: '#e8edf5',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
    items: [
      { id: 'fsr-1', code: 'FSR-001', name: 'Balance Sheet Reconciliation', description: '资产负债表项目核对与格式化', status: 'completed', risk: 'medium', workpapers: 3, assignedTo: '张三' },
      { id: 'fsr-2', code: 'FSR-002', name: 'Income Statement Formatting', description: '利润表格式调整与数据核对', status: 'in-progress', risk: 'low', workpapers: 2, assignedTo: '李四' },
      { id: 'fsr-3', code: 'FSR-003', name: 'Cash Flow Reconciliation', description: '现金流量表勾稽关系验证', status: 'not-started', risk: 'medium', workpapers: 0, assignedTo: '王五' },
    ]
  },
  {
    id: 'kdc-cash', key: 'kdc-cash', label: 'KDC Service on Cash at Bank Work Paper',
    color: '#0091DA', bg: '#e5f4ff',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    items: [
      { id: 'kdc-1', code: 'KDC-C001', name: 'Bank Balance Verification', description: '银行存款余额调节表编制', status: 'in-progress', risk: 'high', workpapers: 2, assignedTo: '赵六' },
      { id: 'kdc-2', code: 'KDC-C002', name: 'Cash Count Workpaper', description: '现金盘点工作底稿', status: 'completed', risk: 'low', workpapers: 1, assignedTo: '钱七' },
    ]
  },
  {
    id: 'kdc-confirm', key: 'kdc-confirm', label: 'KDC Service on Audit Confirmations',
    color: '#00A3A1', bg: '#e6fffa',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    items: [
      { id: 'kdc-f1', code: 'KDC-F001', name: 'Bank Confirmation Follow-up', description: '银行函证跟进与回函核对', status: 'in-progress', risk: 'high', workpapers: 3, assignedTo: '孙八' },
      { id: 'kdc-f2', code: 'KDC-F002', name: 'AR Confirmation Service', description: '应收账款函证服务', status: 'not-started', risk: 'medium', workpapers: 0, assignedTo: '周九' },
      { id: 'kdc-f3', code: 'KDC-F003', name: 'Legal Confirmation', description: '法律事务函证服务', status: 'not-started', risk: 'low', workpapers: 0, assignedTo: '吴十' },
    ]
  },
  {
    id: 'credit-review', key: 'credit-review', label: 'Credit Review',
    color: '#805AD5', bg: '#faf5ff',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    items: [
      { id: 'cr-1', code: 'CR-001', name: 'AR Aging Analysis Review', description: '应收账款账龄分析审查', status: 'in-progress', risk: 'high', workpapers: 2, assignedTo: '郑十一' },
      { id: 'cr-2', code: 'CR-002', name: 'Bad Debt Provision Assessment', description: '坏账准备计提评估', status: 'not-started', risk: 'high', workpapers: 0, assignedTo: '张三' },
    ]
  },
  {
    id: 'alteryx', key: 'alteryx', label: 'Alteryx D&A Service',
    color: '#E4002B', bg: '#fef2f2',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    items: [
      { id: 'al-1', code: 'ALY-001', name: 'Full Population Testing', description: '全量数据测试（Alteryx）', status: 'completed', risk: 'medium', workpapers: 4, assignedTo: '李四' },
      { id: 'al-2', code: 'ALY-002', name: 'Data Analytics Workflow', description: '数据分析工作流执行', status: 'in-progress', risk: 'medium', workpapers: 1, assignedTo: '王五' },
    ]
  },
  {
    id: 'je-testing', key: 'je-testing', label: 'Journal Entries Testing',
    color: '#D69E2E', bg: '#fefce8',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    items: [
      { id: 'je-1', code: 'JE-001', name: 'JE Risk Assessment', description: '日记账分录风险评估', status: 'in-progress', risk: 'high', workpapers: 3, assignedTo: '赵六' },
      { id: 'je-2', code: 'JE-002', name: 'Manual JE Sampling', description: '手工分录抽样测试', status: 'not-started', risk: 'high', workpapers: 0, assignedTo: '钱七' },
      { id: 'je-3', code: 'JE-003', name: 'Period-end JE Review', description: '期末分录复核', status: 'completed', risk: 'medium', workpapers: 2, assignedTo: '孙八' },
    ]
  },
  {
    id: 'lease-recalc', key: 'lease-recalc', label: 'Lease recalculation',
    color: '#38A169', bg: '#f0fff4',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>,
    items: [
      { id: 'lr-1', code: 'LR-001', name: 'Lease Liability Recalculation', description: '租赁负债重新计算', status: 'in-progress', risk: 'medium', workpapers: 2, assignedTo: '周九' },
      { id: 'lr-2', code: 'LR-002', name: 'ROU Asset Verification', description: '使用权资产确认验证', status: 'not-started', risk: 'medium', workpapers: 0, assignedTo: '吴十' },
    ]
  },
  {
    id: 'group-audit', key: 'group-audit', label: 'Group Audit',
    color: '#DD6B20', bg: '#fffaf0',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    items: [
      { id: 'ga-1', code: 'GA-001', name: 'Component Auditor Coordination', description: '组成部分审计师协调', status: 'completed', risk: 'high', workpapers: 3, assignedTo: '郑十一' },
      { id: 'ga-2', code: 'GA-002', name: 'Group Consolidation Review', description: '集团合并报表审核', status: 'in-progress', risk: 'high', workpapers: 2, assignedTo: '张三' },
    ]
  },
  {
    id: 'inventory-obs', key: 'inventory-obs', label: 'Inventory observations',
    color: '#319795', bg: '#e6fffa',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    items: [
      { id: 'io-1', code: 'IO-001', name: 'Physical Inventory Observation', description: '存货实地监盘观察', status: 'completed', risk: 'medium', workpapers: 2, assignedTo: '李四' },
      { id: 'io-2', code: 'IO-002', name: 'Inventory Cut-off Test', description: '存货截止性测试', status: 'in-progress', risk: 'medium', workpapers: 1, assignedTo: '王五' },
      { id: 'io-3', code: 'IO-003', name: 'Inventory Valuation Check', description: '存货计价检查', status: 'not-started', risk: 'low', workpapers: 0, assignedTo: '赵六' },
    ]
  },
  {
    id: 'physical-attn', key: 'physical-attn', label: 'Physical attendance procedures',
    color: '#B83280', bg: '#fff5f7',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    items: [
      { id: 'pa-1', code: 'PA-001', name: 'Year-end Attendance', description: '年末实地出席程序', status: 'in-progress', risk: 'high', workpapers: 2, assignedTo: '钱七' },
      { id: 'pa-2', code: 'PA-002', name: 'Stocktake Participation', description: '盘点参与记录', status: 'not-started', risk: 'medium', workpapers: 0, assignedTo: '孙八' },
    ]
  },
  {
    id: 'vouching', key: 'vouching', label: 'Vouching',
    color: '#00338D', bg: '#e8edf5',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    items: [
      { id: 'vo-1', code: 'VO-001', name: 'Revenue Vouching', description: '收入凭证抽查', status: 'in-progress', risk: 'high', workpapers: 4, assignedTo: '周九' },
      { id: 'vo-2', code: 'VO-002', name: 'Expense Vouching', description: '费用凭证抽查', status: 'in-progress', risk: 'high', workpapers: 3, assignedTo: '吴十' },
      { id: 'vo-3', code: 'VO-003', name: 'Purchase Vouching', description: '采购凭证抽查', status: 'completed', risk: 'medium', workpapers: 2, assignedTo: '郑十一' },
      { id: 'vo-4', code: 'VO-004', name: 'Payroll Vouching', description: '薪酬凭证抽查', status: 'not-started', risk: 'low', workpapers: 0, assignedTo: '张三' },
    ]
  },
]

// Only show types that have items (non-empty detail list)
const visibleTypes = procedureTypesData.filter(t => t.items.length > 0)

const statusConfig = {
  'not-started':   { label: '未开始', color: '#718096', bg: '#F7FAFC' },
  'in-progress':   { label: '进行中', color: '#00338D', bg: '#EBF4FF' },
  'completed':     { label: '已完成', color: '#00A3A1', bg: '#E6FFFA' },
  'reviewed':      { label: '已复核', color: '#805AD5', bg: '#FAF5FF' },
}

const riskConfig = {
  high:   { label: '高风险', color: '#E4002B', bg: '#FFF5F5' },
  medium: { label: '中风险', color: '#D69E2E', bg: '#FFFBEB' },
  low:    { label: '低风险', color: '#00A3A1', bg: '#E6FFFA' },
}

// ===== Filter Categories (from image) =====
const filterCategories = [
  { key: 'all', label: '全部', color: '#00338D' },
  { key: 'fsr', label: 'Financial statement', color: '#00338D' },
  { key: 'treasury', label: 'Treasury', color: '#0091DA' },
  { key: 'kdc', label: 'KDC', color: '#00A3A1' },
  { key: 'credit-review', label: 'Credit Review', color: '#805AD5' },
  { key: 'da', label: 'D&A', color: '#E4002B' },
  { key: 'je-testing', label: 'JE', color: '#D69E2E' },
  { key: 'lease-recalc', label: 'Lease', color: '#38A169' },
  { key: 'group-audit', label: 'Group Reporting', color: '#DD6B20' },
  { key: 'inventory-obs', label: 'Inventory', color: '#319795' },
  { key: 'vouching', label: 'Vouching', color: '#B83280' },
]

// Map filter category key to procedure type keys
const categoryTypeMap: Record<string, string[]> = {
  'all': [],
  'fsr': ['fsr'],
  'treasury': ['kdc-cash'],
  'kdc': ['kdc-confirm'],
  'credit-review': ['credit-review'],
  'da': ['alteryx'],
  'je-testing': ['je-testing'],
  'lease-recalc': ['lease-recalc'],
  'group-audit': ['group-audit'],
  'inventory-obs': ['inventory-obs', 'physical-attn'],
  'vouching': ['vouching'],
}

function AuditProcedures() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')

  // Stats from all visible types
  const totalProcedures = visibleTypes.reduce((sum, t) => sum + t.items.length, 0)
  const inProgressCount = visibleTypes.reduce((sum, t) =>
    sum + t.items.filter(i => i.status === 'in-progress').length, 0)
  const completedCount = visibleTypes.reduce((sum, t) =>
    sum + t.items.filter(i => i.status === 'completed' || i.status === 'reviewed').length, 0)

  // Filter logic
  const filteredTypes = activeFilter === 'all'
    ? visibleTypes
    : visibleTypes.filter(t => (categoryTypeMap[activeFilter] || []).includes(t.key))

  const handleCardClick = (typeId: string) => {
    setExpandedType(expandedType === typeId ? null : typeId)
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedType(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="audit-procedures animate-fade-in">
      {/* Breadcrumb */}
      <div className="ap-breadcrumb">
        <button className="breadcrumb-back" onClick={() => navigate('/')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6-6-6"/>
          </svg>
          客户总览
        </button>
        <span className="breadcrumb-sep">/</span>
        <button className="breadcrumb-back" onClick={() => navigate(`/engagement/${clientId}/${engagementId}`)}>
          1668465
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Audit Procedures</span>
      </div>

      {/* Header */}
      <div className="ap-header">
        <div>
          <h1 className="ap-title">Audit Procedures</h1>
          <p className="ap-subtitle">审计程序执行中心 — 基于风险评估设计并执行审计程序</p>
        </div>
      </div>

      {/* Stats */}
      <div className="ap-stats">
        <div className="ap-stat">
          <span className="ap-stat-num">{visibleTypes.length}</span>
          <span className="ap-stat-label">程序类型</span>
        </div>
        <div className="ap-stat">
          <span className="ap-stat-num">{totalProcedures}</span>
          <span className="ap-stat-label">总程序数</span>
        </div>
        <div className="ap-stat">
          <span className="ap-stat-num">{inProgressCount}</span>
          <span className="ap-stat-label">进行中</span>
        </div>
        <div className="ap-stat">
          <span className="ap-stat-num">{completedCount}</span>
          <span className="ap-stat-label">已完成</span>
        </div>
      </div>

      {/* Section Title */}
      <h2 className="ap-section-title">Procedure Types</h2>

      {/* Filter Tags */}
      <div className="ap-filter-bar">
        {filterCategories.map(cat => {
          const typeKeys = categoryTypeMap[cat.key] || []
          const count = cat.key === 'all'
            ? visibleTypes.length
            : visibleTypes.filter(t => typeKeys.includes(t.key)).length
          if (cat.key !== 'all' && count === 0) return null
          return (
            <button
              key={cat.key}
              className={`ap-filter-tag ${activeFilter === cat.key ? 'tag-active' : ''}`}
              style={{
                borderColor: activeFilter === cat.key ? cat.color : 'transparent',
                color: activeFilter === cat.key ? cat.color : '#64748b',
                background: activeFilter === cat.key ? `${cat.color}0D` : 'transparent',
              }}
              onClick={() => setActiveFilter(cat.key)}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Cards Grid */}
      <div className={`ap-types-grid ${expandedType ? 'grid-dimmed' : ''}`}>
        {filteredTypes.map(type => {
          const isExpanded = expandedType === type.id
          const completedItems = type.items.filter(i => i.status === 'completed' || i.status === 'reviewed').length
          const progressPct = type.items.length > 0 ? Math.round((completedItems / type.items.length) * 100) : 0

          return (
            <div
              key={type.id}
              className={`ap-type-card ${isExpanded ? 'card-expanded' : 'card-lift'}`}
              style={{ borderTop: `3px solid ${type.color}` }}
              onClick={() => handleCardClick(type.id)}
            >
              {/* Card Header */}
              <div className="ap-card-header" style={{ background: type.bg }}>
                <div className="ap-card-icon" style={{ background: type.color, color: '#fff' }}>
                  {type.icon}
                </div>
                <div className="ap-card-title-wrap">
                  <h3 className="ap-card-name">{type.label}</h3>
                  <span className="ap-card-count">{type.items.length} 个程序</span>
                </div>
                {!isExpanded && (
                  <div className="ap-expand-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Summary Info */}
              <div className="ap-card-summary">
                <div className="ap-summary-row">
                  <span className="ap-summary-label">完成进度</span>
                  <div className="ap-progress-wrap">
                    <div className="ap-progress-bar">
                      <div className="ap-progress-fill" style={{ width: `${progressPct}%`, background: type.color }}></div>
                    </div>
                    <span className="ap-pct">{progressPct}%</span>
                  </div>
                </div>
                <div className="ap-summary-row">
                  <span className="ap-summary-label">已完成</span>
                  <span className="ap-summary-value">{completedItems} / {type.items.length}</span>
                </div>
                <div className="ap-summary-row">
                  <span className="ap-summary-label">状态分布</span>
                  <div className="ap-status-dots">
                    {['in-progress', 'completed', 'not-started'].map(s => {
                      const cnt = type.items.filter(i => i.status === s).length
                      if (cnt === 0) return null
                      const sc = statusConfig[s as keyof typeof statusConfig]
                      return (
                        <span key={s} className="ap-mini-badge" style={{ background: sc.bg, color: sc.color }}>
                          {sc.label} ({cnt})
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Preview Items */}
              {!isExpanded && type.items.length > 0 && (
                <div className="ap-file-preview">
                  {type.items.slice(0, 2).map(item => (
                    <div key={item.id} className="ap-preview-item">
                      <span className="ap-preview-code">{item.code}</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                  {type.items.length > 2 && (
                    <span className="ap-more-hint">+{type.items.length - 2} 更多</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Expanded Overlay */}
      {expandedType && (() => {
        const type = visibleTypes.find(t => t.id === expandedType)!
        if (!type) return null

        return (
          <>
            <div className="ap-overlay-backdrop" onClick={() => setExpandedType(null)} />
            <div className="ap-expanded-wrapper">
              <div
                className="ap-expanded-card"
                style={{ borderTop: `4px solid ${type.color}` }}
                onClick={e => e.stopPropagation()}
              >
                {/* Expanded Header */}
                <div className="ap-card-header" style={{ background: type.bg }}>
                  <div className="ap-card-icon" style={{ background: type.color, color: '#fff' }}>
                    {type.icon}
                  </div>
                  <div className="ap-card-title-wrap">
                    <h3 className="ap-card-name">{type.label}</h3>
                    <span className="ap-card-count">{type.items.length} 个程序</span>
                  </div>
                  <button className="ap-close-btn" onClick={() => setExpandedType(null)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Summary Bar */}
                <div className="ap-expanded-summary">
                  <div className="ap-exp-stat">
                    <span className="ap-exp-stat-num">{type.items.length}</span>
                    <span className="ap-exp-stat-label">总程序</span>
                  </div>
                  <div className="ap-exp-divider"></div>
                  <div className="ap-exp-stat">
                    <span className="ap-exp-stat-num">{type.items.filter(i => i.status === 'in-progress').length}</span>
                    <span className="ap-exp-stat-label">进行中</span>
                  </div>
                  <div className="ap-exp-divider"></div>
                  <div className="ap-exp-stat">
                    <span className="ap-exp-stat-num">{type.items.filter(i => i.status === 'completed' || i.status === 'reviewed').length}</span>
                    <span className="ap-exp-stat-label">已完成</span>
                  </div>
                </div>

                {/* Procedure List Table */}
                <div className="ap-proc-list">
                  <div className="ap-proc-list-header">
                    <span className="col-code">代码</span>
                    <span className="col-name">程序名称</span>
                    <span className="col-desc">描述</span>
                    <span className="col-status">状态</span>
                    <span className="col-risk">风险</span>
                    <span className="col-wp">底稿</span>
                    <span className="col-assigned">负责人</span>
                  </div>
                  {type.items.map(item => {
                    const sc = statusConfig[item.status]
                    const rc = riskConfig[item.risk]
                    return (
                      <div key={item.id} className="ap-proc-row">
                        <span className="col-code ap-code-text">{item.code}</span>
                        <span className="col-name ap-name-text">{item.name}</span>
                        <span className="col-desc ap-desc-text">{item.description}</span>
                        <span className="col-status">
                          <span className="ap-proc-status" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </span>
                        <span className="col-risk">
                          <span className="ap-proc-risk" style={{ background: rc.bg, color: rc.color }}>{rc.label}</span>
                        </span>
                        <span className="col-wp">{item.workpapers}</span>
                        <span className="col-assigned">{item.assignedTo}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}

export default AuditProcedures
