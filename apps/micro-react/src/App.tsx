import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom'

const App: React.FC = () => {
  const [count, setCount] = useState(0)
  const location = useLocation()

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <nav
        style={{
          background: '#f8f9fa',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #dee2e6',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>React 子应用</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <NavLink
            to="/home"
            style={({ isActive }) => ({
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#007bff',
              background: isActive ? '#007bff' : 'transparent',
              borderRadius: '4px',
            })}
          >
            首页
          </NavLink>
          <NavLink
            to="/page1"
            style={({ isActive }) => ({
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#007bff',
              background: isActive ? '#007bff' : 'transparent',
              borderRadius: '4px',
            })}
          >
            页面1
          </NavLink>
          <NavLink
            to="/page2"
            style={({ isActive }) => ({
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#007bff',
              background: isActive ? '#007bff' : 'transparent',
              borderRadius: '4px',
            })}
          >
            页面2
          </NavLink>
          <NavLink
            to="/detail"
            style={({ isActive }) => ({
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#007bff',
              background: isActive ? '#007bff' : 'transparent',
              borderRadius: '4px',
            })}
          >
            详情
          </NavLink>
          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: isActive ? '#fff' : '#007bff',
              background: isActive ? '#007bff' : 'transparent',
              borderRadius: '4px',
            })}
          >
            设置
          </NavLink>
        </div>
      </nav>
      <div style={{ padding: '2rem' }}>
        <div
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '4px',
          }}
        >
          <p>当前路由: {location.pathname}</p>
          <p>计数: {count}</p>
        </div>
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setCount(count + 1)}>增加计数</button>
        </div>
        <Outlet />
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #dee2e6',
          }}
        >
          <h2>功能演示</h2>
          <ul>
            <li>生命周期管理：应用已挂载</li>
            <li>React Router 集成：使用 react-router-dom 进行路由管理</li>
            <li>路由同步：路由变化自动同步到主应用</li>
            <li>通信功能：可以发送事件和请求</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
