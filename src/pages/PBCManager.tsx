import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './PBCManager.css'

interface PBCItem {
  id: string
  category: string
  description: string
  requestedBy: string
  requestedDate: string
  dueDate: string
  status: 'pending' | 'received' | 'reviewed' | 'accepted'
  priority: 'high' | 'medium' | 'low'
}

const pbcItems: PBCItem[] = [
  { id: '1', category: '财务报表', description: '2025年度审计财务报表（草稿版）', requestedBy: '张三', requestedDate: '2026-07-01', dueDate: '2026-07-10', status: 'accepted', priority: 'high' },
  { id: '2', category: '银行资料', description: '2025年12月31日银行对账单及余额调节表', requestedBy: '李四', requestedDate: '2026-07-02', dueDate: '2026-07-12', status: 'received', priority: 'high' },
  { id: '3', category: '税务资料', description: '2025年度企业所得税汇算清缴申报表', requestedBy: '王五', requestedDate: '2026-07-03', dueDate: '2026-07-15', status: 'pending', priority: 'medium' },
  { id: '4', category: '合同协议', description: '重大销售合同清单及样本（金额>100万）', requestedBy: '赵六', requestedDate: '2026-07-05', dueDate: '2026-07-18', status: 'pending', priority: 'high' },
  { id: '5', category: '法律文件', description: '未决诉讼及或有事项声明书', requestedBy: '钱七', requestedDate: '2026-07-06', dueDate: '2026-07-20', status: 'reviewed', priority: 'medium' },
  { id: '6', category: '内部控制', description: '2025年度内部控制自我评价报告', requestedBy: '孙八', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'pending', priority: 'low' },
]

const statusMap = {
  pending: { label: '待提供', color: '#D69E2E', bg: '#FFFBEB' },
  received: { label: '已收到', color: '#3182CE', bg: '#EBF4FF' },
  reviewed: { label: '已审核', color: '#805AD5', bg: '#FAF5FF' },
  accepted: { label: '已接受', color: '#00A3A1', bg: '#E6FFFA' },
}

function PBCManager() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? pbcItems
    : pbcItems.filter(item => item.status === filter)

  const stats = {
    total: pbcItems.length,
    pending: pbcItems.filter(i => i.status === 'pending').length,
    received: pbcItems.filter(i => i.status === 'received').length,
    accepted: pbcItems.filter(i => i.status === 'accepted').length,
  }

  return (
    <div className="pbc-manager animate-fade-in">
      <div className="pbc-breadcrumb">
        <button className="breadcrumb-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6-6-6"/>
          </svg>
          客户总览
        </button>
        <span className="breadcrumb-sep">/</span>
        <button className="breadcrumb-back" onClick={() => navigate(`/engagement/${clientId}/${engagementId}`)}>
          DEMO-ROBOT-2025
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">PBC Manager</span>
      </div>

      <div className="pbc-header">
        <div>
          <h1 className="pbc-title">PBC Manager</h1>
          <p className="pbc-subtitle">客户资料请求管理中心 — 跟踪PBC清单的收集、审核与归档</p>
        </div>
        <button className="pbc-new-btn">➕ 新增PBC请求</button>
      </div>

      <div className="pbc-stats">
        <div className="pbc-stat">
          <div className="pbc-stat-icon">📋</div>
          <div>
            <span className="pbc-stat-num">{stats.total}</span>
            <span className="pbc-stat-label">总请求</span>
          </div>
        </div>
        <div className="pbc-stat">
          <div className="pbc-stat-icon">⏳</div>
          <div>
            <span className="pbc-stat-num">{stats.pending}</span>
            <span className="pbc-stat-label">待提供</span>
          </div>
        </div>
        <div className="pbc-stat">
          <div className="pbc-stat-icon">📥</div>
          <div>
            <span className="pbc-stat-num">{stats.received}</span>
            <span className="pbc-stat-label">已收到</span>
          </div>
        </div>
        <div className="pbc-stat">
          <div className="pbc-stat-icon">✅</div>
          <div>
            <span className="pbc-stat-num">{stats.accepted}</span>
            <span className="pbc-stat-label">已接受</span>
          </div>
        </div>
      </div>

      <div className="pbc-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>全部</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>待提供</button>
        <button className={filter === 'received' ? 'active' : ''} onClick={() => setFilter('received')}>已收到</button>
        <button className={filter === 'reviewed' ? 'active' : ''} onClick={() => setFilter('reviewed')}>已审核</button>
        <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>已接受</button>
      </div>

      <div className="pbc-list">
        {filtered.map(item => (
          <div key={item.id} className={`pbc-item card-lift priority-${item.priority}`}>
            <div className="pbc-item-header">
              <span className="pbc-category">{item.category}</span>
              <span className="pbc-status" style={{ background: statusMap[item.status].bg, color: statusMap[item.status].color }}>
                {statusMap[item.status].label}
              </span>
            </div>
            <p className="pbc-desc">{item.description}</p>
            <div className="pbc-item-footer">
              <div className="pbc-dates">
                <span>请求: {item.requestedDate}</span>
                <span className={item.status === 'pending' ? 'due-soon' : ''}>截止: {item.dueDate}</span>
              </div>
              <div className="pbc-assignee">
                <div className="assignee-avatar">{item.requestedBy.charAt(0)}</div>
                <span>{item.requestedBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PBCManager
