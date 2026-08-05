import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './WorkPaperStation.css'

interface WorkPaper {
  id: string
  code: string
  title: string
  procedure: string
  procedureCode: string
  preparer: string
  reviewer: string
  status: 'draft' | 'pending_review' | 'reviewed' | 'approved'
  risk: 'high' | 'medium' | 'low'
  lastModified: string
  findings: number
}

const workPapers: WorkPaper[] = [
  { id: '1', code: 'WP-001', title: 'Vouching Test - Revenue', procedure: 'Vouching', procedureCode: 'AP-001', preparer: '张三', reviewer: '张经理', status: 'approved', risk: 'high', lastModified: '2026-07-28', findings: 0 },
  { id: '2', code: 'WP-002', title: 'JE Testing - Unusual Entries', procedure: 'JE Testing', procedureCode: 'AP-002', preparer: '李四', reviewer: '张经理', status: 'pending_review', risk: 'high', lastModified: '2026-07-27', findings: 3 },
  { id: '3', code: 'WP-003', title: 'Credit Review - AR Aging', procedure: 'Credit Review', procedureCode: 'AP-003', preparer: '王五', reviewer: '李经理', status: 'draft', risk: 'high', lastModified: '2026-07-26', findings: 0 },
  { id: '4', code: 'WP-004', title: 'Inventory Count Observation', procedure: 'Inventory Observation', procedureCode: 'AP-004', preparer: '赵六', reviewer: '李经理', status: 'reviewed', risk: 'medium', lastModified: '2026-07-25', findings: 1 },
  { id: '5', code: 'WP-005', title: 'Bank Confirmation Summary', procedure: 'Bank Confirmation', procedureCode: 'AP-005', preparer: '钱七', reviewer: '赵经理', status: 'approved', risk: 'medium', lastModified: '2026-07-24', findings: 0 },
  { id: '6', code: 'WP-006', title: 'Analytical Review - Revenue', procedure: 'Analytical Review', procedureCode: 'AP-006', preparer: '孙八', reviewer: '张经理', status: 'draft', risk: 'medium', lastModified: '2026-07-23', findings: 0 },
]

const statusMap = {
  draft: { label: '草稿', color: '#718096', bg: '#F7FAFC' },
  pending_review: { label: '待复核', color: '#D69E2E', bg: '#FFFBEB' },
  reviewed: { label: '已复核', color: '#3182CE', bg: '#EBF4FF' },
  approved: { label: '已批准', color: '#00A3A1', bg: '#E6FFFA' },
}

