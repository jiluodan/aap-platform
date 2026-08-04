import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'
import './MainLayout.css'

function MainLayout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="layout-right">
        <TopNav />
        <main className={`main-content ${isHome ? 'home' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
