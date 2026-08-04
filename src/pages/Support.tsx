import { useState } from 'react'
import './Support.css'

type EnquiryType = 'technical' | 'data' | 'access' | 'training' | 'other'
type Priority = 'urgent' | 'high' | 'medium' | 'low'
type Status = 'open' | 'in-progress' | 'resolved' | 'closed'

interface Enquiry {
  id: string
  ticketNo: string
  title: string
  type: EnquiryType
  priority: Priority
  status: Status
  submitter: string
  submitterRole: string
  assignee: string
  createdAt: string
  updatedAt: string
  description: string
}

const typeLabels: Record<EnquiryType, string> = {
  technical: 'Technical Issue',
  data: 'Data Problem',
  access: 'Access Request',
  training: 'Training',
  other: 'Other',
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'urgent' },
  high: { label: 'High', color: 'high' },
  medium: { label: 'Medium', color: 'medium' },
  low: { label: 'Low', color: 'low' },
}

const statusConfig: Record<Status, { label: string; color: string }> = {
  open: { label: 'Open', color: 'open' },
  'in-progress': { label: 'In Progress', color: 'in-progress' },
  resolved: { label: 'Resolved', color: 'resolved' },
  closed: { label: 'Closed', color: 'closed' },
}

const mockEnquiries: Enquiry[] = [
  {
    id: '1',
    ticketNo: 'SUP-2025-0847',
    title: 'Unable to export work papers to PDF format',
    type: 'technical',
    priority: 'high',
    status: 'in-progress',
    submitter: 'Lisa Wang',
    submitterRole: 'Audit Senior',
    assignee: 'IT Support - Mike Chen',
    createdAt: '2025-07-28',
    updatedAt: '2025-07-29',
    description: 'When attempting to export work papers from the Work Paper Station, the PDF generation fails with error code 5003. This affects 3 engagements.',
  },
  {
    id: '2',
    ticketNo: 'SUP-2025-0846',
    title: 'Data import from client ERP shows mapping errors',
    type: 'data',
    priority: 'urgent',
    status: 'open',
    submitter: 'David Liu',
    submitterRole: 'Audit Manager',
    assignee: 'Unassigned',
    createdAt: '2025-07-29',
    updatedAt: '2025-07-29',
    description: 'Importing trial balance from client SAP system. Account codes are not mapping correctly to our standard chart of accounts.',
  },
  {
    id: '3',
    ticketNo: 'SUP-2025-0845',
    title: 'Request access to new engagement DEMO-ROBOT-2025',
    type: 'access',
    priority: 'medium',
    status: 'resolved',
    submitter: 'Anna Zhang',
    submitterRole: 'Audit Associate',
    assignee: 'Admin - Sarah Li',
    createdAt: '2025-07-25',
    updatedAt: '2025-07-27',
    description: 'Need read/write access to the Aurora Robotics engagement for Q3 review procedures.',
  },
  {
    id: '4',
    ticketNo: 'SUP-2025-0844',
    title: 'Training session on new JE Testing module',
    type: 'training',
    priority: 'low',
    status: 'closed',
    submitter: 'Tom Huang',
    submitterRole: 'Audit Senior',
    assignee: 'Training - Jenny Wu',
    createdAt: '2025-07-20',
    updatedAt: '2025-07-24',
    description: 'Request a group training session for the new JE Testing automation module. Team of 5 people.',
  },
  {
    id: '5',
    ticketNo: 'SUP-2025-0843',
    title: 'Opinion Profile submit button disabled unexpectedly',
    type: 'technical',
    priority: 'high',
    status: 'in-progress',
    submitter: 'Eric Ren',
    submitterRole: 'Senior Audit Manager',
    assignee: 'IT Support - Mike Chen',
    createdAt: '2025-07-26',
    updatedAt: '2025-07-28',
    description: 'All required fields are filled but the "Submit Final Declaration" button remains disabled. Clearing cache did not help.',
  },
]