function WorkPaperStation() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [selectedWP, setSelectedWP] = useState<WorkPaper | null>(null)

  const filtered = filter === 'all'
    ? workPapers
    : workPapers.filter(wp => wp.status === filter)

  return (
    <div className="workpaper-station animate-fade-in">
      {/* 面包屑 */}
      <div className="wp-breadcrumb">
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
        <span className="breadcrumb-current">Work Paper Station</span>
      </div>

      {/* 页面标题 */}
      <div className="wp-header">
        <div>
          <h1 className="wp-title">Work Paper Station</h1>
          <p className="wp-subtitle">审计底稿管理工作站 — 关联各Audit Procedure生成的底稿</p>
        </div>
        <button className="wp-new-btn">➕ 新建底稿</button>
      </div>

      {/* 统计 */}
      <div className="wp-stats">
        <div className="wp-stat">
          <span className="wp-stat-num">{workPapers.length}</span>
          <span className="wp-stat-label">底稿总数</span>
        </div>
        <div className="wp-stat">
          <span className="wp-stat-num">{workPapers.filter(wp => wp.status === 'approved').length}</span>
          <span className="wp-stat-label">已批准</span>
        </div>
        <div className="wp-stat">
          <span className="wp-stat-num">{workPapers.filter(wp => wp.status === 'pending_review').length}</span>
          <span className="wp-stat-label">待复核</span>
        </div>
        <div className="wp-stat">
          <span className="wp-stat-num">{workPapers.reduce((sum, wp) => sum + wp.findings, 0)}</span>
          <span className="wp-stat-label">发现事项</span>
        </div>
      </div>

      {/* 过滤器 */}
      <div className="wp-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>全部</button>
        <button className={filter === 'draft' ? 'active' : ''} onClick={() => setFilter('draft')}>草稿</button>
        <button className={filter === 'pending_review' ? 'active' : ''} onClick={() => setFilter('pending_review')}>待复核</button>
        <button className={filter === 'reviewed' ? 'active' : ''} onClick={() => setFilter('reviewed')}>已复核</button>
        <button className={filter === 'approved' ? 'active' : ''} onClick={() => setFilter('approved')}>已批准</button>
      </div>

      {/* 底稿列表 */}
      <div className="wp-layout">
        <div className={`wp-list ${selectedWP ? 'narrow' : ''}`}>
          {filtered.map(wp => (
            <div
              key={wp.id}
              className={`wp-item ${selectedWP?.id === wp.id ? 'selected' : ''}`}
              onClick={() => setSelectedWP(wp)}
            >
              <div className="wp-item-header">
                <span className="wp-item-code">{wp.code}</span>
                <span className="wp-item-status" style={{ background: statusMap[wp.status].bg, color: statusMap[wp.status].color }}>
                  {statusMap[wp.status].label}
                </span>
              </div>
              <h4 className="wp-item-title">{wp.title}</h4>
              <div className="wp-item-procedure">
                <span className="proc-tag">{wp.procedureCode}</span>
                <span>{wp.procedure}</span>
              </div>
              <div className="wp-item-meta">
                <span>👤 {wp.preparer}</span>
                <span>📅 {wp.lastModified}</span>
                {wp.findings > 0 && <span className="findings-badge">⚠️ {wp.findings} 发现</span>}
              </div>
            </div>
          ))}
        </div>

        {/* 底稿详情 */}
        {selectedWP && (
          <div className="wp-detail animate-slide-in">
            <div className="wp-detail-header">
              <h3>{selectedWP.title}</h3>
              <button className="wp-detail-close" onClick={() => setSelectedWP(null)}>✕</button>
            </div>
            <div className="wp-detail-info">
              <div className="wp-info-row">
                <span className="wp-info-label">底稿编号</span>
                <span className="wp-info-value">{selectedWP.code}</span>
              </div>
              <div className="wp-info-row">
                <span className="wp-info-label">关联程序</span>
                <span className="wp-info-value">{selectedWP.procedureCode} - {selectedWP.procedure}</span>
              </div>
              <div className="wp-info-row">
                <span className="wp-info-label">编制人</span>
                <span className="wp-info-value">{selectedWP.preparer}</span>
              </div>
              <div className="wp-info-row">
                <span className="wp-info-label">复核人</span>
                <span className="wp-info-value">{selectedWP.reviewer}</span>
              </div>
              <div className="wp-info-row">
                <span className="wp-info-label">风险等级</span>
                <span className={`wp-info-value risk-${selectedWP.risk}`}>
                  {selectedWP.risk === 'high' ? '高风险' : selectedWP.risk === 'medium' ? '中风险' : '低风险'}
                </span>
              </div>
            </div>
            <div className="wp-detail-preview">
              <h4>底稿预览</h4>
              <div className="wp-preview-content">
                <div className="preview-section">
                  <h5>审计目标</h5>
                  <p>验证{selectedWP.procedure}相关认定的准确性和完整性。</p>
                </div>
                <div className="preview-section">
                  <h5>执行程序</h5>
                  <ol>
                    <li>获取相关明细账和总账数据</li>
                    <li>执行{selectedWP.procedure}测试</li>
                    <li>检查支持性文件和原始凭证</li>
                    <li>记录测试结果和异常情况</li>
                  </ol>
                </div>
                <div className="preview-section">
                  <h5>审计结论</h5>
                  <p>经测试，未发现重大异常，相关认定在所有重大方面公允反映。</p>
                </div>
              </div>
            </div>
            <div className="wp-detail-actions">
              <button className="wp-btn primary">编辑底稿</button>
              <button className="wp-btn">提交复核</button>
              <button className="wp-btn">导出PDF</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkPaperStation
