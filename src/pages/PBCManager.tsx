import { useParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
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
  // Financial Statements
  { id: '1', category: 'Financial Statements', description: '2025 Annual Audit Financial Statements (Draft)', requestedBy: 'Zhang San', requestedDate: '2026-07-01', dueDate: '2026-07-10', status: 'accepted', priority: 'high' },
  { id: '2', category: 'Financial Statements', description: 'Q1-Q4 2025 Management Accounts (Monthly)', requestedBy: 'Zhang San', requestedDate: '2026-07-01', dueDate: '2026-07-12', status: 'accepted', priority: 'high' },
  { id: '3', category: 'Financial Statements', description: 'Trial Balance (Level 4 Detail)', requestedBy: 'Zhang San', requestedDate: '2026-07-02', dueDate: '2026-07-14', status: 'received', priority: 'medium' },
  { id: '4', category: 'Financial Statements', description: 'General Ledger Extract (Full Year)', requestedBy: 'Li Si', requestedDate: '2026-07-03', dueDate: '2026-07-16', status: 'reviewed', priority: 'medium' },
  { id: '5', category: 'Financial Statements', description: 'Consolidation Package and Eliminations', requestedBy: 'Zhang San', requestedDate: '2026-07-04', dueDate: '2026-07-18', status: 'pending', priority: 'high' },
  { id: '6', category: 'Financial Statements', description: 'Notes to Financial Statements Disclosures', requestedBy: 'Li Si', requestedDate: '2026-07-05', dueDate: '2026-07-20', status: 'pending', priority: 'medium' },

  // Bank Documents
  { id: '7', category: 'Bank Documents', description: 'Dec 31, 2025 Bank Statements and Reconciliation', requestedBy: 'Li Si', requestedDate: '2026-07-02', dueDate: '2026-07-12', status: 'received', priority: 'high' },
  { id: '8', category: 'Bank Documents', description: 'All Bank Confirmations (Year-end Balances)', requestedBy: 'Li Si', requestedDate: '2026-07-03', dueDate: '2026-07-14', status: 'received', priority: 'high' },
  { id: '9', category: 'Bank Documents', description: 'Loan Agreements and Facility Letters', requestedBy: 'Wang Wu', requestedDate: '2026-07-04', dueDate: '2026-07-16', status: 'reviewed', priority: 'medium' },
  { id: '10', category: 'Bank Documents', description: 'Interbank Fund Transfer Records (Large)', requestedBy: 'Li Si', requestedDate: '2026-07-06', dueDate: '2026-07-20', status: 'pending', priority: 'low' },

  // Tax Documents
  { id: '11', category: 'Tax Documents', description: '2025 Annual CIT Settlement and Declaration Form', requestedBy: 'Wang Wu', requestedDate: '2026-07-03', dueDate: '2026-07-15', status: 'pending', priority: 'medium' },
  { id: '12', category: 'Tax Documents', description: 'VAT Returns (Monthly, Full Year)', requestedBy: 'Wang Wu', requestedDate: '2026-07-04', dueDate: '2026-07-17', status: 'received', priority: 'medium' },
  { id: '13', category: 'Tax Documents', description: 'Transfer Pricing Documentation', requestedBy: 'Wang Wu', requestedDate: '2026-07-06', dueDate: '2026-07-21', status: 'pending', priority: 'high' },
  { id: '14', category: 'Tax Documents', description: 'Tax Payment Vouchers and Receipts', requestedBy: 'Sun Ba', requestedDate: '2026-07-07', dueDate: '2026-07-22', status: 'reviewed', priority: 'low' },

  // Contracts
  { id: '15', category: 'Contracts', description: 'Major Sales Contracts List and Samples (Amount > 1M)', requestedBy: 'Zhao Liu', requestedDate: '2026-07-05', dueDate: '2026-07-18', status: 'pending', priority: 'high' },
  { id: '16', category: 'Contracts', description: 'Purchase Agreements and Framework Contracts', requestedBy: 'Zhao Liu', requestedDate: '2026-07-06', dueDate: '2026-07-19', status: 'received', priority: 'medium' },
  { id: '17', category: 'Contracts', description: 'Lease Agreements (Property and Equipment)', requestedBy: 'Zhao Liu', requestedDate: '2026-07-07', dueDate: '2026-07-20', status: 'reviewed', priority: 'low' },
  { id: '18', category: 'Contracts', description: 'Related Party Transaction Agreements', requestedBy: 'Qian Qi', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'pending', priority: 'high' },

  // Legal Documents
  { id: '19', category: 'Legal Documents', description: 'Pending Litigation and Contingencies Statement', requestedBy: 'Qian Qi', requestedDate: '2026-07-06', dueDate: '2026-07-20', status: 'reviewed', priority: 'medium' },
  { id: '20', category: 'Legal Documents', description: 'Certificate of Incorporation and Bylaws', requestedBy: 'Qian Qi', requestedDate: '2026-07-07', dueDate: '2026-07-21', status: 'accepted', priority: 'low' },
  { id: '21', category: 'Legal Documents', description: 'Board Resolutions and Minutes (FY2025)', requestedBy: 'Qian Qi', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'received', priority: 'medium' },
  { id: '22', category: 'Legal Documents', description: 'Regulatory Filings and Licenses', requestedBy: 'Sun Ba', requestedDate: '2026-07-09', dueDate: '2026-07-24', status: 'pending', priority: 'low' },

  // Internal Control
  { id: '23', category: 'Internal Control', description: '2025 Annual Internal Control Self-Assessment Report', requestedBy: 'Sun Ba', requestedDate: '2026-07-08', dueDate: '2026-07-22', status: 'pending', priority: 'low' },
  { id: '24', category: 'Internal Control', description: 'IT General Controls Documentation', requestedBy: 'Sun Ba', requestedDate: '2026-07-09', dueDate: '2026-07-23', status: 'received', priority: 'medium' },
  { id: '25', category: 'Internal Control', description: 'Segregation of Duties Matrix', requestedBy: 'Sun Ba', requestedDate: '2026-07-10', dueDate: '2026-07-24', status: 'reviewed', priority: 'low' },
  { id: '26', category: 'Internal Control', description: 'Key Control Test Results and Evidence', requestedBy: 'Sun Ba', requestedDate: '2026-07-11', dueDate: '2026-07-25', status: 'pending', priority: 'medium' },
]

