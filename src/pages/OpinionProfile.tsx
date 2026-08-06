import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { ReactNode } from 'react'
import './OpinionProfile.css'

interface Phase {
  id: string
  title: string
  titleCn: string
  status: 'completed' | 'active' | 'pending'
  date?: string
}

const opinionPhases: Phase[] = [
  { id: '1', title: 'Submit opinion profile', titleCn: '提交意见档案', status: 'completed', date: '2026-07-15' },
  { id: '2', title: 'Apply serial number', titleCn: '申请编号', status: 'completed', date: '2026-07-18' },
  { id: '3', title: 'Submit final declaration', titleCn: '提交最终声明', status: 'active' },
  { id: '4', title: 'Close out', titleCn: '关闭', status: 'pending' },
]

const opinionData = {
  entityNameEn: 'Model electronics limited',
  reportType: 'Financial statement audit only',
  armsReportId: 'D000001234',
  rId: 'R00000863522',
  periodEnd: '2024-12-31',
  signingFirm: 'Dummy Audit Firm LLP',
  reportDate: '2026-06-18',
  serialNumber: 'BJSHG2600002',
  currentPhase: 3,
}

// Other actions data
interface ActionItem {
  id: string
  icon: string
  iconColor: string
  title: string
  desc: string
}

// Icon components
const FileTextIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

const FileCheckIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <polyline points="9 15 12 18 17 11"/>
  </svg>
)

const FilePlusIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
)

const FolderIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)

const DatabaseIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
)

const WarningIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const DownloadIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const UsersIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const FileIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)

interface ActionItem {
  id: string
  icon: ReactNode
  iconColor: string
  title: string
  desc: string
}

const otherActions: ActionItem[] = [
  {
    id: 'kdc-fs',
    icon: <FileTextIcon size={22} />,
    iconColor: 'amber',
    title: 'KDC FS word processing and checking service',
    desc: '',
  },
  {
    id: 'self-service',
    icon: <FileCheckIcon size={22} />,
    iconColor: 'blue',
    title: 'Self-service FS checking in FSC',
    desc: '',
  },
  {
    id: 'add-kcw',
    icon: <FilePlusIcon size={22} />,
    iconColor: 'red',
    title: 'Add additional KCw file to this opinion profile',
    desc: '',
  },
  {
    id: 'documents',
    icon: <FolderIcon size={22} />,
    iconColor: 'indigo',
    title: 'Access documents folder',
    desc: '',
  },
  {
    id: 'hardcopy',
    icon: <DatabaseIcon size={22} />,
    iconColor: 'purple',
    title: 'Hardcopy file assembly',
    desc: '',
  },
]

// Related KCW files data
interface KcwFileItem {
  id: string
  name: string
  isPrimary: boolean
}

const relatedKcwFiles: KcwFileItem[] = [
  { id: 'KC001', name: '241231_Stat_RF_sample2_FSA_ISA_single', isPrimary: true },
  { id: 'KC002', name: '241231_Stat_RF_sample2_FSA_ISA_single', isPrimary: false },
]

function OpinionProfile() {
  const { clientId, engagementId } = useParams()
  const navigate = useNavigate()

  const currentPhase = opinionPhases.find(p => p.status === 'active')

  return (
    <div className="opinion-profile animate-fade-in">
      {/* Page Title Row */}
      <div className="op-title-row animate-slide-in">
        <h1 className="op-page-title">
          {opinionData.entityNameEn} - {opinionData.reportType}{' '}
          <span className="op-id-text">(ARMS report ID: {opinionData.armsReportId})</span>{' '}
          ID: {opinionData.rId}
        </h1>
      </div>

      {/* Current Phase Progress */}
      <div className="op-phase-card animate-fade-in-scale">
        <div className="op-phase-header">
          <h3 className="op-phase-title">
            Current phase
            <span className="op-phase-help">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </span>
          </h3>
        </div>
        <div className="op-phase-track">
          {opinionPhases.map((phase, index) => (
            <div key={phase.id} className={`op-phase-item ${phase.status}`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`op-phase-dot ${phase.status}`}>
                {phase.status === 'completed' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="op-phase-label">{phase.title}</span>
              {phase.date && <span className="op-phase-date">{phase.date}</span>}
              {index < opinionPhases.length - 1 && (
                <div className={`op-phase-connector ${phase.status === 'completed' ? 'active' : ''}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Action Bar */}
      <div className="op-action-bar animate-slide-in">
        <div className="op-action-info">
          <span className="op-action-label">
            <span className="op-action-pulse"></span>
            Pending your action
          </span>
          <span className="op-action-desc">当前阶段需要您提交最终声明以完成审计意见配置</span>
        </div>
        <button className="op-action-btn">
          <span>Submit eForm for KCw</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Bottom Section: Other actions + Related KCW files */}
      <div className="op-bottom-grid animate-fade-in">
        {/* Left: Other Actions */}
        <div className="op-other-panel glass-card">
          <div className="op-panel-header">
            <span className="op-panel-badge">Other actions</span>
          </div>
          <div className="op-actions-grid">
            {otherActions.map(action => (
              <div key={action.id} className={`op-action-card ${action.iconColor}`}>
                <div className={`op-action-icon-wrap ${action.iconColor}`}>
                  {action.icon}
                </div>
                <span className="op-action-card-title">{action.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Related KCW files */}
        <div className="op-kcw-panel glass-card">
          <div className="op-panel-header">
            <span className="op-panel-badge blue">Related KCw files</span>
          </div>

          <div className="op-kcw-list">
            <div className="op-kcw-group-label">Primary file</div>
            {relatedKcwFiles.filter(f => f.isPrimary).map(file => (
              <div key={file.id} className="op-kcw-file-row">
                <div className="op-kcw-file-badge">
                  <FileIcon size={12} /> {file.name}
                </div>
                <div className="op-kcw-file-actions">
                  <button className="op-kcw-action-btn warning" title="Warning">
                    <WarningIcon size={14} />
                  </button>
                  <button className="op-kcw-action-btn amber" title="Download">
                    <DownloadIcon size={14} />
                  </button>
                  <button className="op-kcw-action-btn blue" title="Users">
                    <UsersIcon size={14} />
                  </button>
                </div>
              </div>
            ))}

            <div className="op-kcw-group-label">Additional file</div>
            {relatedKcwFiles.filter(f => !f.isPrimary).map(file => (
              <div key={file.id} className="op-kcw-file-row">
                <div className="op-kcw-file-badge">
                  <FileIcon size={12} /> {file.name}
                </div>
                <div className="op-kcw-file-actions">
                  <button className="op-kcw-action-btn amber" title="Download">
                    <DownloadIcon size={14} />
                  </button>
                  <button className="op-kcw-action-btn blue" title="Users">
                    <UsersIcon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpinionProfile
