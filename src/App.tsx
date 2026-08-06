import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ClientSummary from './pages/ClientSummary'
import EngagementHub from './pages/EngagementHub'
import AuditProcedures from './pages/AuditProcedures'
import OpinionProfile from './pages/OpinionProfile'
import WorkPaperStation from './pages/WorkPaperStation'
import PBCManager from './pages/PBCManager'
import DataProcessing from './pages/DataProcessing'
import Dashboard from './pages/Dashboard'
import Support from './pages/Support'
import Sentinel from './pages/Sentinel'
import CEAC from './pages/CEAC'
import EngagementLetter from './pages/EngagementLetter'
import KYCRisk from './pages/KYCRisk'
import KcwFileDetail from './pages/KcwFileDetail'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<ClientSummary />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/engagement" element={<Dashboard />} />
        <Route path="dashboard/management" element={<Dashboard />} />
        <Route path="support" element={<Support />} />
        <Route path="engagement/:clientId/:engagementId" element={<EngagementHub />} />
        <Route path="engagement/:clientId/:engagementId/procedures" element={<AuditProcedures />} />
        <Route path="engagement/:clientId/:engagementId/pbc" element={<PBCManager />} />
        <Route path="engagement/:clientId/:engagementId/data" element={<DataProcessing />} />
        <Route path="engagement/:clientId/:engagementId/workpapers" element={<WorkPaperStation />} />
        <Route path="opinion/:clientId/:engagementId/:opinionId/:opName?" element={<OpinionProfile />} />
        <Route path="kcw/:clientId/:engagementId/:kcwId" element={<KcwFileDetail />} />
        <Route path="sentinel" element={<Sentinel />} />
        <Route path="ceac" element={<CEAC />} />
        <Route path="engagement-letter" element={<EngagementLetter />} />
        <Route path="kyc-risk" element={<KYCRisk />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
