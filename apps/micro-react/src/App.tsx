import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import type { MicroApp } from '@micro-iframe/sdk'

interface AppProps {
  microApp: MicroApp
}

const App: React.FC<AppProps> = ({ microApp }) => {
  const [count, setCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    // 监听路由变化，同步到微前端系统
    const syncRoute = () => {
      const fullPath = location.pathname + location.search + location.hash
      const props = microApp.getCurrentProps()
      const baseRoute = props?.route || ''
      
      // 构建完整路径（主应用路径 + 子应用路径）
      let syncPath = fullPath
      if (baseRoute && !fullPath.startsWith(baseRoute)) {
        const base = baseRoute.endsWith('/') ? baseRoute.slice(0, -1) : baseRoute
        syncPath = `${base}${fullPath}`
      }
      
      // 同步路由到主应用
      const currentMicroRoute = microApp.router.getCurrentRoute()
      if (syncPath !== currentMicroRoute) {
        microApp.router.navigate(syncPath, { replace: true })
      }
    }

    syncRoute()

    // 监听微前端路由变化，同步到 React Router
    const unsubscribe = microApp.router.onRouteChange((route) => {
      const props = microApp.getCurrentProps()
      const baseRoute = props?.route || ''
      
      let targetPath = route
      if (baseRoute && route.startsWith(baseRoute)) {
        targetPath = route.substring(baseRoute.length) || '/'
      }
      
      if (targetPath !== location.pathname) {
        // 使用 navigate 跳转（需要在组件外部处理）
        // 保留现有的 history.state，避免覆盖 React Router 的状态
        window.history.pushState(history.state, '', targetPath)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    })

    return unsubscribe
  }, [microApp, location])

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
          <Link
            to="/"
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#007bff',
              borderRadius: '4px',
            }}
          >
            首页
          </Link>
          <Link
            to="/page1"
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#007bff',
              borderRadius: '4px',
            }}
          >
            页面1
          </Link>
          <Link
            to="/page2"
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#007bff',
              borderRadius: '4px',
            }}
          >
            页面2
          </Link>
          <Link
            to="/detail"
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#007bff',
              borderRadius: '4px',
            }}
          >
            详情
          </Link>
          <Link
            to="/settings"
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#007bff',
              borderRadius: '4px',
            }}
          >
            设置
          </Link>
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

