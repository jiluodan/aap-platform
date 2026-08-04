import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './AuditProcedures.css'

interface Procedure {
  id: string
  code: string
  name: string
  description: string
  category: 'substantive' | 'analytical' | 'test-of-controls'
  status: 'not-started' | 'in-progress' | 'completed' | 'reviewed'
  risk: 'high' | 'medium' | 'low'
  workpapers: number
  assignedTo: string
}

const procedures: Procedure[] = [
  {
    id: 'p1', code: 'AP-001', name: 'Vouching',
    description: '凭证抽查测试，验证交易的真实性和准确性，检查支持性文件',
    category: 'substantive', status: 'in-progress', risk: 'high',
    workpapers: 3, assignedTo: '张三',
  },
  {
    id: 'p2', code: 'AP-002', name: 'JE Testing',
    description: '日记账分录测试，识别异常和未经授权的会计分录',
    category: 'substantive', status: 'in-progress', risk: 'high',
    workpapers: 2, assignedTo: '李四',
  },
  {
    id: 'p3', code: 'AP-003', name: 'Credit Review',
    description: '应收账款信用审查，评估坏账准备计提的合理性',
    category: 'substantive', status: 'not-started', risk: 'high',
    workpapers: 0, assignedTo: '王五',
  },
  {
    id: 'p4', code: 'AP-004', name: 'Inventory Observation',
    description: '存货监盘程序，验证存货的存在性和状况',
    category: 'substantive', status: 'completed', risk: 'medium',
    workpapers: 2, assignedTo: '赵六',
  },
  {
    id: 'p5', code: 'AP-005', name: 'Bank Confirmation',
    description: '银行函证程序，验证银行存款和借款余额',
    category: 'substantive', status: 'completed', risk: 'medium',
    workpapers: 1, assignedTo: '钱七',
  },
  {
    id: 'p6', code: 'AP-006', name: 'Analytical Review',
    description: '分析性复核程序，识别财务数据的异常波动和趋势',
    category: 'analytical', status: 'in-progress', risk: 'medium',
    workpapers: 1, assignedTo: '孙八',
  },
  {
    id: 'p7', code: 'AP-007', name: 'Revenue Cut-off',
    description: '收入截止测试，验证收入确认的期间是否正确',
    category: 'substantive', status: 'not-started', risk: 'high',
    workpapers: 0, assignedTo: '周九',
  },
  {
    id: 'p8', code: 'AP-008', name: 'Related Party Testing',
    description: '关联方交易测试，识别和验证关联方交易',
    category: 'test-of-controls', status: 'not-started', risk: 'high',
    workpapers: 0, assignedTo: '吴十',
  },
  {
    id: 'p9', code: 'AP-009', name: 'Subsequent Events',
    description: '期后事项审查，识别资产负债表日后重大事项',
    category: 'substantive', status: 'not-started', risk: 'low',
    workpapers: 0, assignedTo: '郑十一',
  },
]

const categoryMap = {
  substantive: { label: '实质性程序', color: '#00338D' },
  analytical: { label: '分析程序', color: '#0091DA' },
  'test-of-controls': { label: '控制测试', color: '#00A3A1' },
}

const statusMap = {
  'not-started': { label: '未开始', color: '#718096', bg: '#F7FAFC' },
  'in-progress': { label: '进行中', color: '#00338D', bg: '#EBF4FF' },
  'completed': { label: '已完成', color: '#00A3A1', bg: '#E6FFFA' },
  'reviewed': { label: '已复核', color: '#805AD5', bg: '#FAF5FF' },
}

function AuditProcedures() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all'
    ? procedures
    : procedures.filter(p => p.category === filter || p.status === filter)

  return (
    <div className="audit-procedures animate-fade-in">
      {/* 面包屑 */}
      <div className="proc-breadcrumb">
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
        <span className="breadcrumb-current">Audit Procedures</span>
      </div>

      {/* 页面标题 */}
      <div className="proc-header">
        <div>
          <h1 className="proc-title">Audit Procedures</h1>
          <p className="proc-subtitle">审计程序执行中心 — 基于风险评估设计并执行审计程序</p>
        </div>
        <div className="proc-filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>全部</button>
          <button className={filter === 'substantive' ? 'active' : ''} onClick={() => setFilter('substantive')}>实质性程序</button>
          <button className={filter === 'analytical' ? 'active' : ''} onClick={() => setFilter('analytical')}>分析程序</button>
          <button className={filter === 'test-of-controls' ? 'active' : ''} onClick={() => setFilter('test-of-controls')}>控制测试</button>
        </div>
      </div>

      {/* 统计 */}
      <div className="proc-stats">
        <div className="proc-stat">
          <span className="proc-stat-num">{procedures.length}</span>
          <span className="proc-stat-label">总程序数</span>
        </div>
        <div className="proc-stat">
          <span className="proc-stat-num">{procedures.filter(p => p.status === 'in-progress').length}</span>
          <span className="proc-stat-label">进行中</span>
        </div>
        <div className="proc-stat">
          <span className="proc-stat-num">{procedures.filter(p => p.status === 'completed' || p.status === 'reviewed').length}</span>
          <span className="proc-stat-label">已完成</span>
        </div>
        <div className="proc-stat">
          <span className="proc-stat-num">{procedures.reduce((sum, p) => sum + p.workpapers, 0)}</span>
          <span className="proc-stat-label">底稿数</span>
        </div>
      </div>

      {/* 程序卡片网格 */}
      <div className="procedures-grid">
        {filtered.map((proc, index) => (
          <div
            key={proc.id}
            className={`procedure-card card-lift risk-${proc.risk}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="proc-card-header">
              <span className="proc-code">{proc.code}</span>
              <span className="proc-status" style={{ background: statusMap[proc.status].bg, color: statusMap[proc.status].color }}>
                {statusMap[proc.status].label}
              </span>
            </div>

            <h3 className="proc-name">{proc.name}</h3>
            <p className="proc-desc">{proc.description}</p>

            <div className="proc-meta">
              <span className="proc-category" style={{ background: `${categoryMap[proc.category].color}15`, color: categoryMap[proc.category].color }}>
                {categoryMap[proc.category].label}
              </span>
              <span className={`proc-risk ${proc.risk}`}>
                {proc.risk === 'high' ? '🔴 高风险' : proc.risk === 'medium' ? '🟡 中风险' : '🟢 低风险'}
              </span>
            </div>

            <div className="proc-footer">
              <div className="proc-assignee">
                <div className="assignee-avatar">{proc.assignedTo.charAt(0)}</div>
                <span>{proc.assignedTo}</span>
              </div>
              <div className="proc-wp-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>{proc.workpapers} 底稿</span>
              </div>
            </div>

            <div className="proc-actions">
              <button className="proc-btn primary">执行程序</button>
              <button className="proc-btn">查看底稿</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AuditProcedures
