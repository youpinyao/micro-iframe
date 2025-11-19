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
    cache: true,
  },
  {
    name: 'vue-app',
    url: 'http://localhost:3002',
    routeMatch: '/vue',
    container: '#micro-app-container',
    cache: true,
  },
])

// 更新导航 active 状态
const updateNavActive = () => {
  const currentPath = window.location.pathname
  const navLinks = document.querySelectorAll('nav a[data-route]')
  
  navLinks.forEach((link) => {
    const linkElement = link as HTMLAnchorElement
    const linkRoute = linkElement.dataset.route || ''
    
    // 移除所有 active 类
    linkElement.classList.remove('active')
    
    // 判断是否应该激活
    // 如果当前路径完全匹配，或者当前路径以该路由开头（且不是根路径）
    if (linkRoute === '/' && currentPath === '/') {
      linkElement.classList.add('active')
    } else if (linkRoute !== '/' && currentPath.startsWith(linkRoute)) {
      linkElement.classList.add('active')
    }
  })
}

// 设置导航
const navLinks = document.querySelectorAll('nav a[data-route]')
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const route = (link as HTMLAnchorElement).dataset.route
    if (route) {
      // 保留现有的 history.state
      window.history.pushState(history.state, '', route)
      // 更新导航状态
      updateNavActive()
    }
  })
})

// 监听路由变化，更新导航状态
const router = microIframe.getRouter()
const communication = microIframe.getCommunication()

// 监听通信管理器中的路由变化事件
communication.on('ROUTE_CHANGE', () => {
  setTimeout(() => {
    updateNavActive()
  }, 0)
})

// 监听 popstate 事件（浏览器前进后退）
window.addEventListener('popstate', () => {
  setTimeout(() => {
    updateNavActive()
  }, 0)
})

// 拦截 pushState 和 replaceState
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function (...args) {
  originalPushState.apply(history, args)
  setTimeout(() => {
    updateNavActive()
  }, 0)
}

history.replaceState = function (...args) {
  originalReplaceState.apply(history, args)
  setTimeout(() => {
    updateNavActive()
  }, 0)
}

// 初始化导航状态
updateNavActive()

// 监听通信（除了路由变化，因为已经在上面单独监听了）
communication.on('*', (message: unknown) => {
  console.log('收到消息 host:', message)
})

// 导出供调试使用
;(window as unknown as { microIframe: MicroIframe }).microIframe = microIframe

