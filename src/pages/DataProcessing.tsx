import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './DataProcessing.css'

// ===== Types =====
interface DataSourceFile {
  id: string
  name: string
  size: string
  uploadDate: string
  status: 'ready' | 'processing' | 'error'
}

interface DataSource {
  id: string
  name: string
  type: 'gl' | 'tb' | 'subledger' | 'bank' | 'tax'
  status: 'connected' | 'syncing' | 'disconnected'
  fileCount: number
  totalSize: string
  lastSync: string
  files: DataSourceFile[]
}

// ===== Demo Data =====
const dataSources: DataSource[] = [
  {
    id: '1', name: 'General Ledger', type: 'gl', status: 'connected',
    fileCount: 3, totalSize: '2.3MB', lastSync: '2026-07-28 14:30',
    files: [
      { id: 'gl-1', name: 'GL_2025_FullYear.xlsx', size: '1.2MB', uploadDate: '2026-07-28 14:30', status: 'ready' },
      { id: 'gl-2', name: 'GL_Q4_2025.xlsx', size: '680KB', uploadDate: '2026-07-28 14:28', status: 'ready' },
      { id: 'gl-3', name: 'GL_Adjustments.xlsx', size: '420KB', uploadDate: '2026-07-27 09:15', status: 'ready' },
    ]
  },
  {
    id: '2', name: 'Trial Balance', type: 'tb', status: 'connected',
    fileCount: 2, totalSize: '156KB', lastSync: '2026-07-28 14:32',
    files: [
      { id: 'tb-1', name: 'TB_Level4_202512.xlsx', size: '98KB', uploadDate: '2026-07-28 14:32', status: 'ready' },
      { id: 'tb-2', name: 'TB_Level3_202512.xlsx', size: '58KB', uploadDate: '2026-07-28 14:30', status: 'ready' },
    ]
  },
  {
    id: '3', name: 'AR Subledger', type: 'subledger', status: 'syncing',
    fileCount: 0, totalSize: '-', lastSync: '同步中...',
    files: []
  },
  {
    id: '4', name: 'Bank Statements', type: 'bank', status: 'connected',
    fileCount: 4, totalSize: '890KB', lastSync: '2026-07-27 09:15',
    files: [
      { id: 'bk-1', name: 'BankStmt_CNY_202512.pdf', size: '320KB', uploadDate: '2026-07-27 09:15', status: 'ready' },
      { id: 'bk-2', name: 'BankStmt_USD_202512.pdf', size: '280KB', uploadDate: '2026-07-27 09:14', status: 'ready' },
      { id: 'bk-3', name: 'BankRecon_202512.xlsx', size: '180KB', uploadDate: '2026-07-27 09:13', status: 'ready' },
      { id: 'bk-4', name: 'BankConfirmations.pdf', size: '110KB', uploadDate: '2026-07-26 16:20', status: 'ready' },
    ]
  },
  {
    id: '5', name: 'Tax Returns', type: 'tax', status: 'disconnected',
    fileCount: 0, totalSize: '-', lastSync: '未连接',
    files: []
  },
]

const typeMeta: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  gl: { label: '总账', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>, color: '#00338D', bg: '#e8edf5' },
  tb: { label: '试算平衡表', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>, color: '#00A3A1', bg: '#e6f7f7' },
  subledger: { label: '明细账', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color: '#805AD5', bg: '#f3effb' },
  bank: { label: '银行', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, color: '#D69E2E', bg: '#fefce8' },
  tax: { label: '税务', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, color: '#E4002B', bg: '#fef2f2' },
}

const statusConfig = {
  connected: { label: '已连接', color: '#00A3A1', bg: '#E6FFFA' },
  syncing: { label: '同步中', color: '#D69E2E', bg: '#FFFBEB' },
  disconnected: { label: '未连接', color: '#E4002B', bg: '#FFF5F5' },
}

const fileStatusMap = {
  ready: { label: '就绪', color: '#00A3A1', bg: '#E6FFFA' },
  processing: { label: '处理中', color: '#D69E2E', bg: '#FFFBEB' },
  error: { label: '异常', color: '#E4002B', bg: '#FFF5F5' },
}

