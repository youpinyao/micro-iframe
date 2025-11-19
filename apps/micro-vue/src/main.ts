import { createApp } from 'vue'
import { createMicroApp } from '@micro-iframe/sdk'
import App from './App.vue'

// 创建微前端应用实例
const microApp = createMicroApp()

let appInstance: ReturnType<typeof createApp> | null = null

// 设置生命周期钩子
microApp.onMount((props) => {
  console.log('Vue 应用挂载:', props)
  appInstance = createApp(App, { microApp })
  appInstance.mount('#app')
})

microApp.onUnmount((props) => {
  console.log('Vue 应用卸载:', props)
  if (appInstance) {
    appInstance.unmount()
    appInstance = null
  }
})

microApp.onUpdate((props) => {
  console.log('Vue 应用更新:', props)
})

// 监听路由变化
microApp.router.onRouteChange((route) => {
  console.log('路由变化:', route)
})

// 监听通信
microApp.communication.on('*', (message) => {
  console.log('收到消息:', message)
})

