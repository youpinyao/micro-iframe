import { createMicroIframe } from '@micro-iframe/core'

// 当前路由状态
let currentRoute = window.location.pathname

// 更新导航链接的激活状态
const updateActiveNav = (route: string) => {
  const navLinks = document.querySelectorAll('nav a')
  navLinks.forEach((link) => {
    const linkRoute = link.getAttribute('href')
    if (linkRoute === route) {
      link.classList.add('active')
    } else {
      link.classList.remove('active')
    }
  })
}

// 创建路由代理
const routerProxy = createMicroIframe({
  routerProxy: {
    onChange: () => {
      const newRoute = window.location.pathname
      updateActiveNav(newRoute)
      console.log('路由变化:', newRoute)
    },
  },
  container: 'micro-app-container',
  apps: [
    {
      name: 'react',
      url: 'http://localhost:3001',
    },
    {
      name: 'vue',
      url: 'http://localhost:3002',
    },
    {
      name: 'html',
      url: 'http://localhost:3003',
    },
  ],
})

// 初始化导航链接的激活状态
updateActiveNav(currentRoute)

// 初始化时同步路由状态
console.log('路由代理已初始化，当前路由:', currentRoute)

// 导出路由代理实例，供其他模块使用
export { routerProxy }