function DataProcessing() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [expandedSource, setExpandedSource] = useState<string | null>(null)

  const handleUpload = () => {
    setUploading(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setUploading(false)
          return 100
        }
        return p + 8
      })
    }, 200)
  }

  const handleCardClick = (sourceId: string) => {
    if (expandedSource === sourceId) {
      setExpandedSource(null)
    } else {
      setExpandedSource(sourceId)
    }
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedSource(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="data-processing animate-fade-in">
      {/* Header */}
      <div className="dp-header">
        <div>
          <h1 className="dp-title">Data Processing Engine</h1>
          <p className="dp-subtitle">财务数据采集、清洗、转换与分析处理中心</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="dp-upload-section">
        <div className="dp-upload-zone" onClick={handleUpload}>
          <div className="dp-upload-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h3>拖拽文件到此处或点击上传</h3>
          <p>支持 Excel、CSV、TXT、XML 格式文件</p>
          {uploading && (
            <div className="dp-upload-progress">
              <div className="dp-progress-bar">
                <div className="dp-progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span>{progress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Connected Data Sources */}
      <div className="dp-sources">
        <h2 className="dp-section-title">Connected Data Sources</h2>
        <div className={`dp-sources-grid ${expandedSource ? 'grid-dimmed' : ''}`}>
          {dataSources.map(source => {
            const meta = typeMeta[source.type] || typeMeta.gl
            const sc = statusConfig[source.status]
            const isExpanded = expandedSource === source.id

            return (
              <div
                key={source.id}
                className={`dp-source-card ${isExpanded ? 'card-expanded' : 'card-lift'} status-${source.status}`}
                style={{ borderTop: `3px solid ${meta.color}` }}
                onClick={() => handleCardClick(source.id)}
              >
                {/* Card Header */}
                <div className="dp-card-header" style={{ background: meta.bg }}>
                  <div className="dp-card-icon" style={{ background: meta.color, color: '#fff' }}>
                    {meta.icon}
                  </div>
                  <div className="dp-card-title-wrap">
                    <h3 className="dp-card-name">{source.name}</h3>
                    <span className="dp-card-type">{meta.label}</span>
                  </div>
                  <span className="dp-status-badge" style={{ background: sc.bg, color: sc.color }}>
                    {sc.label}
                  </span>
                  {!isExpanded && (
                    <div className="dp-expand-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Summary Info */}
                <div className="dp-card-summary">
                  <div className="dp-summary-row">
                    <span className="dp-summary-label">文件数量</span>
                    <span className="dp-summary-value">{source.fileCount} 个文件</span>
                  </div>
                  <div className="dp-summary-row">
                    <span className="dp-summary-label">总大小</span>
                    <span className="dp-summary-value">{source.totalSize}</span>
                  </div>
                  <div className="dp-summary-row">
                    <span className="dp-summary-label">最后同步</span>
                    <span className="dp-summary-value dp-sync-value">{source.lastSync}</span>
                  </div>
                </div>

                {/* File List (inline preview) */}
                {!isExpanded && source.files.length > 0 && (
                  <div className="dp-file-preview">
                    {source.files.slice(0, 2).map(f => (
                      <div key={f.id} className="dp-preview-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span>{f.name}</span>
                      </div>
                    ))}
                    {source.files.length > 2 && (
                      <span className="dp-more-hint">+{source.files.length - 2} 更多</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Expanded Overlay */}
      {expandedSource && (
        <>
          <div className="dp-overlay-backdrop" onClick={() => setExpandedSource(null)} />
          <div className="dp-expanded-wrapper">
            {(() => {
              const source = dataSources.find(s => s.id === expandedSource)!
              const meta = typeMeta[source.type] || typeMeta.gl
              const sc = statusConfig[source.status]

              return (
                <div
                  className="dp-expanded-card"
                  style={{ borderTop: `4px solid ${meta.color}` }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Expanded Header */}
                  <div className="dp-card-header" style={{ background: meta.bg }}>
                    <div className="dp-card-icon" style={{ background: meta.color, color: '#fff' }}>
                      {meta.icon}
                    </div>
                    <div className="dp-card-title-wrap">
                      <h3 className="dp-card-name">{source.name}</h3>
                      <span className="dp-card-type">{meta.label}</span>
                    </div>
                    <span className="dp-status-badge" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    <button className="dp-close-btn" onClick={() => setExpandedSource(null)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>

                  {/* Summary Bar */}
                  <div className="dp-expanded-summary">
                    <div className="dp-exp-stat">
                      <span className="dp-exp-stat-num">{source.fileCount}</span>
                      <span className="dp-exp-stat-label">文件总数</span>
                    </div>
                    <div className="dp-exp-divider"></div>
                    <div className="dp-exp-stat">
                      <span className="dp-exp-stat-num">{source.totalSize}</span>
                      <span className="dp-exp-stat-label">总大小</span>
                    </div>
                    <div className="dp-exp-divider"></div>
                    <div className="dp-exp-stat">
                      <span className="dp-exp-stat-num">{source.lastSync}</span>
                      <span className="dp-exp-stat-label">最后同步</span>
                    </div>
                  </div>

                  {/* File List Table */}
                  <div className="dp-file-list">
                    {source.files.length > 0 ? (
                      <>
                        <div className="dp-file-list-header">
                          <span className="col-name">文件名</span>
                          <span className="col-size">大小</span>
                          <span className="col-date">上传时间</span>
                          <span className="col-status">状态</span>
                        </div>
                        {source.files.map(file => {
                          const fs = fileStatusMap[file.status]
                          return (
                            <div key={file.id} className="dp-file-row">
                              <span className="col-name dp-filename">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                {file.name}
                              </span>
                              <span className="col-size">{file.size}</span>
                              <span className="col-date">{file.uploadDate}</span>
                              <span className="col-status">
                                <span className="dp-file-status" style={{ background: fs.bg, color: fs.color }}>{fs.label}</span>
                              </span>
                            </div>
                          )
                        })}
                      </>
                    ) : (
                      <div className="dp-empty-files">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                        <p>暂无文件数据</p>
                        <span>上传文件后将在此处显示</span>
                      </div>
                    )}
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

export default DataProcessing
