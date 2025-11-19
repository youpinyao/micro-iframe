import { MicroIframe } from '@micro-iframe/core'
import { RouterMode } from '@micro-iframe/core'

// 创建微前端框架实例
const microIframe = new MicroIframe({
  routerMode: RouterMode.HISTORY,
})

// 注册子应用
microIframe.registerApps([
  {
    name: 'react-app',
    url: 'http://localhost:3001',
    routeMatch: '/react',
    container: '#micro-app-container',
  },
  {
    name: 'vue-app',
    url: 'http://localhost:3002',
    routeMatch: '/vue',
    container: '#micro-app-container',
  },
])

// 设置导航
const navLinks = document.querySelectorAll('nav a[data-route]')
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const route = (link as HTMLAnchorElement).dataset.route
    if (route) {
      window.history.pushState(null, '', route)
    }
  })
})

// 监听通信
const communication = microIframe.getCommunication()
communication.on('*', (message: unknown) => {
  console.log('收到消息 host:', message)
})

// 导出供调试使用
;(window as unknown as { microIframe: MicroIframe }).microIframe = microIframe

