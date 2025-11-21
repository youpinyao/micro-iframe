import { createRouterProxy } from '@micro-iframe/core'

// 当前路由状态
let currentRoute = window.location.pathname

// 更新导航链接的激活状态
const updateActiveNav = (route: string) => {
  const navLinks = document.querySelectorAll('nav a')
  navLinks.forEach((link) => {
    const linkRoute = link.getAttribute('data-route')
    if (linkRoute === route) {
      link.classList.add('active')
    } else {
      link.classList.remove('active')
    }
  })
}

// 创建路由代理
const routerProxy = createRouterProxy({
  proxyHistory: true,
  proxyAnchorClick: true,
})

// 初始化导航链接的激活状态
updateActiveNav(currentRoute)

// 注意：导航链接的点击由路由代理的 proxyAnchorClick 统一处理
// 不需要手动添加事件监听器，避免重复处理

// 监听浏览器前进后退
window.addEventListener('popstate', () => {
  const newRoute = window.location.pathname

  updateActiveNav(newRoute)
  console.log('浏览器导航:', newRoute)
})

// 初始化时同步路由状态
console.log('路由代理已初始化，当前路由:', currentRoute)

// 导出路由代理实例，供其他模块使用
export { routerProxy }