function Support() {
  const [activeView, setActiveView] = useState<'submit' | 'track'>('track')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    type: 'technical' as EnquiryType,
    priority: 'medium' as Priority,
    description: '',
  })

  const filteredEnquiries = filterStatus === 'all'
    ? mockEnquiries
    : mockEnquiries.filter(e => e.status === filterStatus)

  const statusCounts = {
    all: mockEnquiries.length,
    open: mockEnquiries.filter(e => e.status === 'open').length,
    'in-progress': mockEnquiries.filter(e => e.status === 'in-progress').length,
    resolved: mockEnquiries.filter(e => e.status === 'resolved').length,
    closed: mockEnquiries.filter(e => e.status === 'closed').length,
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    alert(`Enquiry submitted: ${formData.title}`)
    setFormData({ title: '', type: 'technical', priority: 'medium', description: '' })
    setActiveView('track')
  }

  return (
    <div className="support-page animate-fade-in">
      {/* Header */}
      <div className="support-header">
        <div>
          <h1 className="support-title">运维支持中心</h1>
          <p className="support-subtitle">Support Center & Enquiry Management</p>
        </div>
        <div className="support-tabs">
          <button
            className={activeView === 'track' ? 'active' : ''}
            onClick={() => setActiveView('track')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Track Enquiries
          </button>
          <button
            className={activeView === 'submit' ? 'active' : ''}
            onClick={() => setActiveView('submit')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Submit New
          </button>
        </div>
      </div>

      {activeView === 'track' ? (
        <>
          {/* Stats */}
          <div className="support-stats">
            {(['all', 'open', 'in-progress', 'resolved', 'closed'] as const).map((status, i) => (
              <button
                key={status}
                className={`support-stat-card ${filterStatus === status ? 'active' : ''} animate-stagger`}
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => setFilterStatus(status)}
              >
                <span className={`stat-number stat-${status}`}>{statusCounts[status]}</span>
                <span className="stat-name">{status === 'all' ? 'All Tickets' : statusConfig[status].label}</span>
                {filterStatus === status && <div className="stat-active-line"></div>}
              </button>
            ))}
          </div>

          {/* List + Detail */}
          <div className="support-content">
            <div className="support-list animate-stagger" style={{ animationDelay: '0.3s' }}>
              {filteredEnquiries.map((enq, i) => (
                <div
                  key={enq.id}
                  className={`support-list-item ${selectedEnquiry?.id === enq.id ? 'selected' : ''} animate-stagger`}
                  style={{ animationDelay: `${0.35 + i * 0.05}s` }}
                  onClick={() => setSelectedEnquiry(enq)}
                >
                  <div className="list-item-header">
                    <span className="list-ticket">{enq.ticketNo}</span>
                    <span className={`list-priority ${priorityConfig[enq.priority].color}`}>
                      {priorityConfig[enq.priority].label}
                    </span>
                  </div>
                  <p className="list-title">{enq.title}</p>
                  <div className="list-meta">
                    <span className={`list-status ${statusConfig[enq.status].color}`}>
                      {statusConfig[enq.status].label}
                    </span>
                    <span className="list-type">{typeLabels[enq.type]}</span>
                    <span className="list-date">{enq.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail Panel */}
            <div className="support-detail animate-slide-in">
              {selectedEnquiry ? (
                <>
                  <div className="detail-header">
                    <div className="detail-ticket-badge">{selectedEnquiry.ticketNo}</div>
                    <div className="detail-badges">
                      <span className={`detail-badge priority-${priorityConfig[selectedEnquiry.priority].color}`}>
                        {priorityConfig[selectedEnquiry.priority].label}
                      </span>
                      <span className={`detail-badge status-${statusConfig[selectedEnquiry.status].color}`}>
                        {statusConfig[selectedEnquiry.status].label}
                      </span>
                    </div>
                  </div>

                  <h3 className="detail-title">{selectedEnquiry.title}</h3>
                  <p className="detail-desc">{selectedEnquiry.description}</p>

                  <div className="detail-info-grid">
                    <div className="detail-info-item">
                      <span className="detail-info-label">Type</span>
                      <span className="detail-info-value">{typeLabels[selectedEnquiry.type]}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Submitter</span>
                      <span className="detail-info-value">{selectedEnquiry.submitter}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Role</span>
                      <span className="detail-info-value">{selectedEnquiry.submitterRole}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Assignee</span>
                      <span className="detail-info-value">{selectedEnquiry.assignee}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Created</span>
                      <span className="detail-info-value">{selectedEnquiry.createdAt}</span>
                    </div>
                    <div className="detail-info-item">
                      <span className="detail-info-label">Updated</span>
                      <span className="detail-info-value">{selectedEnquiry.updatedAt}</span>
                    </div>
                  </div>

                  <div className="detail-actions">
                    <button className="detail-btn primary">Update Status</button>
                    <button className="detail-btn secondary">Add Comment</button>
                    <button className="detail-btn secondary">Reassign</button>
                  </div>
                </>
              ) : (
                <div className="detail-empty">
                  <div className="detail-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <p>Select an enquiry to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Submit Form */
        <div className="support-form-panel animate-fade-in-scale">
          <div className="form-glow"></div>
          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as EnquiryType })}
                >
                  <option value="technical">Technical Issue</option>
                  <option value="data">Data Problem</option>
                  <option value="access">Access Request</option>
                  <option value="training">Training</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <div className="priority-selector">
                  {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`priority-btn ${p} ${formData.priority === p ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, priority: p })}
                    >
                      {priorityConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description <span className="required">*</span></label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide detailed information about your enquiry..."
                  rows={5}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="form-btn secondary" onClick={() => setActiveView('track')}>
                Cancel
              </button>
              <button type="submit" className="form-btn primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Submit Enquiry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Support
