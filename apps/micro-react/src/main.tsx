import React from 'react'
import ReactDOM from 'react-dom/client'
import { createMicroApp } from '@micro-iframe/sdk'
import App from './App'

// 创建微前端应用实例
const microApp = createMicroApp()

// 保存 React root 实例
let root: ReturnType<typeof ReactDOM.createRoot> | null = null

// 设置生命周期钩子
microApp.onMount((props) => {
  console.log('React 应用挂载:', props)
  const rootElement = document.getElementById('root') as HTMLElement
  
  // 如果 root 已存在，直接使用 render 更新
  if (root) {
    root.render(
      <React.StrictMode>
        <App microApp={microApp} />
      </React.StrictMode>
    )
  } else {
    // 首次挂载，创建 root
    root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <App microApp={microApp} />
      </React.StrictMode>
    )
  }
})

microApp.onUnmount((props) => {
  console.log('React 应用卸载:', props)
  // 卸载并清理 root
  if (root) {
    root.unmount()
    root = null
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
  console.log('收到消息 react:', message)
})

