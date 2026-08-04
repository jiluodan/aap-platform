import { useState, type ReactNode } from 'react'
import './Dashboard.css'

type ReportType = 'engagement' | 'management'

interface MetricCard {
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: ReactNode
  color: string
}

interface ChartBar {
  label: string
  value: number
  color: string
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState<ReportType>('engagement')

  const engagementMetrics: MetricCard[] = [
    {
      label: 'Active Engagements',
      value: '24',
      change: '+3 vs last month',
      changeType: 'positive',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      color: 'teal',
    },
    {
      label: 'Pending Procedures',
      value: '186',
      change: '-12 vs last week',
      changeType: 'positive',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      color: 'amber',
    },
    {
      label: 'Open Exceptions',
      value: '47',
      change: '+5 vs last week',
      changeType: 'negative',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      color: 'coral',
    },
    {
      label: 'Work Papers Completed',
      value: '892',
      change: '+67 this month',
      changeType: 'positive',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
      color: 'indigo',
    },
  ]

  const managementMetrics: MetricCard[] = [
    {
      label: 'Total Clients',
      value: '156',
      change: '+8 YTD',
      changeType: 'positive',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: 'blue',
    },
    {
      label: 'Revenue (YTD)',
      value: 'CNY 86.5M',
      change: '+12.3% YoY',
      changeType: 'positive',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      color: 'teal',
    },
    {
      label: 'Avg. Engagement Duration',
      value: '14.2 weeks',
      change: '-1.1 weeks',
      changeType: 'positive',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      color: 'amber',
    },
    {
      label: 'Quality Review Pass Rate',
      value: '97.2%',
      change: '+1.5% vs last year',
      changeType: 'positive',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      color: 'indigo',
    },
  ]

  const engagementChart: ChartBar[] = [
    { label: 'Jan', value: 65, color: 'var(--primary-400)' },
    { label: 'Feb', value: 72, color: 'var(--primary-400)' },
    { label: 'Mar', value: 58, color: 'var(--primary-400)' },
    { label: 'Apr', value: 85, color: 'var(--primary-500)' },
    { label: 'May', value: 78, color: 'var(--primary-400)' },
    { label: 'Jun', value: 92, color: 'var(--accent-400)' },
  ]

  const managementChart: ChartBar[] = [
    { label: 'FS Audit', value: 45, color: 'var(--primary-500)' },
    { label: 'IPO', value: 22, color: 'var(--accent-400)' },
    { label: 'IC Audit', value: 18, color: 'var(--teal-400)' },
    { label: 'ESG', value: 12, color: 'var(--indigo-400)' },
    { label: 'Due Diligence', value: 28, color: 'var(--amber-400)' },
    { label: 'Other', value: 8, color: 'var(--coral-300)' },
  ]

  const currentMetrics = activeTab === 'engagement' ? engagementMetrics : managementMetrics
  const currentChart = activeTab === 'engagement' ? engagementChart : managementChart

  const recentItems = activeTab === 'engagement'
    ? [
        { id: 1, title: 'Aurora Robotics - FY2025 FS Audit', status: 'In Progress', progress: 68, risk: 'High' },
        { id: 2, title: 'Stellar Pharma - FY2025 FS Audit', status: 'In Progress', progress: 45, risk: 'Medium' },
        { id: 3, title: 'Nova Energy - FY2025 FS Audit', status: 'In Progress', progress: 72, risk: 'Medium' },
        { id: 4, title: 'Quantum Finance - FY2025 FS Audit', status: 'In Progress', progress: 55, risk: 'High' },
        { id: 5, title: 'Aurora Robotics - IPO Audit', status: 'Planning', progress: 35, risk: 'High' },
      ]
    : [
        { id: 1, title: 'Partner Review Completion', status: 'On Track', progress: 94, risk: 'Low' },
        { id: 2, title: 'Client Satisfaction Score', status: 'Above Target', progress: 88, risk: 'Low' },
        { id: 3, title: 'Staff Utilization Rate', status: 'Above Target', progress: 82, risk: 'Low' },
        { id: 4, title: 'Budget vs Actual', status: 'Attention', progress: 76, risk: 'Medium' },
        { id: 5, title: 'Training Compliance', status: 'On Track', progress: 91, risk: 'Low' },
      ]

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">数据报表中心</h1>
          <p className="dashboard-subtitle">Analytics & Reporting Dashboard</p>
        </div>
        <div className="dashboard-tabs">
          <button
            className={activeTab === 'engagement' ? 'active' : ''}
            onClick={() => setActiveTab('engagement')}
          >
            <span className="tab-dot engagement"></span>
            Engagement Reports
          </button>
          <button
            className={activeTab === 'management' ? 'active' : ''}
            onClick={() => setActiveTab('management')}
          >
            <span className="tab-dot management"></span>
            Management Reports
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {currentMetrics.map((m, i) => (
          <div
            key={m.label}
            className={`metric-card metric-${m.color} card-lift animate-stagger`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="metric-card-glow"></div>
            <div className="metric-card-header">
              <span className="metric-card-icon">{m.icon}</span>
              <span className={`metric-change ${m.changeType}`}>{m.change}</span>
            </div>
            <div className="metric-card-body">
              <span className="metric-card-value">{m.value}</span>
              <span className="metric-card-label">{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Lists */}
      <div className="dashboard-grid">
        {/* Chart */}
        <div className="dashboard-panel chart-panel animate-stagger" style={{ animationDelay: '0.3s' }}>
          <div className="panel-header">
            <h3>{activeTab === 'engagement' ? 'Engagement Progress Trend' : 'Service Line Distribution'}</h3>
            <span className="panel-period">Last 6 Months</span>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {currentChart.map((bar, i) => (
                <div key={bar.label} className="chart-bar-group">
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar-fill"
                      style={{
                        height: `${bar.value}%`,
                        background: bar.color,
                        animationDelay: `${0.4 + i * 0.1}s`,
                      }}
                    ></div>
                  </div>
                  <span className="chart-bar-label">{bar.label}</span>
                  <span className="chart-bar-value">{bar.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Items */}
        <div className="dashboard-panel list-panel animate-stagger" style={{ animationDelay: '0.4s' }}>
          <div className="panel-header">
            <h3>{activeTab === 'engagement' ? 'Active Engagements' : 'KPI Overview'}</h3>
            <button className="panel-action">View All</button>
          </div>
          <div className="recent-list">
            {recentItems.map((item, i) => (
              <div
                key={item.id}
                className="recent-item animate-stagger"
                style={{ animationDelay: `${0.5 + i * 0.06}s` }}
              >
                <div className="recent-item-info">
                  <span className="recent-item-title">{item.title}</span>
                  <div className="recent-item-meta">
                    <span className={`recent-status ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span>
                    <span className={`recent-risk ${item.risk.toLowerCase()}`}>{item.risk}</span>
                  </div>
                </div>
                <div className="recent-item-progress">
                  <div className="recent-progress-track">
                    <div
                      className="recent-progress-fill"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <span className="recent-progress-text">{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