const categoryMeta: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  'Financial Statements': { icon: '📊', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  'Bank Documents': { icon: '🏦', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  'Tax Documents': { icon: '📋', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  'Contracts': { icon: '📝', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  'Legal Documents': { icon: '⚖️', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  'Internal Control': { icon: '🛡️', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
}

const statusMap = {
  pending: { label: 'Pending', color: '#D69E2E', bg: '#FFFBEB' },
  received: { label: 'Received', color: '#3182CE', bg: '#EBF4FF' },
  reviewed: { label: 'Reviewed', color: '#805AD5', bg: '#FAF5FF' },
  accepted: { label: 'Accepted', color: '#00A3A1', bg: '#E6FFFA' },
}

function PBCManager() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const filtered = filter === 'all'
    ? pbcItems
    : pbcItems.filter(item => item.status === filter)

  const stats = {
    total: pbcItems.length,
    pending: pbcItems.filter(i => i.status === 'pending').length,
    received: pbcItems.filter(i => i.status === 'received').length,
    accepted: pbcItems.filter(i => i.status === 'accepted').length,
  }

  const grouped: Record<string, PBCItem[]> = {}
  filtered.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })

  const handleCardClick = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(category)
    }
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedCategory(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="pbc-manager animate-fade-in">
      <div className="pbc-header">
        <div>
          <h1 className="pbc-title">PBC Management</h1>
          <p className="pbc-subtitle">Client-provided document collection and management center, tracking PBC list status and follow-ups</p>
        </div>
        <button className="pbc-new-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New PBC Request
        </button>
      </div>

      <div className="pbc-stats">
        <div className="pbc-stat">
          <div className="pbc-stat-icon total-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <span className="pbc-stat-num">{stats.total}</span>
            <span className="pbc-stat-label">Total Requests</span>
          </div>
        </div>
        <div className="pbc-stat">
          <div className="pbc-stat-icon pending-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <span className="pbc-stat-num">{stats.pending}</span>
            <span className="pbc-stat-label">Pending</span>
          </div>
        </div>
        <div className="pbc-stat">
          <div className="pbc-stat-icon received-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div>
            <span className="pbc-stat-num">{stats.received}</span>
            <span className="pbc-stat-label">Received</span>
          </div>
        </div>
        <div className="pbc-stat">
          <div className="pbc-stat-icon accepted-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <span className="pbc-stat-num">{stats.accepted}</span>
            <span className="pbc-stat-label">Accepted</span>
          </div>
        </div>
      </div>

      <div className="pbc-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
        <button className={filter === 'received' ? 'active' : ''} onClick={() => setFilter('received')}>Received</button>
        <button className={filter === 'reviewed' ? 'active' : ''} onClick={() => setFilter('reviewed')}>Reviewed</button>
        <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>Accepted</button>
      </div>

      <div className={`pbc-cards-grid ${expandedCategory ? 'grid-dimmed' : ''}`}>
        {Object.entries(grouped).map(([category, items]) => {
          const meta = categoryMeta[category] || { icon: '📄', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' }
          const isExpanded = expandedCategory === category
          return (
            <div
              key={category}
              ref={el => { cardRefs.current[category] = el }}
              className={`pbc-category-card ${isExpanded ? 'card-expanded' : 'card-lift'}`}
              style={{ borderTop: `4px solid ${meta.color}` }}
              onClick={() => handleCardClick(category)}
            >
              <div className="pbc-card-header" style={{ background: meta.bg }}>
                <div className="pbc-card-icon" style={{ background: meta.color, color: '#fff' }}>
                  {meta.icon}
                </div>
                <div className="pbc-card-title-wrap">
                  <h3 className="pbc-card-title">{category}</h3>
                  <span className="pbc-card-count">{items.length} request{items.length > 1 ? 's' : ''}</span>
                </div>
                <div className="pbc-card-expand-hint">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
              <div className="pbc-card-list">
                {items.map(item => (
                  <div key={item.id} className={`pbc-card-item priority-${item.priority}`}>
                    <div className="pbc-card-item-top">
                      <p className="pbc-card-desc">{item.description}</p>
                      <span className="pbc-status" style={{ background: statusMap[item.status].bg, color: statusMap[item.status].color }}>
                        {statusMap[item.status].label}
                      </span>
                    </div>
                    <div className="pbc-card-item-bottom">
                      <div className="pbc-card-dates">
                        <span>Due: {item.dueDate}</span>
                        <span className={item.status === 'pending' ? 'due-soon' : ''}>{item.status === 'pending' ? '⚠️ ' : ''}{item.requestedBy}</span>
                      </div>
                      <div className="pbc-card-priority">
                        <span className={`priority-dot priority-${item.priority}`}></span>
                        {item.priority}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Expanded overlay */}
      {expandedCategory && (
        <>
          <div className="pbc-overlay-backdrop" onClick={() => setExpandedCategory(null)} />
          <div className="pbc-expanded-card-wrapper">
            {(() => {
              const category = expandedCategory
              const items = grouped[category] || []
              const meta = categoryMeta[category] || { icon: '📄', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' }
              return (
                <div
                  className="pbc-category-card pbc-expanded-card"
                  style={{ borderTop: `4px solid ${meta.color}` }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="pbc-card-header" style={{ background: meta.bg }}>
                    <div className="pbc-card-icon" style={{ background: meta.color, color: '#fff' }}>
                      {meta.icon}
                    </div>
                    <div className="pbc-card-title-wrap">
                      <h3 className="pbc-card-title">{category}</h3>
                      <span className="pbc-card-count">{items.length} request{items.length > 1 ? 's' : ''}</span>
                    </div>
                    <button className="pbc-card-close" onClick={() => setExpandedCategory(null)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div className="pbc-card-list">
                    {items.map(item => (
                      <div key={item.id} className={`pbc-card-item priority-${item.priority}`}>
                        <div className="pbc-card-item-top">
                          <p className="pbc-card-desc">{item.description}</p>
                          <span className="pbc-status" style={{ background: statusMap[item.status].bg, color: statusMap[item.status].color }}>
                            {statusMap[item.status].label}
                          </span>
                        </div>
                        <div className="pbc-card-item-bottom">
                          <div className="pbc-card-dates">
                            <span>Due: {item.dueDate}</span>
                            <span className={item.status === 'pending' ? 'due-soon' : ''}>{item.status === 'pending' ? '⚠️ ' : ''}{item.requestedBy}</span>
                          </div>
                          <div className="pbc-card-priority">
                            <span className={`priority-dot priority-${item.priority}`}></span>
                            {item.priority}
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
