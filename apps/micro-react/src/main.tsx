import React from 'react'
import ReactDOM from 'react-dom/client'
import { createMicroApp } from '@micro-iframe/sdk'
import App from './App'

// 创建微前端应用实例
const microApp = createMicroApp()

// 设置生命周期钩子
microApp.onMount((props) => {
  console.log('React 应用挂载:', props)
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  )
  root.render(
    <React.StrictMode>
      <App microApp={microApp} />
    </React.StrictMode>
  )
})

microApp.onUnmount((props) => {
  console.log('React 应用卸载:', props)
  const rootElement = document.getElementById('root')
  if (rootElement) {
    ReactDOM.createRoot(rootElement).unmount()
  }
})

microApp.onUpdate((props) => {
  console.log('React 应用更新:', props)
})

// 监听路由变化
microApp.router.onRouteChange((route) => {
  console.log('路由变化:', route)
})

// 监听通信
microApp.communication.on('*', (message) => {
  console.log('收到消息:', message)
})

