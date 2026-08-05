import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './DataProcessing.css'

interface DataSource {
  id: string
  name: string
  type: 'gl' | 'tb' | 'subledger' | 'bank' | 'tax'
  status: 'connected' | 'syncing' | 'disconnected'
  records: number
  lastSync: string
  size: string
}

const dataSources: DataSource[] = [
  { id: '1', name: 'General Ledger', type: 'gl', status: 'connected', records: 15420, lastSync: '2026-07-28 14:30', size: '2.3MB' },
  { id: '2', name: 'Trial Balance', type: 'tb', status: 'connected', records: 320, lastSync: '2026-07-28 14:32', size: '156KB' },
  { id: '3', name: 'AR Subledger', type: 'subledger', status: 'syncing', records: 0, lastSync: '同步中...', size: '-' },
  { id: '4', name: 'Bank Statements', type: 'bank', status: 'connected', records: 1250, lastSync: '2026-07-27 09:15', size: '890KB' },
  { id: '5', name: 'Tax Returns', type: 'tax', status: 'disconnected', records: 0, lastSync: '未连接', size: '-' },
]

const typeMap = {
  gl: { label: '总账', icon: '📊', color: '#00338D' },
  tb: { label: '试算平衡表', icon: '⚖️', color: '#00A3A1' },
  subledger: { label: '明细账', icon: '📋', color: '#805AD5' },
  bank: { label: '银行', icon: '🏦', color: '#D69E2E' },
  tax: { label: '税务', icon: '📝', color: '#E4002B' },
}

function DataProcessing() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

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

  return (
    <div className="data-processing animate-fade-in">
      <div className="dp-breadcrumb">
        <button className="breadcrumb-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6-6-6"/>
          </svg>
          客户总览
        </button>
        <span className="breadcrumb-sep">/</span>
        <button className="breadcrumb-back" onClick={() => navigate(`/engagement/${clientId}/${engagementId}`)}>
          1668465
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Data Processing Center</span>
      </div>

      <div className="dp-header">
        <div>
          <h1 className="dp-title">Data Processing Center</h1>
          <p className="dp-subtitle">财务数据采集、清洗、转换与分析处理中心</p>
        </div>
      </div>

      {/* 上传区域 */}
      <div className="dp-upload-section">
        <div className="dp-upload-zone" onClick={handleUpload}>
          <div className="dp-upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="1.5">
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

      {/* 数据源 */}
      <div className="dp-sources">
        <h2 className="dp-section-title">Connected Data Sources</h2>
        <div className="dp-sources-grid">
          {dataSources.map(source => (
            <div key={source.id} className={`dp-source-card card-lift status-${source.status}`}>
              <div className="dp-source-header">
                <div className="dp-source-icon" style={{ background: `${typeMap[source.type].color}15`, color: typeMap[source.type].color }}>
                  <span style={{ fontSize: '24px' }}>{typeMap[source.type].icon}</span>
                </div>
                <span className={`dp-source-status ${source.status}`}>
                  {source.status === 'connected' ? '已连接' : source.status === 'syncing' ? '同步中' : '未连接'}
                </span>
              </div>
              <h4 className="dp-source-name">{source.name}</h4>
              <span className="dp-source-type">{typeMap[source.type].label}</span>
              <div className="dp-source-meta">
                <div className="dp-meta-item">
                  <span className="dp-meta-label">记录数</span>
                  <span className="dp-meta-value">{source.records > 0 ? source.records.toLocaleString() : '-'}</span>
                </div>
                <div className="dp-meta-item">
                  <span className="dp-meta-label">大小</span>
                  <span className="dp-meta-value">{source.size}</span>
                </div>
                <div className="dp-meta-item">
                  <span className="dp-meta-label">最后同步</span>
                  <span className="dp-meta-value">{source.lastSync}</span>
                </div>
              </div>
              <div className="dp-source-actions">
                <button className="dp-action-btn primary">同步</button>
                <button className="dp-action-btn">配置</button>
                <button className="dp-action-btn">预览</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DataProcessing
