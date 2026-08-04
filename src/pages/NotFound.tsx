import { useNavigate } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="not-found">
      <div className="not-found-content animate-fade-in-scale">
        <div className="not-found-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00338D" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
          </svg>
        </div>
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面不存在或已被移除。</p>
        <button className="back-home-btn" onClick={() => navigate('/')}>
          返回首页
        </button>
      </div>
    </div>
  )
}

export default NotFound
