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

// 处理路由跳转
const handleRouteChange = (url: string, replace = false) => {
  try {
    const urlObj = new URL(url, window.location.href)
    const newRoute = urlObj.pathname

    // 如果路由没有变化，允许跳转（可能是 hash 或 query 变化）
    if (newRoute === currentRoute) {
      console.log(`路由未变化，但允许跳转（可能是 hash 或 query 变化）: ${url}`)
      return true
    }

    console.log(`路由跳转: ${currentRoute} -> ${newRoute}`, { replace, fullUrl: url })

    // 更新当前路由
    currentRoute = newRoute

    // 更新导航链接激活状态
    updateActiveNav(newRoute)

    // 这里可以添加更多的路由处理逻辑
    // 例如：加载对应的微前端应用、更新页面内容等

    // 返回 true 表示允许跳转，false 表示阻止跳转
    return true
  } catch (error) {
    console.error('路由跳转处理失败:', error, { url })
    // 解析失败时，仍然允许跳转，让浏览器处理
    return true
  }
}

// 创建路由代理
const routerProxy = createRouterProxy({
  onNavigate: handleRouteChange,
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
  if (newRoute !== currentRoute) {
    currentRoute = newRoute
    updateActiveNav(newRoute)
    console.log('浏览器导航:', newRoute)
  }
})

// 初始化时同步路由状态
console.log('路由代理已初始化，当前路由:', currentRoute)

// 导出路由代理实例，供其他模块使用
export { routerProxy }
