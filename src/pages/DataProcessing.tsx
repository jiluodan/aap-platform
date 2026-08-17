import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './DataProcessing.css'

// ===== Types =====
interface DataSourceFile {
  id: string
  name: string
  size: string
  uploadDate: string
  status: 'ready' | 'processing' | 'error' | 'ocr-pending' | 'ocr-done'
}

interface DataSource {
  id: string
  name: string
  typeKey: string
  category: 'structured' | 'unstructured'
  status: 'connected' | 'syncing' | 'disconnected' | 'pending-ocr'
  fileCount: number
  totalSize: string
  lastSync: string
  lastSyncEn?: string
  sourceFrom?: 'pbc-sync' | 'upload' | 'ocr'
  files: DataSourceFile[]
}

// ===== Database List Types =====
interface DatabaseItem {
  id: string
  name: string
  version: string
  entityName: string
  adpScope: string
  mappingRule: string
  accountStructure: string
  usedBy: string
  financialPeriod: string
  status: 'valid' | 'in-progress' | 'error'
}

// ===== Demo Data =====
const dataSources: DataSource[] = [
  // --- Structured Data ---
  {
    id: 'gl', name: 'General Ledger', typeKey: 'gl', category: 'structured',
    status: 'connected', fileCount: 3, totalSize: '2.3MB', lastSync: '2026-07-28 14:30', sourceFrom: 'pbc-sync',
    files: [
      { id: 'gl-1', name: 'GL_2025_FullYear.xlsx', size: '1.2MB', uploadDate: '2026-07-28 14:30', status: 'ready' },
      { id: 'gl-2', name: 'GL_Q4_2025.xlsx', size: '680KB', uploadDate: '2026-07-28 14:28', status: 'ready' },
      { id: 'gl-3', name: 'GL_Adjustments.xlsx', size: '420KB', uploadDate: '2026-07-27 09:15', status: 'ready' },
    ]
  },
  {
    id: 'tb', name: 'Trial Balance', typeKey: 'tb', category: 'structured',
    status: 'connected', fileCount: 2, totalSize: '156KB', lastSync: '2026-07-28 14:32', sourceFrom: 'pbc-sync',
    files: [
      { id: 'tb-1', name: 'TB_Level4_202512.xlsx', size: '98KB', uploadDate: '2026-07-28 14:32', status: 'ready' },
      { id: 'tb-2', name: 'TB_Level3_202512.xlsx', size: '58KB', uploadDate: '2026-07-28 14:30', status: 'ready' },
    ]
  },
  {
    id: 'ar', name: 'AR Subledger', typeKey: 'subledger', category: 'structured',
    status: 'syncing', fileCount: 0, totalSize: '-', lastSync: '同步中...', lastSyncEn: 'Syncing...', sourceFrom: 'pbc-sync',
    files: []
  },
  {
    id: 'ap', name: 'AP Subledger', typeKey: 'ap', category: 'structured',
    status: 'connected', fileCount: 1, totalSize: '340KB', lastSync: '2026-07-27 16:00', sourceFrom: 'upload',
    files: [
      { id: 'ap-1', name: 'AP_2025Q4.xlsx', size: '340KB', uploadDate: '2026-07-27 16:00', status: 'ready' },
    ]
  },

  // --- Unstructured Data ---
  {
    id: 'bank', name: 'Bank Statements', typeKey: 'bank', category: 'unstructured',
    status: 'connected', fileCount: 4, totalSize: '890KB', lastSync: '2026-07-27 09:15', sourceFrom: 'ocr',
    files: [
      { id: 'bk-1', name: 'BankStmt_CNY_202512.pdf', size: '320KB', uploadDate: '2026-07-27 09:15', status: 'ocr-done' },
      { id: 'bk-2', name: 'BankStmt_USD_202512.pdf', size: '280KB', uploadDate: '2026-07-27 09:14', status: 'ocr-done' },
      { id: 'bk-3', name: 'BankRecon_202512.xlsx', size: '180KB', uploadDate: '2026-07-27 09:13', status: 'ready' },
      { id: 'bk-4', name: 'BankConfirmations.pdf', size: '110KB', uploadDate: '2026-07-26 16:20', status: 'ocr-done' },
    ]
  },
  {
    id: 'tax', name: 'Tax Returns', typeKey: 'tax', category: 'unstructured',
    status: 'disconnected', fileCount: 0, totalSize: '-', lastSync: '未连接', lastSyncEn: 'Disconnected',
    files: []
  },
  {
    id: 'contract', name: 'Contracts & Agreements', typeKey: 'contract', category: 'unstructured',
    status: 'pending-ocr', fileCount: 2, totalSize: '1.8MB', lastSync: 'OCR 处理中...', lastSyncEn: 'OCR Processing...', sourceFrom: 'ocr',
    files: [
      { id: 'ct-1', name: 'Service_Agreement_2025.pdf', size: '920KB', uploadDate: '2026-07-28 10:00', status: 'ocr-pending' },
      { id: 'ct-2', name: 'Lease_Contract_HQ.pdf', size: '880KB', uploadDate: '2026-07-28 09:55', status: 'ocr-pending' },
    ]
  },
]

