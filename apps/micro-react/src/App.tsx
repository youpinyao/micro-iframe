import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom'
import type { MicroApp } from '@micro-iframe/sdk'

interface AppProps {
  microApp: MicroApp
}

const App: React.FC<AppProps> = ({ microApp }) => {
  const [count, setCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const isInitialMount = React.useRef(true)

  useEffect(() => {
    // 监听路由变化，同步到微前端系统
    const syncRoute = () => {
      // 如果是首次挂载，跳过同步（主应用已经发送了初始路由）
      if (isInitialMount.current) {
        isInitialMount.current = false
        return
      }

      const fullPath = location.pathname + location.search + location.hash
      const props = microApp.getCurrentProps()
      const baseRoute = props?.route || ''
      
      // 构建完整路径（主应用路径 + 子应用路径）
      // baseRoute 是主应用的基础路径（如 /react），fullPath 是子应用内部路径（如 /home）
      // 需要拼接成完整路径（如 /react/home）
      let syncPath = fullPath
      // 只有当子应用路径不是以 baseRoute 开头时才拼接（避免重复）
      if (baseRoute && !fullPath.startsWith(baseRoute)) {
        const base = baseRoute.endsWith('/') ? baseRoute.slice(0, -1) : baseRoute
        // 确保子应用路径以 / 开头
        const subPath = fullPath.startsWith('/') ? fullPath : `/${fullPath}`
        syncPath = `${base}${subPath}`
      }
      
      // 直接同步路由到主应用（不通过 navigate，避免重复处理）
      microApp.router.syncRouteToHost(syncPath)
    }

    // 路由变化时同步
    syncRoute()

    // 监听微前端路由变化，同步到 React Router
    const unsubscribe = microApp.router.onRouteChange((route) => {
      const props = microApp.getCurrentProps()
      const baseRoute = props?.route || ''
      
      // 主应用现在发送的已经是子应用的路由部分，直接使用
      let targetPath = route
      // 如果主应用发送的是完整路径（兼容旧版本），提取子应用路由部分
      if (baseRoute && route.startsWith(baseRoute)) {
        targetPath = route.substring(baseRoute.length) || '/'
      }
      
      if (targetPath !== location.pathname) {
        // 使用 React Router 的 navigate 方法
        navigate(targetPath, { replace: true })
      }
    })

    return unsubscribe
  }, [microApp, location, navigate])

  const handleSendMessage = () => {
    microApp.communication.emit('test-event', {
      message: 'Hello from React App!',
      count,
    })
  }

  const handleRequest = async () => {
    try {
      const result = await microApp.communication.request('test-method', {
        param: 'test',
      })
      console.log('请求结果:', result)
      alert(`请求成功: ${JSON.stringify(result)}`)
    } catch (error) {
      console.error('请求失败:', error)
      alert(`请求失败: ${error}`)
    }
  }

  const props = microApp.getCurrentProps()

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
            to="/"
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
          <p>应用名称: {props?.name || 'N/A'}</p>
          <p>计数: {count}</p>
        </div>
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setCount(count + 1)}>增加计数</button>
          <button onClick={handleSendMessage}>发送事件</button>
          <button onClick={handleRequest}>发送请求</button>
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

