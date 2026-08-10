// react-router-dom hooks removed: navigation handled by TopNav
import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './PBCManager.css'

// ===== Types =====
interface PBCItem {
  id: string
  category: string
  description: string
  requestedBy: string
  requestedDate: string
  dueDate: string
  status: 'pending' | 'received' | 'reviewed' | 'accepted'
  priority: 'high' | 'medium' | 'low'
  dataType: 'structured' | 'unstructured'   // NEW: data classification
  fileName?: string                          // NEW: actual file name if received
  fileSize?: string                          // NEW: file size
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

// ===== Demo Data =====
const pbcItems: PBCItem[] = [
  // Financial Statements — Structured
  { id: '1', category: 'Financial Statements', description: '2025 Annual Audit Financial Statements (Draft)', requestedBy: 'Zhang San', requestedDate: '2026-07-01', dueDate: '2026-07-10', status: 'accepted', priority: 'high', dataType: 'structured', fileName: 'FS_2025_Draft.xlsx', fileSize: '1.8MB' },
  { id: '2', category: 'Financial Statements', description: 'Q1-Q4 2025 Management Accounts (Monthly)', requestedBy: 'Zhang San', requestedDate: '2026-07-01', dueDate: '2026-07-12', status: 'accepted', priority: 'high', dataType: 'structured', fileName: 'MA_Q1Q4_2025.xlsx', fileSize: '2.4MB' },
  { id: '3', category: 'Financial Statements', description: 'Trial Balance (Level 4 Detail)', requestedBy: 'Zhang San', requestedDate: '2026-07-02', dueDate: '2026-07-14', status: 'received', priority: 'medium', dataType: 'structured', fileName: 'TB_L4_202512.xlsx', size: '98KB' },
  { id: '4', category: 'Financial Statements', description: 'General Ledger Extract (Full Year)', requestedBy: 'Li Si', requestedDate: '2026-07-03', dueDate: '2026-07-16', status: 'reviewed', priority: 'medium', dataType: 'structured', fileName: 'GL_FY2025.xlsx', size: '1.2MB' },
  { id: '5', category: 'Financial Statements', description: 'Consolidation Package and Eliminations', requestedBy: 'Zhang San', requestedDate: '2026-07-04', dueDate: '2026-07-18', status: 'pending', priority: 'high', dataType: 'structured' },
  { id: '6', category: 'Financial Statements', description: 'Notes to Financial Statements Disclosures', requestedBy: 'Li Si', requestedDate: '2026-07-05', dueDate: '2026-07-20', status: 'pending', priority: 'medium', dataType: 'structured' },

  // Bank Documents — Unstructured (PDFs need OCR)
  { id: '7', category: 'Bank Documents', description: 'Dec 31, 2025 Bank Statements and Reconciliation', requestedBy: 'Li Si', requestedDate: '2026-07-02', dueDate: '2026-07-12', status: 'received', priority: 'high', dataType: 'unstructured', fileName: 'BankStmt_202512.pdf', size: '320KB' },
  { id: '8', category: 'Bank Documents', description: 'All Bank Confirmations (Year-end Balances)', requestedBy: 'Li Si', requestedDate: '2026-07-03', dueDate: '2026-07-14', status: 'received', priority: 'high', dataType: 'unstructured', fileName: 'BankConf_2025.pdf', size: '180KB' },
  { id: '9', category: 'Bank Documents', description: 'Loan Agreements and Facility Letters', requestedBy: 'Wang Wu', requestedDate: '2026-07-04', dueDate: '2026-07-16', status: 'reviewed', priority: 'medium', dataType: 'unstructured', fileName: 'LoanAgreements.pdf', size: '920KB' },
  { id: '10', category: 'Bank Documents', description: 'Interbank Fund Transfer Records (Large)', requestedBy: 'Li Si', requestedDate: '2026-07-06', dueDate: '2026-07-20', status: 'pending', priority: 'low', dataType: 'unstructured' },

  // Tax Documents — Mixed
  { id: '11', category: 'Tax Documents', description: '2025 Annual CIT Settlement and Declaration Form', requestedBy: 'Wang Wu', requestedDate: '2026-07-03', dueDate: '2026-07-15', status: 'pending', priority: 'medium', dataType: 'structured' },
  { id: '12', category: 'Tax Documents', description: 'VAT Returns (Monthly, Full Year)', requestedBy: 'Wang Wu', requestedDate: '2026-07-04', dueDate: '2026-07-17', status: 'received', priority: 'medium', dataType: 'structured', fileName: 'VAT_Monthly_2025.xlsx', size: '450KB' },
  { id: '13', category: 'Tax Documents', description: 'Transfer Pricing Documentation', requestedBy: 'Wang Wu', requestedDate: '2026-07-06', dueDate: '2026-07-21', status: 'pending', priority: 'high', dataType: 'unstructured' },
  { id: '14', category: 'Tax Documents', description: 'Tax Payment Vouchers and Receipts', requestedBy: 'Sun Ba', requestedDate: '2026-07-07', dueDate: '2026-07-22', status: 'reviewed', priority: 'low', dataType: 'unstructured', fileName: 'TaxVouchers_2025.pdf', size: '210KB' },

  // Contracts — Unstructured
  { id: '15', category: 'Contracts', description: 'Major Sales Contracts List and Samples (Amount > 1M)', requestedBy: 'Zhao Liu', requestedDate: '2026-07-05', dueDate: '2026-07-18', status: 'pending', priority: 'high', dataType: 'unstructured' },
  { id: '16', category: 'Contracts', description: 'Purchase Agreements and Framework Contracts', requestedBy: 'Zhao Liu', requestedDate: '2026-07-06', dueDate: '2026-07-19', status: 'received', priority: 'medium', dataType: 'unstructured', fileName: 'PurchaseAgreements.zip', size: '3.2MB' },
  { id: '17', category: 'Contracts', description: 'Lease Agreements (Property and Equipment)', requestedBy: 'Zhao Liu', requestedDate: '2026-07-07', dueDate: '2026-07-20', status: 'reviewed', priority: 'low', dataType: 'unstructured', fileName: 'Lease_Agreements.pdf', size: '880KB' },
  { id: '18', category: 'Contracts', description: 'Related Party Transaction Agreements', requestedBy: 'Qian Qi', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'pending', priority: 'high', dataType: 'unstructured' },

  // Legal Documents — Unstructured
  { id: '19', category: 'Legal Documents', description: 'Pending Litigation and Contingencies Statement', requestedBy: 'Qian Qi', requestedDate: '2026-07-06', dueDate: '2026-07-20', status: 'reviewed', priority: 'medium', dataType: 'unstructured' },
  { id: '20', category: 'Legal Documents', description: 'Certificate of Incorporation and Bylaws', requestedBy: 'Qian Qi', requestedDate: '2026-07-07', dueDate: '2026-07-21', status: 'accepted', priority: 'low', dataType: 'unstructured', fileName: 'COI_Bylaws.pdf', size: '340KB' },
  { id: '21', category: 'Legal Documents', description: 'Board Resolutions and Minutes (FY2025)', requestedBy: 'Qian Qi', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'received', priority: 'medium', dataType: 'unstructured', fileName: 'BoardMinutes_2025.pdf', size: '520KB' },
  { id: '22', category: 'Legal Documents', description: 'Regulatory Filings and Licenses', requestedBy: 'Sun Ba', requestedDate: '2026-07-09', dueDate: '2026-07-24', status: 'pending', priority: 'low', dataType: 'unstructured' },

  // Internal Control — Structured
  { id: '23', category: 'Internal Control', description: '2025 Annual Internal Control Self-Assessment Report', requestedBy: 'Sun Ba', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'pending', priority: 'low', dataType: 'structured' },
  { id: '24', category: 'Internal Control', description: 'IT General Controls Documentation', requestedBy: 'Sun Ba', requestedDate: '2026-07-09', dueDate: '2026-07-23', status: 'received', priority: 'medium', dataType: 'structured', fileName: 'ITGC_Doc_2025.xlsx', size: '760KB' },
  { id: '25', category: 'Internal Control', description: 'Segregation of Duties Matrix', requestedBy: 'Sun Ba', requestedDate: '2026-07-10', dueDate: '2026-07-24', status: 'reviewed', priority: 'low', dataType: 'structured', fileName: 'SOD_Matrix.xlsx', size: '120KB' },
  { id: '26', category: 'Internal Control', description: 'Key Control Test Results and Evidence', requestedBy: 'Sun Ba', requestedDate: '2026-07-11', dueDate: '2026-07-25', status: 'pending', priority: 'medium', dataType: 'structured' },
]

// File Pool demo data — files that have been received/uploaded
const poolFiles: PoolFile[] = [
  { id: 'pf-1', name: 'FS_2025_Draft.xlsx', size: '1.8MB', category: 'Financial Statements', dataType: 'structured', status: 'raw', uploadDate: '2026-07-10', pushedToDPE: true },
  { id: 'pf-2', name: 'MA_Q1Q4_2025.xlsx', size: '2.4MB', category: 'Financial Statements', dataType: 'structured', status: 'raw', uploadDate: '2026-07-12', pushedToDPE: true },
  { id: 'pf-3', name: 'GL_FY2025.xlsx', size: '1.2MB', category: 'Financial Statements', dataType: 'structured', status: 'processed', uploadDate: '2026-07-16', pushedToDPE: true },
  { id: 'pf-4', name: 'TB_L4_202512.xlsx', size: '98KB', category: 'Financial Statements', dataType: 'structured', status: 'processed', uploadDate: '2026-07-14', pushedToDPE: false },
  { id: 'pf-5', name: 'BankStmt_202512.pdf', size: '320KB', category: 'Bank Documents', dataType: 'unstructured', status: 'raw', uploadDate: '2026-07-12', pushedToDPE: true },
  { id: 'pf-6', name: 'BankConf_2025.pdf', size: '180KB', category: 'Bank Documents', dataType: 'unstructured', status: 'raw', uploadDate: '2026-07-14', pushedToDPE: true },
  { id: 'pf-7', name: 'VAT_Monthly_2025.xlsx', size: '450KB', category: 'Tax Documents', dataType: 'structured', status: 'raw', uploadDate: '2026-07-17', pushedToDPE: false },
  { id: 'pf-8', name: 'PurchaseAgreements.zip', size: '3.2MB', category: 'Contracts', dataType: 'unstructured', status: 'raw', uploadDate: '2026-07-19', pushedToDPE: false },
  { id: 'pf-9', name: 'Lease_Agreements.pdf', size: '880KB', category: 'Contracts', dataType: 'unstructured', status: 'meta', uploadDate: '2026-07-20', pushedToDPE: false },
  { id: 'pf-10', name: 'ITGC_Doc_2025.xlsx', size: '760KB', category: 'Internal Control', dataType: 'structured', status: 'raw', uploadDate: '2026-07-23', pushedToDPE: false },
]

// ===== Category Metadata — bilingual =====
const categoryMeta: Record<string, {
  iconZh: string; iconEn: string;
  color: string; bg: string;
  type: 'structured' | 'unstructured' | 'mixed';
}> = {
  'Financial Statements': { iconZh: '📊', iconEn: '📊', color: '#4f46e5', bg: '#eef2ff', type: 'structured' },
  'Bank Documents':        { iconZh: '🏦', iconEn: '🏦', color: '#2563eb', bg: '#eff6ff', type: 'unstructured' },
  'Tax Documents':         { iconZh: '📋', iconEn: '📋', color: '#d97706', bg: '#fffbeb', type: 'mixed' },
  'Contracts':             { iconZh: '📝', iconEn: '📝', color: '#059669', bg: '#ecfdf5', type: 'unstructured' },
  'Legal Documents':       { iconZh: '⚖️', iconEn: '⚖️', color: '#7c3aed', bg: '#f5f3ff', type: 'unstructured' },
  'Internal Control':      { iconZh: '🛡️', iconEn: '🛡️', color: '#0891b2', bg: '#ecfeff', type: 'structured' },
}

function PBCManager() {
  const { lang } = useLanguage()
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'cards' | 'pool'>('cards')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [poolFilter, setPoolFilter] = useState<'all' | 'structured' | 'unstructured'>('all')
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isZh = lang === 'zh'
  const t = (zh: string, en: string) => (isZh ? zh : en)

  // --- Status config (bilingual) ---
  const sc = (key: string) => {
    const map: Record<string, Record<string, { label: string; color: string; bg: string }>> = {
      pending:   { zh: { label: '待处理', color: '#D69E2E', bg: '#FFFBEB' }, en: { label: 'Pending', color: '#D69E2E', bg: '#FFFBEB' } },
      received:  { zh: { label: '已接收', color: '#3182CE', bg: '#EBF4FF' }, en: { label: 'Received', color: '#3182CE', bg: '#EBF4FF' } },
      reviewed:  { zh: { label: '已审核', color: '#805AD5', bg: '#FAF5FF' }, en: { label: 'Reviewed', color: '#805AD5', bg: '#FAF5FF' } },
      accepted:  { zh: { label: '已接受', color: '#00A3A1', bg: '#E6FFFA' }, en: { label: 'Accepted', color: '#00A3A1', bg: '#E6FFFA' } },
    }
    return map[key]?.[lang] || map.pending[lang]
  }

  // Pool status labels
  const poolStatusLabel = (s: string) => {
    const m: Record<string, Record<string, string>> = {
      raw:       { zh: '原始数据', en: 'Raw' },
      meta:      { zh: '元数据', en: 'Meta' },
      processed: { zh: '已处理', en: 'Processed' },
    }
    return m[s]?.[lang] || s
  }

  const filtered = filter === 'all' ? pbcItems : pbcItems.filter(item => item.status === filter)

  const stats = {
    total: pbcItems.length,
    pending: pbcItems.filter(i => i.status === 'pending').length,
    received: pbcItems.filter(i => i.status === 'received').length,
    accepted: pbcItems.filter(i => i.status === 'accepted').length,
    structured: pbcItems.filter(i => i.dataType === 'structured').length,
    unstructured: pbcItems.filter(i => i.dataType === 'unstructured').length,
    inPool: poolFiles.length,
    pushedToDPE: poolFiles.filter(f => f.pushedToDPE).length,
  }

  const grouped: Record<string, PBCItem[]> = {}
  filtered.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })

  const filteredPool = poolFilter === 'all'
    ? poolFiles
    : poolFiles.filter(f => f.dataType === poolFilter)

  const handleCardClick = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpandedCategory(null) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="pbc-manager animate-fade-in">
      {/* ===== Header ===== */}
      <div className="pbc-header-row">
        <div>
          <h1 className="pbc-title">{t('PBC Lifecycle Management', 'PBC Lifecycle Management')}</h1>
          <span className="pbc-subtitle">{t('客户文件采集 · 分类 · 处理与推送中心', 'Client document collection · categorization · processing & push center')}</span>
        </div>
        <div className="pbc-header-actions">
          {/* View mode toggle */}
          <div className="pbc-view-toggle">
            <button className={`pvt-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              {t('分类视图', 'Categories')}
            </button>
            <button className={`pvt-btn ${viewMode === 'pool' ? 'active' : ''}`} onClick={() => setViewMode('pool')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              {t('File Pool', 'File Pool')}
            </button>
          </div>
          <button className="pbc-new-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t('新建请求', 'New Request')}
          </button>
        </div>
      </div>

      {/* ===== Stats Bar (compact) ===== */}
      <div className="pbc-stats-bar">
        <div className="ps-item">
          <span className="ps-num">{stats.total}</span>
          <span className="ps-lbl">{t('总请求数', 'Total Requests')}</span>
        </div>
        <div className="ps-divider"></div>
        <div className="ps-item ps-warn">
          <span className="ps-num">{stats.pending}</span>
          <span className="ps-lbl">{t('待处理', 'Pending')}</span>
        </div>
        <div className="ps-divider"></div>
        <div className="ps-item ps-info">
          <span className="ps-num">{stats.received}</span>
          <span className="ps-lbl">{t('已接收', 'Received')}</span>
        </div>
        <div className="ps-divider"></div>
        <div className="ps-item ps-ok">
          <span className="ps-num">{stats.accepted}</span>
          <span className="ps-lbl">{t('已接受', 'Accepted')}</span>
        </div>
        <div className="ps-divider"></div>
        <div className="ps-item ps-pool">
          <span className="ps-num">{stats.inPool}</span>
          <span className="ps-lbl">File Pool</span>
        </div>
        <div className="ps-divider"></div>
        <div className="ps-item ps-dpe">
          <span className="ps-num">{stats.pushedToDPE}</span>
          <span className="ps-lbl">→ DPE</span>
        </div>
      </div>

      {/* ===== Data Type Summary (from Screenshot 1 concept) ===== */}
      <div className="pbc-type-summary">
        <div className="pts-card pts-structured">
          <div className="pts-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div>
          <div className="pts-body">
            <strong>{t('结构化数据', 'Structured Data')}</strong>
            <span>{stats.structured} {t('项请求', 'requests')} · Excel/CSV</span>
          </div>
          <span className="pts-count">{stats.structured}</span>
        </div>
        <div className="pts-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
        <div className="pts-card pts-unstructured">
          <div className="pts-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#805AD5" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <div className="pts-body">
            <strong>{t('非结构化数据', 'Unstructured Data')}</strong>
            <span>{stats.unstructured} {t('项请求', 'requests')} · PDF/Image → OCR</span>
          </div>
          <span className="pts-count">{stats.unstructured}</span>
        </div>
        <div className="pts-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
        <div className="pts-card pts-dpe">
          <div className="pts-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
          <div className="pts-body">
            <strong>Data Processing Engine</strong>
            <span>{stats.pushedToDPE} {t('个文件已推送', 'files pushed')}</span>
          </div>
          <span className="pts-count">{stats.pushedToDPE}</span>
        </div>
      </div>

      {/* ===== Filter Tabs ===== */}
      <div className="pbc-filters">
        {(['all','pending','received','reviewed','accepted'] as const).map(k => (
          <button key={k} className={filter === k ? 'active' : ''} onClick={() => setFilter(k)}>
            {sc(k).label}
          </button>
        ))}
      </div>

      {/* ===== VIEW: Category Cards ===== */}
      {viewMode === 'cards' && (
        <div className={`pbc-cards-grid ${expandedCategory ? 'grid-dimmed' : ''}`}>
          {Object.entries(grouped).map(([category, items]) => {
            const meta = categoryMeta[category] || { iconZh: '📄', iconEn: '📄', color: '#64748b', bg: '#f8fafc', type: 'mixed' as const }
            const isExpanded = expandedCategory === category
            const hasFile = items.some(i => i.fileName)
            const pushableCount = items.filter(i => i.fileName && (i.status === 'received' || i.status === 'reviewed' || i.status === 'accepted')).length

            return (
              <div key={category} ref={el => { cardRefs.current[category] = el }}
                className={`pbc-category-card ${isExpanded ? 'card-expanded' : 'card-lift'}`}
                style={{ borderTop: `3px solid ${meta.color}` }}
                onClick={() => handleCardClick(category)}
              >
                {/* Card header */}
                <div className="pbc-card-header" style={{ background: meta.bg }}>
                  <div className="pbc-card-icon" style={{ background: meta.color }}>{isZh ? meta.iconZh : meta.iconEn}</div>
                  <div className="pbc-card-title-wrap">
                    <h3 className="pbc-card-title">{category}</h3>
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
                    <button className="pbc-push-btn" onClick={e => { e.stopPropagation(); /* push to DPE */ }} title={t('推送到 Data Processing Engine', 'Push to Data Processing Engine')}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                      DPE
                    </button>
                  )}
                  <div className="pbc-card-expand-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>

                {/* Card list preview */}
                <div className="pbc-card-list">
                  {items.slice(0, isExpanded ? undefined : 3).map(item => (
                    <div key={item.id} className={`pbc-card-item priority-${item.priority}`}>
                      <div className="pbc-card-item-top">
                        <p className="pbc-card-desc">{item.description}</p>
                        <span className="pbc-status" style={{ background: sc(item.status).bg, color: sc(item.status).color }}>
                          {sc(item.status).label}
                        </span>
                      </div>
                      <div className="pbc-card-item-bottom">
                        <div className="pbc-card-dates">
                          <span>{t('截止:', 'Due:')} {item.dueDate}</span>
                          <span>{item.requestedBy}</span>
                          {item.fileName && <span className="pbc-file-tag">📎 {item.fileName}</span>}
                        </div>
                        <div className="pbc-card-priority">
                          <span className={`priority-dot priority-${item.priority}`}></span>
                          {item.priority}
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

      {/* ===== VIEW: File Pool (Screenshot 2/3 concept) ===== */}
      {viewMode === 'pool' && (
        <div className="pbc-pool-view animate-fade-in">
          {/* Pool header bar */}
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

          {/* Pool buckets visualization */}
          <div className="pp-buckets">
            <div className="pp-bucket pp-bucket-kcc">
              <div className="ppb-label">KCC Bucket</div>
              <div className="ppb-count">{poolFiles.filter(f => f.category === 'Financial Statements' || f.category === 'Internal Control').length}</div>
            </div>
            <div className="pp-bucket pp-bucket-oak">
              <div className="ppb-label">OAK Bucket</div>
              <div className="ppb-count">{poolFiles.filter(f => f.category === 'Tax Documents').length}</div>
            </div>
            <div className="pp-bucket pp-bucket-aap">
              <div className="ppb-label">AAP Bucket</div>
              <div className="ppb-count">{poolFiles.filter(f => f.category === 'Bank Documents' || f.category === 'Contracts' || f.category === 'Legal Documents').length}</div>
            </div>
            <div className="pp-bucket pp-bucket-dpe">
              <div className="ppb-label">DPE Bucket</div>
              <div className="ppb-count">{poolFiles.filter(f => f.pushedToDPE).length}</div>
            </div>
          </div>

          {/* Pool file table */}
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
                    <td><span className="pp-cat-tag">{f.category.split(' ')[0]}</span></td>
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
              const meta = categoryMeta[expandedCategory] || { iconZh: '📄', iconEn: '📄', color: '#64748b', bg: '#f8fafc', type: 'mixed' }
              return (
                <div className="pbc-category-card pbc-expanded-card" style={{ borderTop: `3px solid ${meta.color}` }} onClick={e => e.stopPropagation()}>
                  <div className="pbc-card-header" style={{ background: meta.bg }}>
                    <div className="pbc-card-icon" style={{ background: meta.color }}>{isZh ? meta.iconZh : meta.iconEn}</div>
                    <div className="pbc-card-title-wrap">
                      <h3 className="pbc-card-title">{expandedCategory}</h3>
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
                          <p className="pbc-card-desc">{item.description}</p>
                          <span className="pbc-status" style={{ background: sc(item.status).bg, color: sc(item.status).color }}>{sc(item.status).label}</span>
                        </div>
                        <div className="pbc-card-item-bottom">
                          <div className="pbc-card-dates">
                            <span>{t('截止:', 'Due:')} {item.dueDate}</span>
                            <span>{item.requestedBy}</span>
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