// ===== Type Metadata (compact icons) — bilingual labels =====
const typeMeta: Record<string, { labelZh: string; labelEn: string; icon: React.ReactNode; color: string; bg: string }> = {
  gl:       { labelZh: '总账', labelEn: 'General Ledger', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>, color: '#00338D', bg: '#e8edf5' },
  tb:       { labelZh: '试算平衡表', labelEn: 'Trial Balance', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>, color: '#00A3A1', bg: '#e6f7f7' },
  subledger: { labelZh: '明细账', labelEn: 'Subledger', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color: '#805AD5', bg: '#f3effb' },
  ap:       { labelZh: '应付明细账', labelEn: 'AP Subledger', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>, color: '#2563eb', bg: '#eff6ff' },
  bank:     { labelZh: '银行', labelEn: 'Bank', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, color: '#D69E2E', bg: '#fefce8' },
  tax:      { labelZh: '税务', labelEn: 'Tax', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>, color: '#E4002B', bg: '#fef2f2' },
  contract: { labelZh: '合同协议', labelEn: 'Contracts', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>, color: '#059669', bg: '#ecfdf5' },
}

// ===== Database List Demo Data =====
const databaseListData: DatabaseItem[] = [
  { id: 'db1', name: 'test03072222', version: 'Full period', versionEn: 'Full period', entityName: 'KPMG3', adpScope: '', mappingRule: 'rule068072222', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2025-01-01 ~ 2025-12-31', status: 'valid' },
  { id: 'db2', name: 'group0729001', version: 'Full period', versionEn: 'Full period', entityName: 'KPMG3', adpScope: '', mappingRule: 'rule0729001', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2025-01-01 ~ 2025-12-31', status: 'valid' },
  { id: 'db3', name: 'pre-9739', version: 'Pre-final', versionEn: 'Pre-final', entityName: 'KPMG3', adpScope: '', mappingRule: 'rule0729', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2024-01-01 ~ 2024-12-31', status: 'valid' },
  { id: 'db4', name: 'test0726001', version: 'Full period', versionEn: 'Full period', entityName: 'KPMG3', adpScope: '', mappingRule: 'rule0726m', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2025-01-01 ~ 2025-12-31', status: 'valid' },
  { id: 'db5', name: 'MF345', version: 'V5', versionEn: 'V5', entityName: 'KPMG_35', adpScope: '', mappingRule: 'rule345copy(1)copy(1)', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2022-01-01 ~ 2022-12-31', status: 'in-progress' },
  { id: 'db6', name: 'MF346', version: 'V4', versionEn: 'V4', entityName: 'KPMG_35', adpScope: '', mappingRule: 'rule345copy(1)copy(1)', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2022-01-01 ~ 2022-12-31', status: 'valid' },
]

function DataProcessing() {
  const { lang } = useLanguage()
  const [activeTab, setActiveTab] = useState<'structured' | 'unstructured'>('structured')
  const [uploadExpanded, setUploadExpanded] = useState(false)
  const [uploadPanelTab, setUploadPanelTab] = useState<'structured' | 'unstructured'>('structured')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const isZh = lang === 'zh'

  const structuredData = dataSources.filter(d => d.category === 'structured')
  const unstructuredData = dataSources.filter(d => d.category === 'unstructured')

  // --- i18n helpers ---
  const t = (zh: string, en: string) => (isZh ? zh : en)

  const statusConfig = (key: string) => {
    const map: Record<string, Record<string, { label: string; color: string; bg: string }>> = {
      connected:   { zh: { label: '已连接', color: '#00A3A1', bg: '#E6FFFA' }, en: { label: 'Connected', color: '#00A3A1', bg: '#E6FFFA' } },
      syncing:     { zh: { label: '同步中', color: '#D69E2E', bg: '#FFFBEB' }, en: { label: 'Syncing', color: '#D69E2E', bg: '#FFFBEB' } },
      disconnected:{ zh: { label: '未连接', color: '#94a3b8', bg: '#F1F5F9' }, en: { label: 'Disconnected', color: '#94a3b8', bg: '#F1F5F9' } },
      'pending-ocr':{ zh: { label: 'OCR处理中', color: '#805AD5', bg: '#f3effb' }, en: { label: 'OCR Processing', color: '#805AD5', bg: '#f3effb' } },
    }
    return map[key]?.[lang] || map.disconnected[lang]
  }

  const sourceTagConfig = (key: string) => {
    const map: Record<string, Record<string, { label: string; color: string; bg: string }>> = {
      'pbc-sync': { zh: { label: 'PBC 同步', color: '#00338D', bg: '#e8edf5' }, en: { label: 'PBC Sync', color: '#00338D', bg: '#e8edf5' } },
      'upload':   { zh: { label: '手动上传', color: '#d97706', bg: '#fef3c7' }, en: { label: 'Upload', color: '#d97706', bg: '#fef3c7' } },
      'ocr':      { zh: { label: 'KDR 解析', color: '#805AD5', bg: '#f3effb' }, en: { label: 'KDR OCR', color: '#805AD5', bg: '#f3effb' } },
    }
    return map[key]?.[lang]
  }

  const handleSyncPBC = () => {
    setIsSyncing(true)
    setTimeout(() => setIsSyncing(false), 2500)
  }

  const handleUpload = () => {
    if (isUploading) return
    setIsUploading(true)
    setUploadProgress(0)
    const iv = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) { clearInterval(iv); setIsUploading(false); return 100 }
        return p + 6
      })
    }, 120)
  }

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id)

  return (
    <div className="dp-page animate-fade-in">
      {/* === Header === */}
      <div className="dp-header-row">
        <div>
          <h1 className="dp-title">{t('Data Processing Engine', 'Data Processing Engine')}</h1>
          <span className="dp-subtitle">{t('财务数据采集 · 清洗 · 转换与分析处理中心', 'Financial data collection · cleansing · transformation & analysis center')}</span>
        </div>
        <button className={`dp-sync-btn ${isSyncing ? 'syncing' : ''}`} onClick={handleSyncPBC} disabled={isSyncing}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          {isSyncing ? t('同步中...', 'Syncing...') : t('同步 PBC 数据池', 'Sync PBC Data Pool')}
        </button>
      </div>

      {/* === PBC Data Pool Sync Bar === */}
      <div className="dp-pool-bar">
        <div className="pool-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
          <span><strong>{t('PBC 数据池', 'PBC Data Pool')}</strong> — {t('已连接 Engagement 源数据', 'Connected to Engagement source data')}</span>
        </div>
        <div className="pool-stats">
          <span className="pool-stat-item">{dataSources.length} {t('个数据源', 'sources')}</span>
          <span className="pool-stat-dot"></span>
          <span className="pool-stat-item">{dataSources.reduce((s, d) => s + d.fileCount, 0)} {t('个文件', 'files')}</span>
          <span className="pool-stat-dot"></span>
          <span className="pool-stat-item">{t('上次同步: 2 分钟前', 'Last sync: 2 min ago')}</span>
        </div>
      </div>

      {/* === Data Source Section (Tabbed: Structured / Unstructured) === */}
      <div className="dp-section">
        <div className="dp-source-header">
          <div className="dp-tab-bar dp-source-tab-bar">
            <button className={`dp-tab ${activeTab === 'structured' ? 'active' : ''}`} onClick={() => setActiveTab('structured')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              {t('结构化数据', 'Structured Data')}
              <span className="dp-section-count">{structuredData.length}</span>
            </button>
            <button className={`dp-tab ${activeTab === 'unstructured' ? 'active' : ''}`} onClick={() => setActiveTab('unstructured')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {t('非结构化数据', 'Unstructured Data')}
              <span className="dp-section-count">{unstructuredData.length}</span>
            </button>
          </div>
          <button className="dp-upload-file-btn" onClick={() => setUploadExpanded(true)}>
            <i className="fas fa-plus"></i> Upload File
          </button>
        </div>

        <div className="dp-grid">
          {(activeTab === 'structured' ? structuredData : unstructuredData).map(ds => renderCard(ds))}
        </div>
      </div>

      {/* ===== Upload Modal (Dialog) ===== */}
      {uploadExpanded && (
        <div className="dp-modal-overlay" onClick={() => setUploadExpanded(false)}>
          <div className="dp-modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="dp-modal-header">
              <h3>{t('Upload File', 'Upload File')}</h3>
              <button className="dp-modal-close" onClick={() => setUploadExpanded(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="dp-modal-tabs">
              <button className={`dp-up-panel-tab ${uploadPanelTab === 'structured' ? 'active' : ''}`} onClick={() => setUploadPanelTab('structured')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                Structured Data
              </button>
              <button className={`dp-up-panel-tab ${uploadPanelTab === 'unstructured' ? 'active' : ''}`} onClick={() => setUploadPanelTab('unstructured')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Unstructured Data
              </button>
            </div>

            <div className="dp-modal-body">
              <div className="dp-upload-zone-inner dp-modal-upload-zone" onClick={handleUpload}>
                {uploadPanelTab === 'structured' ? (
                  <>
                    <div className="up-icon structured">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div className="up-text">
                      <strong>{t('Drag or click to upload structured files', 'Drag or click to upload structured files')}</strong>
                      <span>{t('Supports Excel (.xlsx/.csv) · Files will be linked to matching data type cards', 'Supports Excel (.xlsx/.csv) · Files will be linked to matching data type cards')}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="up-icon unstructured">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#805AD5" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div className="up-text">
                      <strong>{t('Drag or click to upload unstructured files', 'Drag or click to upload unstructured files')}</strong>
                      <span>{t('Supports PDF/Images · KDR OCR will auto-parse and categorize', 'Supports PDF/Images · KDR OCR will auto-parse and categorize')}</span>
                    </div>
                    <div className="kdr-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      KDR OCR
                    </div>
                  </>
                )}
                {isUploading && (
                  <div className="up-progress">
                    <div className="up-progress-track"><div className="up-progress-fill" style={{ width: `${uploadProgress}%` }}></div></div>
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Data Application Section (Database List + MUS Sampling) === */}
      <div className="dp-data-application">
        <div className="dp-da-header">
          <h2 className="dp-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            {t('数据应用', 'Data Application')}
          </h2>
        </div>

        <div className="dp-da-body">
          {/* Left: MUS Sidebar (vertical tabs on the left side) */}
          <div className="dp-mus-sidebar dp-mus-sidebar-left">
            <div className="mus-tab" data-active={true}>
              <span className="mus-tab-text">Database List</span>
            </div>
            <div className="mus-tab">
              <span className="mus-tab-text">MUS Sampling</span>
            </div>
          </div>

          {/* Right: Database List content */}
          <div className="dp-db-list">
            <div className="dp-db-header">
              <span className="dp-db-desc">{t('Please upload raw file(including TB & GL) in the pool! The files can be shared by all the database under current engagement', 'Please upload raw file(including TB & GL) in the pool! The files can be shared by all the database under current engagement')}</span>
              <div className="dp-db-header-actions">
                <button className="dp-batch-btn outline">{t('Batch List', 'Batch List')}</button>
                <button className="dp-batch-btn primary">{t('Add New Database', 'Add New Database')}</button>
              </div>
            </div>

            {/* Database Table */}
            <div className="dp-db-table-wrap">
              <table className="dp-db-table">
                <thead>
                  <tr>
                    <th>{t('Database Name', 'Database Name')}</th>
                    <th>{t('Version', 'Version')}</th>
                    <th>{t('Entity Name', 'Entity Name')}</th>
                    <th>{t('ADP Scope', 'ADP Scope')}</th>
                    <th>{t('Mapping Rule', 'Mapping Rule')}</th>
                    <th>{t('Account Structure', 'Account Structure')}</th>
                    <th>{t('Used by', 'Used by')}</th>
                    <th>{t('Financial Period', 'Financial Period')}</th>
                    <th>{t('Status', 'Status')}</th>
                    <th>{t('Actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {databaseListData.map(db => (
                    <tr key={db.id}>
                      <td><a href="#" className="db-name-link">{db.name}</a></td>
                      <td><span className={`db-version-badge ${db.version === 'Full period' ? 'full' : db.version === 'Pre-final' ? 'prefinal' : ''}`}>{isZh ? (db.versionEn || db.version) : db.version}</span></td>
                      <td>{db.entityName}</td>
                      <td>{db.adpScope || '-'}</td>
                      <td className="db-mapping">{db.mappingRule}</td>
                      <td>{db.accountStructure}</td>
                      <td>{db.usedBy}</td>
                      <td className="db-period">{db.financialPeriod}</td>
                      <td><span className={`db-status ${db.status}`}>{db.status === 'valid' ? t('Valid', 'Valid') : db.status === 'in-progress' ? t('In progress', 'In progress') : db.status}</span></td>
                      <td className="db-actions">
                        <a href="#" className="db-action-link">{t('Copy', 'Copy')}</a>
                        <a href="#" className="db-action-link">{t('Update', 'Update')}</a>
                        {db.status === 'in-progress' && <a href="#" className="db-action-link danger">{t('Delete', 'Delete')}</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table footer with pagination only */}
              <div className="dp-db-footer">
                <div className="dp-db-pagination">
                  <span>Total {databaseListData.length}37</span>
                  <select className="dp-page-select">
                    <option>10/page</option>
                    <option>20/page</option>
                    <option>50/page</option>
                  </select>
                  <div className="dp-page-numbers">
                    <button className="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>4</button>
                    <button>5</button>
                    <button>6</button>
                    <span>...</span>
                    <button>464</button>
                    <button>&gt;</button>
                  </div>
                  <span>Go to: <input type="text" className="dp-go-input" defaultValue="1" /></span>
                </div>
              </div>
            </div>

            <p className="dp-db-note">{t('You can update the databases by clicking Update button if you want to apply the same mapping rule from the existing databases. Only 2 databases will be kept for each individual entity for the same financial period. The oldest uploaded database will be automatically removed if there are more than 2 databases being uploaded.', 'You can update the databases by clicking Update button if you want to apply the same mapping rule from the existing databases. Only 2 databases will be kept for each individual entity for the same financial period. The oldest uploaded database will be automatically removed if there are more than 2 databases being uploaded.')}</p>
          </div>
        </div>
      </div>

      {/* === Expanded Detail Panel === */}
      {expandedId && (() => {
        const ds = dataSources.find(d => d.id === expandedId)!
        if (!ds) return null
        const meta = typeMeta[ds.typeKey] || typeMeta.gl
        const sc = statusConfig(ds.status)
        const srcTag = ds.sourceFrom ? sourceTagConfig(ds.sourceFrom) : null

        return (
          <div className="dp-detail-overlay" onClick={() => setExpandedId(null)}>
            <div className="dp-detail-panel" onClick={e => e.stopPropagation()}>
              {/* Panel Header */}
              <div className="detail-header" style={{ borderTopColor: meta.color }}>
                <div className="detail-header-top">
                  <div className="detail-icon" style={{ background: meta.color }}>{meta.icon}</div>
                  <div>
                    <h3>{ds.name}</h3>
                    <span>{isZh ? meta.labelZh : meta.labelEn} · {ds.category === 'structured' ? t('结构化', 'Structured') : t('非结构化', 'Unstructured')}</span>
                  </div>
                  {srcTag && <span className="source-tag" style={{ background: srcTag.bg, color: srcTag.color }}>{srcTag.label}</span>}
                  <button className="detail-close" onClick={() => setExpandedId(null)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                {/* Stats row */}
                <div className="detail-stats">
                  <div className="dst"><b>{ds.fileCount}</b><span>{t('文件', 'Files')}</span></div>
                  <div className="dst"><b>{ds.totalSize}</b><span>{t('总大小', 'Total Size')}</span></div>
                  <div className="dst"><b>{sc.label}</b><span>{t('状态', 'Status')}</span></div>
                  <div className="dst"><b>{isZh ? ds.lastSync : (ds.lastSyncEn || ds.lastSync)}</b><span>{t('最后同步', 'Last Sync')}</span></div>
                </div>
              </div>

              {/* File list */}
              <div className="detail-files">
                {ds.files.length > 0 ? (
                  <>
                    <div className="df-head"><span>{t('文件名', 'Filename')}</span><span>{t('大小', 'Size')}</span><span>{t('时间', 'Time')}</span><span>{t('状态', 'Status')}</span></div>
                    {ds.files.map(f => (
                      <div key={f.id} className="df-row">
                        <span className="df-name">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          {f.name}
                        </span>
                        <span>{f.size}</span>
                        <span>{f.uploadDate}</span>
                        <span className={`df-status ${f.status}`}>{fileStatusLabel(f.status, lang)}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="df-empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                    <p>{t('暂无文件', 'No files yet')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )

  // --- Card renderer ---
  function renderCard(ds: DataSource) {
    const meta = typeMeta[ds.typeKey] || typeMeta.gl
    const sc = statusConfig(ds.status)
    const isExpanded = expandedId === ds.id

    return (
      <div
        key={ds.id}
        className={`dp-card ${isExpanded ? 'card-active' : ''}`}
        style={{ borderTopColor: meta.color }}
        onClick={() => toggleExpand(ds.id)}
      >
        <div className="dc-top">
          <div className="dc-icon" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</div>
          <div className="dc-info">
            <div className="dc-name-row">
              <span className="dc-name">{ds.name}</span>
              <span className="dc-status-pill" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
            </div>
            <span className="dc-type">{isZh ? meta.labelZh : meta.labelEn}</span>
          </div>
          {ds.sourceFrom && (() => {
            const st = sourceTagConfig(ds.sourceFrom!)
            return st ? (
              <span className="dc-source-tag" style={{ background: st.bg, color: st.color }}>{st.label}</span>
            ) : null
          })()}
        </div>

        <div className="dc-body">
          <div className="dc-metrics">
            <div className="dc-metric"><span className="dm-val">{ds.fileCount}</span><span className="dm-lbl">{t('文件', 'Files')}</span></div>
            <div className="dc-metric"><span className="dm-val">{ds.totalSize}</span><span className="dm-lbl">{t('大小', 'Size')}</span></div>
            <div className="dc-metric"><span className="dm-val dm-time">{isZh ? ds.lastSync : (ds.lastSyncEn || ds.lastSync)}</span><span className="dm-lbl">{t('同步', 'Sync')}</span></div>
          </div>
          {ds.files.length > 0 && !isExpanded && (
            <div className="dc-files-preview">
              {ds.files.slice(0, 2).map(f => (
                <div key={f.id} className="dc-file-item">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>{f.name}</span>
                </div>
              ))}
              {ds.files.length > 2 && <span className="dc-more">+{ds.files.length - 2}</span>}
            </div>
          )}
        </div>

        {!isExpanded && (
          <div className="dc-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        )}
      </div>
    )
  }
}

// Helper — bilingual file status labels
function fileStatusLabel(s: string, lang: string): string {
  const zhMap: Record<string, string> = {
    ready: '就绪', processing: '处理中', error: '异常',
    'ocr-pending': 'OCR排队', 'ocr-done': '已完成',
  }
  const enMap: Record<string, string> = {
    ready: 'Ready', processing: 'Processing', error: 'Error',
    'ocr-pending': 'OCR Queued', 'ocr-done': 'Done',
  }
  return lang === 'zh' ? (zhMap[s] || s) : (enMap[s] || s)
}

export default DataProcessing
