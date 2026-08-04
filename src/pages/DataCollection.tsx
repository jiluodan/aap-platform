import { useState } from 'react'
import './DataCollection.css'

interface DataSource {
  id: string
  name: string
  type: 'excel' | 'erp' | 'database' | 'api'
  status: 'connected' | 'disconnected' | 'syncing'
  lastSync: string
  records: number
}

const dataSources: DataSource[] = [
  { id: '1', name: '总账数据', type: 'excel', status: 'connected', lastSync: '2026-07-28 14:30', records: 15420 },
  { id: '2', name: '明细账数据', type: 'excel', status: 'connected', lastSync: '2026-07-28 14:32', records: 89300 },
  { id: '3', name: 'SAP ERP系统', type: 'erp', status: 'syncing', lastSync: '同步中...', records: 0 },
  { id: '4', name: '银行对账单', type: 'excel', status: 'connected', lastSync: '2026-07-27 09:15', records: 1250 },
  { id: '5', name: '凭证影像库', type: 'database', status: 'disconnected', lastSync: '未连接', records: 0 },
]

const typeIcons: Record<string, string> = {
  excel: '📊',
  erp: '🖥️',
  database: '🗄️',
  api: '🔌',
}

function DataCollection() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleUpload = () => {
    setUploading(true)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="data-collection">
      <div className="collection-header">
        <div>
          <h2 className="page-title">数据采集</h2>
          <p className="page-subtitle">Data Collection & Import</p>
        </div>
      </div>

      {/* 上传区域 */}
      <div className="upload-section">
        <div className="upload-zone">
          <div className="upload-icon">📁</div>
          <h3>拖拽文件到此处上传</h3>
          <p>支持 Excel、CSV、TXT、XML 格式</p>
          <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
            {uploading ? '上传中...' : '选择文件'}
          </button>
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>

        <div className="upload-tips">
          <h4>📋 上传须知</h4>
          <ul>
            <li>请确保数据文件格式正确，包含必要的表头</li>
            <li>建议将大文件拆分为多个小文件上传</li>
            <li>上传前请检查数据的完整性和准确性</li>
            <li>敏感数据请加密后再上传</li>
          </ul>
        </div>
      </div>

      {/* 数据源列表 */}
      <div className="data-sources">
        <h3 className="section-title">数据源管理</h3>
        <div className="sources-grid">
          {dataSources.map(source => (
            <div key={source.id} className={`source-card ${source.status}`}>
              <div className="source-header">
                <span className="source-icon">{typeIcons[source.type]}</span>
                <span className={`source-status ${source.status}`}>
                  {source.status === 'connected' ? '已连接' : source.status === 'syncing' ? '同步中' : '未连接'}
                </span>
              </div>
              <h4 className="source-name">{source.name}</h4>
              <div className="source-meta">
                <div className="meta-item">
                  <span className="meta-label">类型</span>
                  <span className="meta-value">{source.type.toUpperCase()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">记录数</span>
                  <span className="meta-value">{source.records.toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">最后同步</span>
                  <span className="meta-value">{source.lastSync}</span>
                </div>
              </div>
              <div className="source-actions">
                <button className="source-btn primary">同步</button>
                <button className="source-btn">配置</button>
                <button className="source-btn">预览</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DataCollection
