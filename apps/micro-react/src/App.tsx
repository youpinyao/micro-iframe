import React, { useState, useEffect } from 'react'
import type { MicroApp } from '@micro-iframe/sdk'

interface AppProps {
  microApp: MicroApp
}

const App: React.FC<AppProps> = ({ microApp }) => {
  const [count, setCount] = useState(0)
  const [route, setRoute] = useState('')

  useEffect(() => {
    setRoute(microApp.router.getCurrentRoute())
    const unsubscribe = microApp.router.onRouteChange((newRoute) => {
      setRoute(newRoute)
    })
    return unsubscribe
  }, [microApp])

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
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>React 子应用</h1>
      <div style={{ marginTop: '1rem' }}>
        <p>当前路由: {route}</p>
        <p>应用名称: {props?.name || 'N/A'}</p>
        <p>计数: {count}</p>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <button onClick={() => setCount(count + 1)}>增加计数</button>
        <button onClick={handleSendMessage}>发送事件</button>
        <button onClick={handleRequest}>发送请求</button>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>功能演示</h2>
        <ul>
          <li>生命周期管理：应用已挂载</li>
          <li>路由同步：当前路由 {route}</li>
          <li>通信功能：可以发送事件和请求</li>
        </ul>
      </div>
    </div>
  )
}

export default App

