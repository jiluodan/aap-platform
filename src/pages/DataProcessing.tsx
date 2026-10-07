import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import KdrWorkbench, { buildExtractedFields, type KdrFile, type KdrFileStatus } from './KdrWorkbench'
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
  versionEn?: string
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
  { id: 'db1', name: 'test03072222', version: 'Full period', versionEn: 'Full period', entityName: 'Entity A', adpScope: '', mappingRule: 'rule068072222', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2025-01-01 ~ 2025-12-31', status: 'valid' },
  { id: 'db2', name: 'group0729001', version: 'Full period', versionEn: 'Full period', entityName: 'Entity A', adpScope: '', mappingRule: 'rule0729001', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2025-01-01 ~ 2025-12-31', status: 'valid' },
  { id: 'db3', name: 'pre-9739', version: 'Pre-final', versionEn: 'Pre-final', entityName: 'Entity A', adpScope: '', mappingRule: 'rule0729', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2024-01-01 ~ 2024-12-31', status: 'valid' },
  { id: 'db4', name: 'test0726001', version: 'Full period', versionEn: 'Full period', entityName: 'Entity A', adpScope: '', mappingRule: 'rule0726m', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2025-01-01 ~ 2025-12-31', status: 'valid' },
  { id: 'db5', name: 'MF345', version: 'V5', versionEn: 'V5', entityName: 'Entity B', adpScope: '', mappingRule: 'rule345copy(1)copy(1)', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2022-01-01 ~ 2022-12-31', status: 'in-progress' },
  { id: 'db6', name: 'MF346', version: 'V4', versionEn: 'V4', entityName: 'Entity B', adpScope: '', mappingRule: 'rule345copy(1)copy(1)', accountStructure: 'PRC GAAP', usedBy: 'JE Testing', financialPeriod: '2022-01-01 ~ 2022-12-31', status: 'valid' },
]

// ===== MUS Sampling Demo Data (仅适用于结构化数据) =====
// MUS 引擎以「任务」为单位管理抽样作业，一个任务可覆盖多个实体 / 多个审计程序
type MusTask = {
  id: string
  name: string
  taskType: string
  taskTypeCn: string
  fileType: string
  fileTypeCn: string
  entities: number
  files: number
  createdBy: string
  createdAt: string
  status: 'processing' | 'completed' | 'failed'
}

// 演示人名一律使用虚构占位（沿用 PBCManager 中 TEAM_MEMBERS 的命名约定），
// 不引用任何真实人员姓名，格式为「姓, 名」
const DEMO_PEOPLE = ['Zhang, San', 'Li, Si', 'Wang, Wu'] as const

const MUS_TASKS: MusTask[] = [
  { id: 'MUS-1235', name: '1235', taskType: 'Multiple files of different types', taskTypeCn: '多类型文件', fileType: 'Multiple files (TB & GL)', fileTypeCn: '多文件（TB & GL）', entities: 1, files: 1, createdBy: DEMO_PEOPLE[0], createdAt: '2026-09-19 10:24', status: 'processing' },
  { id: 'MUS-11111111', name: '11111111', taskType: 'Multiple files of different types', taskTypeCn: '多类型文件', fileType: 'Multiple files (TB & GL)', fileTypeCn: '多文件（TB & GL）', entities: 1, files: 1, createdBy: DEMO_PEOPLE[0], createdAt: '2026-08-25 16:08', status: 'processing' },
  { id: 'MUS-test0824', name: 'test0824', taskType: 'Multiple files of different types', taskTypeCn: '多类型文件', fileType: 'Multiple files (TB & GL)', fileTypeCn: '多文件（TB & GL）', entities: 1, files: 1, createdBy: DEMO_PEOPLE[0], createdAt: '2026-08-24 09:41', status: 'processing' },
  { id: 'MUS-Test0811', name: 'Test0811', taskType: 'Multiple files of different types', taskTypeCn: '多类型文件', fileType: 'Multiple files (TB & GL)', fileTypeCn: '多文件（TB & GL）', entities: 1, files: 1, createdBy: DEMO_PEOPLE[1], createdAt: '2026-08-11 14:02', status: 'processing' },
]

// 非结构化文件的解析状态 → KDR 工作区状态
const kdrStatusOf = (s: DataSourceFile['status']): KdrFileStatus =>
  s === 'ocr-pending' ? 'pending' : s === 'processing' ? 'parsing' : s === 'error' ? 'failed' : 'parsed'

function DataProcessing() {
  const { lang } = useLanguage()
  const [activeTab, setActiveTab] = useState<'structured' | 'unstructured'>('structured')
  const [uploadExpanded, setUploadExpanded] = useState(false)
  const [uploadPanelTab, setUploadPanelTab] = useState<'structured' | 'unstructured'>('structured')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  // 数据源浏览视图：card（按类型分区）/ list（总览全部数据源便于横向对比）
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [isSyncing, setIsSyncing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  // 结构化数据「数据应用」子模块：Database List / MUS Sampling
  const [dataAppTab, setDataAppTab] = useState<'db' | 'mus'>('db')
  // MUS 任务列表排序
  const [musSortKey, setMusSortKey] = useState<'name' | 'createdBy' | 'status'>('name')
  const [musSortDir, setMusSortDir] = useState<'asc' | 'desc'>('asc')
  const toggleMusSort = (key: 'name' | 'createdBy' | 'status') => {
    if (musSortKey === key) setMusSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setMusSortKey(key); setMusSortDir('asc') }
  }

  const isZh = lang === 'zh'

  const structuredData = dataSources.filter(d => d.category === 'structured')
  const unstructuredData = dataSources.filter(d => d.category === 'unstructured')
  // 当前页签对应的数据源集合 —— 下方「数据源」「数据应用」两个区块均跟随该选择
  const activeSources = activeTab === 'structured' ? structuredData : unstructuredData

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
      {/* === 顶部合并条：页面标识 + Audit File Pool（原「页面标题行」与「同步按钮行」合并为一条） === */}
      <div className="dp-topbar">
        <div className="dp-header-main">
          <div className="dp-header-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div>
            <h1 className="dp-title">{t('Data Processing Engine', 'Data Processing Engine')}</h1>
            <span className="dp-subtitle">{t('财务数据采集 · 清洗 · 转换与分析处理中心', 'Financial data collection · cleansing · transformation & analysis center')}</span>
          </div>
        </div>

        {/* 同步动作 + 文件池状态（状态小字并排于按钮右侧，标题区不再重复描述） */}
        <div className="dp-pool-bar">
          <button className={`dp-sync-btn ${isSyncing ? 'syncing' : ''}`} onClick={handleSyncPBC} disabled={isSyncing}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            {isSyncing ? t('同步中...', 'Syncing...') : t('同步 Audit File Pool', 'Sync Audit File Pool')}
          </button>
          <span className="pool-meta">
            <i className="pool-dot" />{t('已连接', 'Connected')}
            <em>·</em><b>{dataSources.length}</b>{t('个数据源', 'sources')}
            <em>·</em><b>{dataSources.reduce((s, d) => s + d.fileCount, 0)}</b>{t('个文件', 'files')}
            <em>·</em>{t('上次同步 2 分钟前', 'Last synced 2 min ago')}
          </span>
        </div>
      </div>

      {/* === 数据类型工作区：区域1 为页签，区域2/3 同处一个面板并跟随页签切换 === */}
      <div className="dp-workspace">
        {/* 区域1 —— 数据类型页签：其选择决定下方数据源与数据应用的展示内容 */}
        <div className="dp-type-tabs" role="tablist" aria-label={t('数据类型', 'Data type')}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'structured'}
            className={`dp-type-card ${activeTab === 'structured' ? 'active' : ''}`}
            onClick={() => setActiveTab('structured')}
          >
            <span className="dtc-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            </span>
            <span className="dtc-text">
              <span className="dtc-title">
                {t('结构化数据', 'Structured Data')}
                <span className="dp-section-count">{structuredData.length}</span>
              </span>
              <span className="dtc-sub">{t('Database List · MUS 抽样', 'Database List · MUS Sampling')}</span>
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'unstructured'}
            className={`dp-type-card ${activeTab === 'unstructured' ? 'active' : ''}`}
            onClick={() => setActiveTab('unstructured')}
          >
            <span className="dtc-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </span>
            <span className="dtc-text">
              <span className="dtc-title">
                {t('非结构化数据', 'Unstructured Data')}
                <span className="dp-section-count">{unstructuredData.length}</span>
              </span>
              <span className="dtc-sub">{t('KDR 文档识别 · 字段抽取', 'KDR recognition · field extraction')}</span>
            </span>
          </button>
        </div>

        <div className="dp-workspace-body">
          {/* 区域2 —— 当前页签下的数据源列表 */}
          <section className="dp-subsection">
            <div className="dp-subsection-head">
              <h2 className="dp-subsection-title">
                <span className={`section-dot ${activeTab === 'structured' ? 'dot-blue' : 'dot-purple'}`} />
                {t('数据源', 'Data Sources')}
                <span className="dp-section-count">{activeSources.length}</span>
              </h2>
              <div className="dp-source-actions">
                <div className="dp-view-toggle" role="group" aria-label={t('视图切换', 'View mode')}>
                  <button type="button" className={viewMode === 'card' ? 'active' : ''} onClick={() => setViewMode('card')} title={t('卡片视图', 'Card view')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  </button>
                  <button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title={t('列表视图', 'List view')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  </button>
                </div>
                <button className="dp-upload-file-btn" onClick={() => setUploadExpanded(true)}>
                  <i className="fas fa-plus"></i> Upload File
                </button>
              </div>
            </div>

            {viewMode === 'card' ? (
              <div className="dp-grid">
                {activeSources.map(ds => renderCard(ds))}
              </div>
            ) : (
              renderSourceList(activeSources)
            )}
          </section>

          {/* 区域3 —— 当前页签对应的数据应用：结构化 → Database List / MUS Sampling，非结构化 → KDR */}
          <section className="dp-subsection dp-subsection-app">
            {activeTab === 'structured' ? renderDataApplication() : renderKdrPlatform()}
          </section>
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

  // --- 数据源列表视图：一屏总览全部数据源，便于横向对比 ---
  function renderSourceList(list: DataSource[]) {
    if (list.length === 0) {
      return <div className="dp-source-list dp-source-list-empty">{t('暂无数据源', 'No data source yet')}</div>
    }
    return (
      <div className="dp-source-list">
        <table className="dp-source-table">
          <thead>
            <tr>
              <th>{t('数据源', 'Data source')}</th>
              <th>{t('类型', 'Type')}</th>
              <th>{t('状态', 'Status')}</th>
              <th className="num">{t('文件数', 'Files')}</th>
              <th className="num">{t('大小', 'Size')}</th>
              <th>{t('最后同步', 'Last sync')}</th>
              <th>{t('来源', 'Source')}</th>
              <th className="sl-arrow" aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {list.map(ds => {
              const meta = typeMeta[ds.typeKey] || typeMeta.gl
              const sc = statusConfig(ds.status)
              const st = ds.sourceFrom ? sourceTagConfig(ds.sourceFrom) : null
              return (
                <tr key={ds.id} className={expandedId === ds.id ? 'row-active' : ''} onClick={() => toggleExpand(ds.id)}>
                  <td>
                    <span className="sl-name">
                      <span className="sl-icon" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</span>
                      {ds.name}
                    </span>
                  </td>
                  <td className="sl-type">{isZh ? meta.labelZh : meta.labelEn}</td>
                  <td><span className="dc-status-pill" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span></td>
                  <td className="num">{ds.fileCount}</td>
                  <td className="num">{ds.totalSize}</td>
                  <td className="sl-time">{isZh ? ds.lastSync : (ds.lastSyncEn || ds.lastSync)}</td>
                  <td>{st ? <span className="dc-source-tag" style={{ background: st.bg, color: st.color }}>{st.label}</span> : <span className="sl-dash">—</span>}</td>
                  <td className="sl-arrow">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // --- 数据应用区（结构化数据专属）：Database List / MUS Sampling ---
  function renderDataApplication() {
    return (
      <div className="dp-data-application">
        <div className="dp-da-header">
          <h2 className="dp-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            {t('数据应用', 'Data Application')}
          </h2>
        </div>

        <div className="dp-da-body">
          {/* 左侧：子模块切换（Database List / MUS Sampling）
              MUS 模块采用紫色作为强调色，与 Database List 的蓝色主色区分 */}
          <div className="dp-mus-sidebar dp-mus-sidebar-left" data-accent={dataAppTab === 'mus' ? 'mus' : 'db'}>
            <button className="mus-tab" data-active={dataAppTab === 'db'} onClick={() => setDataAppTab('db')}>
              <span className="mus-tab-text">Database List</span>
            </button>
            <button className="mus-tab" data-active={dataAppTab === 'mus'} onClick={() => setDataAppTab('mus')}>
              <span className="mus-tab-text">MUS Sampling</span>
            </button>
          </div>

          {dataAppTab === 'db' ? renderDatabaseList() : renderMusSampling()}
        </div>
      </div>
    )
  }

  // --- 子模块一：Database List ---
  function renderDatabaseList() {
    return (
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
    )
  }

  // --- 子模块二：MUS Sampling（以任务为单位管理抽样作业） ---
  function renderMusSampling() {
    const sortedTasks = [...MUS_TASKS].sort((a, b) => {
      const av = musSortKey === 'name' ? a.name : musSortKey === 'createdBy' ? a.createdBy : a.status
      const bv = musSortKey === 'name' ? b.name : musSortKey === 'createdBy' ? b.createdBy : b.status
      const r = av.localeCompare(bv)
      return musSortDir === 'asc' ? r : -r
    })

    const sortIcon = (key: 'name' | 'createdBy' | 'status') => {
      const active = musSortKey === key
      const asc = musSortDir === 'asc'
      return (
        <svg className="mus-sort-icon" data-active={active} width="9" height="9" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          {active
            ? (asc ? <polyline points="6 15 12 9 18 15" /> : <polyline points="6 9 12 15 18 9" />)
            : (<><polyline points="7 10 12 5 17 10" /><polyline points="7 14 12 19 17 14" /></>)}
        </svg>
      )
    }

    const statusLabel = (s: MusTask['status']) =>
      s === 'processing' ? t('处理中', 'Processing') : s === 'completed' ? t('已完成', 'Completed') : t('失败', 'Failed')

    return (
      <div className="mus-panel">
        {/* 适用范围与默认参数说明 + 文档指引 */}
        <div className="mus-guide">
          <div className="mus-guide-body">
            <p className="mus-guide-lead">{t('MUS 抽样引擎仅适用于以下场景：', 'The MUS sampling engine is only applicable for:')}</p>
            <ul className="mus-guide-list">
              <li>
                {isZh
                  ? <><strong>多个实体</strong>就同一审计程序使用 MUS 抽样（即所有数据文件格式相同，且抽样参数一致：抽样字段、包含字段、抽样值）</>
                  : <><strong>Multiple entities</strong> which use MUS for sampling for a same audit procedure (i.e. all data files are in the same file format with the same sampling parameters (field to be sampled, field to be included, value to sample)</>}
              </li>
              <li>
                {isZh
                  ? <>同一实体下使用 MUS 抽样的<strong>多个审计程序</strong>，且重要性水平、AMPT 及其他抽样参数一致</>
                  : <>Multiple audit procedures using MUS for sampling under <strong>one entity</strong> with same materiality, AMPT and other sampling parameters</>}
              </li>
            </ul>
            <p className="mus-guide-lead">{t('以下 MUS 参数已设为默认值：', 'The following MUS parameters are set as default:')}</p>
            <ul className="mus-guide-list">
              <li>
                {isZh
                  ? <>预期错报的默认值设为 <strong>零</strong></>
                  : <>The default value for Expected misstatement is set as <strong>zero</strong></>}
              </li>
              <li>
                {isZh
                  ? <>默认不执行<strong>汇总抽样</strong>（即管理层无法提供完整的抽样单元清单）</>
                  : <>Default not to perform <strong>Aggregate sampling</strong> (i.e management is unable to provide a complete list of sampling units)</>}
              </li>
            </ul>
          </div>
          {/* 文档指引图标：新标签打开 KCw 文档 PDF，避免 href="#" 被哈希路由当作返回首页 */}
          <a
            href={`${import.meta.env.BASE_URL}docs/KCw-documentation-guidance.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="mus-guide-link"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>
            {t('KCw 文档指引', 'KCw documentation guidance')}
          </a>
        </div>

        {/* 新建 MUS 任务 */}
        <div className="mus-toolbar">
          <button className="mus-create-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t('创建 MUS 任务', 'Create MUS task')}
          </button>
        </div>

        {/* MUS 任务列表 */}
        <div className="dp-db-table-wrap">
          <table className="dp-db-table mus-task-table">
            <thead>
              <tr>
                <th className="mus-th-sort" onClick={() => toggleMusSort('name')}>
                  <span>{t('任务名称', 'Task Name')}</span>{sortIcon('name')}
                </th>
                <th>{t('任务类型', 'Task Type')}</th>
                <th>{t('文件类型', 'File Type')}</th>
                <th className="mus-col-num">{t('实体数量', 'Number of entities')}</th>
                <th className="mus-col-num">{t('文件数量', 'Number of files')}</th>
                <th className="mus-th-sort" onClick={() => toggleMusSort('createdBy')}>
                  <span>{t('创建人', 'Created by')}</span>{sortIcon('createdBy')}
                </th>
                <th>{t('创建时间', 'Created time')}</th>
                <th className="mus-th-sort" onClick={() => toggleMusSort('status')}>
                  <span>{t('状态', 'Status')}</span>{sortIcon('status')}
                </th>
                <th>{t('操作', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map(task => (
                <tr key={task.id}>
                  <td className="mus-task-name">{task.name}</td>
                  <td className="mus-ellipsis" title={isZh ? task.taskTypeCn : task.taskType}>{isZh ? task.taskTypeCn : task.taskType}</td>
                  <td className="mus-ellipsis" title={isZh ? task.fileTypeCn : task.fileType}>{isZh ? task.fileTypeCn : task.fileType}</td>
                  <td className="mus-col-num">{task.entities}</td>
                  <td className="mus-col-num">{task.files}</td>
                  <td className="mus-ellipsis" title={task.createdBy}>{task.createdBy}</td>
                  <td className="mus-nowrap">{task.createdAt}</td>
                  <td><span className={`mus-task-status ${task.status}`}>{statusLabel(task.status)}</span></td>
                  <td className="mus-row-actions">
                    <a href="#" className="mus-action-view">{t('查看', 'View')}</a>
                    <a href="#" className="mus-action-delete">{t('删除', 'Delete')}</a>
                  </td>
                </tr>
              ))}
              {sortedTasks.length === 0 && (
                <tr><td colSpan={9} className="mus-task-empty">{t('暂无 MUS 任务', 'No MUS task yet')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // --- 非结构化数据专属：KDR（内嵌于本界面的文档识别与字段抽取工作区） ---
  function renderKdrPlatform() {
    // 以上方「非结构化数据」数据源中的文件作为 KDR 工作区的初始文件列表
    const kdrFiles: KdrFile[] = unstructuredData.flatMap((ds, dsIdx) =>
      ds.files.map((f, i) => {
        const status = kdrStatusOf(f.status)
        return {
          id: f.id,
          name: f.name,
          fileType: f.name.split('.').pop()?.toUpperCase() || 'FILE',
          status,
          size: f.size,
          source: ds.name,
          uploader: DEMO_PEOPLE[(dsIdx + i + 1) % DEMO_PEOPLE.length],
          uploadedAt: f.uploadDate,
          pages: 2 + (i % 4),
          // 已完成 OCR 的文件直接带上抽取结果；「就绪」的文件留空，便于演示「自动抽取」
          fields: f.status === 'ocr-done' ? buildExtractedFields(f.name) : [],
        }
      })
    )

    return (
      <div className="dp-data-application dp-kdr">
        <div className="dp-da-header kdr-da-header">
          <h2 className="dp-section-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#805AD5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            KDR
          </h2>
          <div className="dp-da-tags">
            <span className="dp-da-scope kdr-scope">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              {t('文档识别 · 字段抽取', 'Document recognition · Field extraction')}
            </span>
          </div>
        </div>

        <KdrWorkbench files={kdrFiles} onUpload={() => setUploadExpanded(true)} />
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
