// react-router-dom hooks removed: navigation handled by TopNav
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { findProcedureItem, visibleProcedureTypes as visibleTypes } from '../data/auditProcedures'
import './AuditProcedures.css'

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

// ===== Filter Categories (derived from RM ID prefixes in Template Find) =====
const filterCategories = [
  { key: 'all', label: '全部', color: '#00338D' },
  { key: 'procurement-ap', label: '采购与应付 (100.1/100.2)', color: '#00338D' },
  { key: 'ar-revenue', label: '应收与收入 (109.6/109.7)', color: '#0091DA' },
  { key: 'revenue', label: '收入确认 (115.2)', color: '#E4002B' },
  { key: 'inventory', label: '存货 (201/202)', color: '#38A169' },
  { key: 'cash-bank', label: '现金及银行 (207/210)', color: '#00A3A1' },
  { key: 'income-tax', label: '所得税 (212)', color: '#805AD5' },
  { key: 'fixed-assets', label: '固定资产 (216)', color: '#DD6B20' },
  { key: 'payroll-hr', label: '工资与人事 (219GN)', color: '#B83280' },
  { key: 'share-capital', label: '股本发行 (232.3)', color: '#D69E2E' },
  { key: 'provisions', label: '预计负债 (237)', color: '#319795' },
  { key: 'intangible', label: '无形资产 (238)', color: '#718096' },
]

// Map filter category tag key to procedure type keys
const categoryTypeMap: Record<string, string[]> = {
  'all': [],
  'procurement-ap': ['je-testing', 'vouching'],
  'ar-revenue': ['kdc-confirm', 'credit-review', 'lease-recalc'],
  'revenue': ['alteryx', 'je-testing', 'vouching'],
  'inventory': ['inventory-obs'],
  'cash-bank': ['fsr', 'kdc-cash', 'kdc-confirm'],
  'income-tax': [],
  'fixed-assets': ['physical-attn'],
  'payroll-hr': ['vouching'],
  'share-capital': ['group-audit'],
  'provisions': [],
  'intangible': [],
}

function AuditProcedures() {
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  // 程序类型浏览视图：card（卡片网格）/ list（列表总览，便于横向对比）
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  // ===== 深链定位：?type=<类型id>&item=<程序code>（由 Work Paper Station 等页面跳入）=====
  const [searchParams, setSearchParams] = useSearchParams()
  const focusTypeId = searchParams.get('type')
  const focusItemKey = searchParams.get('item')
  const focusRowRef = useRef<HTMLDivElement | null>(null)

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

  // 关闭弹层时一并清掉定位参数，保证再次点击同一个链接仍能重新打开
  const closeExpanded = () => {
    setExpandedType(null)
    if (focusTypeId || focusItemKey) setSearchParams({}, { replace: true })
  }

  // 带 ?type= 进入时：直接打开该类型明细弹层，并把筛选切到它所属的分类
  useEffect(() => {
    if (!focusTypeId) return
    const type = visibleTypes.find(t => t.id === focusTypeId)
    if (!type) return
    setExpandedType(type.id)
    const cat = filterCategories.find(
      c => c.key !== 'all' && (categoryTypeMap[c.key] || []).includes(type.key)
    )
    setActiveFilter(cat ? cat.key : 'all')
  }, [focusTypeId])

  // 带 ?item= 进入时：滚动到并高亮对应的明细行
  useEffect(() => {
    if (!focusItemKey || !expandedType) return
    const timer = window.setTimeout(() => {
      focusRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 180)
    return () => window.clearTimeout(timer)
  }, [focusItemKey, expandedType])

  // ESC 关闭：用 ref 持有「当前是否存在定位参数」，避免每次渲染都重挂监听
  const hasFocusParamsRef = useRef(false)
  hasFocusParamsRef.current = Boolean(focusTypeId || focusItemKey)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setExpandedType(null)
      if (hasFocusParamsRef.current) setSearchParams({}, { replace: true })
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [setSearchParams])

  return (
    <div className="audit-procedures animate-fade-in">
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

      {/* Section Title + View Toggle */}
      <div className="ap-section-head">
        <h2 className="ap-section-title">Procedure Types</h2>
        <div className="ap-view-toggle" role="group" aria-label="视图切换">
          <button
            type="button"
            className={viewMode === 'card' ? 'active' : ''}
            onClick={() => setViewMode('card')}
            title="卡片视图"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            title="列表视图"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>

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

      {/* Cards Grid / List */}
      {viewMode === 'card' ? (
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

              {/* Preview Items - RM ID & Procedure Ref only */}
              {!isExpanded && type.items.length > 0 && (
                <div className="ap-file-preview">
                  {type.items.slice(0, 2).map(item => (
                    <div key={item.id} className="ap-preview-item">
                      <span className="ap-rm-id" title="RM ID">{item.rmId}</span>
                      <span className="ap-proc-ref" title="Procedure Ref">{item.procedureRef}</span>
                      <span className="ap-preview-name" title={item.name}>{item.name}</span>
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
      ) : (
        /* List View —— 一屏总览全部程序类型，便于横向对比 */
        <div className="ap-types-list">
          <table className="ap-type-table">
            <thead>
              <tr>
                <th>程序类型</th>
                <th className="num">程序数</th>
                <th>完成进度</th>
                <th className="col-status-dist">状态分布</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map(type => {
                const completedItems = type.items.filter(i => i.status === 'completed' || i.status === 'reviewed').length
                const progressPct = type.items.length > 0 ? Math.round((completedItems / type.items.length) * 100) : 0
                return (
                  <tr key={type.id} onClick={() => handleCardClick(type.id)}>
                    <td>
                      <span className="pt-name">
                        <span className="pt-icon" style={{ background: type.color, color: '#fff' }}>{type.icon}</span>
                        {type.label}
                      </span>
                    </td>
                    <td className="num"><span className="pt-count">{type.items.length}</span></td>
                    <td>
                      <div className="ap-progress-wrap">
                        <div className="ap-progress-bar">
                          <div className="ap-progress-fill" style={{ width: `${progressPct}%`, background: type.color }}></div>
                        </div>
                        <span className="ap-pct">{progressPct}%</span>
                      </div>
                    </td>
                    <td>
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Expanded Overlay */}
      {expandedType && (() => {
        const type = visibleTypes.find(t => t.id === expandedType)!
        if (!type) return null
        const focusedItem = findProcedureItem(type, focusItemKey)

        return (
          <>
            <div className="ap-overlay-backdrop" onClick={closeExpanded} />
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
                  <button className="ap-close-btn" onClick={closeExpanded}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* 定位提示：由 Work Paper Station 等页面带 ?item= 跳入时展示 */}
                {focusedItem && (
                  <div className="ap-locate-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>
                      已从 Work Paper Station 定位到 <b>{focusedItem.code}</b> {focusedItem.name}
                    </span>
                    <button
                      type="button"
                      className="ap-locate-clear"
                      onClick={() => setSearchParams({}, { replace: true })}
                      title="清除定位"
                    >
                      清除
                    </button>
                  </div>
                )}

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
                    const isFocused = focusedItem?.id === item.id
                    return (
                      <div
                        key={item.id}
                        ref={isFocused ? focusRowRef : undefined}
                        className={`ap-proc-row${isFocused ? ' ap-proc-row-focus' : ''}`}
                        data-proc-code={item.code}
                      >
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
