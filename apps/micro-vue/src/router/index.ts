import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { MicroApp } from '@micro-iframe/sdk'

/**
 * 创建 Vue Router 实例，与微前端路由系统集成
 */
export function createVueRouter(microApp: MicroApp) {
  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/page1',
      name: 'Page1',
      component: () => import('../views/Page1.vue'),
    },
    {
      path: '/page2',
      name: 'Page2',
      component: () => import('../views/Page2.vue'),
    },
    {
      path: '/detail',
      name: 'Detail',
      component: () => import('../views/Detail.vue'),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings.vue'),
    },
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  // 监听路由变化，同步到微前端系统
  router.afterEach((to) => {
    const fullPath = to.fullPath
    // 获取主应用的基础路径（从 props 中获取）
    const props = microApp.getCurrentProps()
    const baseRoute = props?.route || ''
    
    // 构建完整路径（主应用路径 + 子应用路径）
    // 如果 fullPath 已经是完整路径，直接使用；否则拼接
    let syncPath = fullPath
    if (baseRoute && !fullPath.startsWith(baseRoute)) {
      // 确保路径正确拼接
      const base = baseRoute.endsWith('/') ? baseRoute.slice(0, -1) : baseRoute
      syncPath = `${base}${fullPath}`
    }
    
    // 同步路由到主应用（使用 navigate 方法，replace 模式避免历史记录堆积）
    const currentMicroRoute = microApp.router.getCurrentRoute()
    if (syncPath !== currentMicroRoute) {
      microApp.router.navigate(syncPath, { replace: true })
    }
  })

  // 监听微前端路由变化，同步到 Vue Router
  microApp.router.onRouteChange((route) => {
    const currentRoute = router.currentRoute.value.fullPath
    // 提取子应用的路由部分（去掉主应用的基础路径）
    const props = microApp.getCurrentProps()
    const baseRoute = props?.route || ''
    
    let targetPath = route
    if (baseRoute && route.startsWith(baseRoute)) {
      targetPath = route.substring(baseRoute.length) || '/'
    }
    
    // 如果路由不同，则同步
    if (targetPath !== currentRoute) {
      router.push(targetPath).catch(() => {
        // 忽略导航重复的错误
      })
    }
  })

  return router
}

