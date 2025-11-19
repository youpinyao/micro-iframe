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

  // 标记是否正在初始化，避免初始化时的重复同步
  let isInitializing = true
  // 初始化完成后，延迟一小段时间再允许同步
  setTimeout(() => {
    isInitializing = false
  }, 200)

  // 监听路由变化，同步到微前端系统
  router.afterEach((to, from) => {
    // 如果正在初始化，且是从根路径重定向，跳过同步（避免重复）
    if (isInitializing && from.path === '/' && to.path !== '/') {
      return
    }

    const fullPath = to.fullPath
    // 获取主应用的基础路径（从 props 中获取）
    const props = microApp.getCurrentProps()
    const baseRoute = props?.route || ''
    
    // 构建完整路径（主应用路径 + 子应用路径）
    // baseRoute 是主应用的基础路径（如 /react），fullPath 是子应用内部路径（如 /home）
    // 需要拼接成完整路径（如 /react/home）
    let syncPath = fullPath
    // 只有当子应用路径不是以 baseRoute 开头时才拼接（避免重复）
    if (baseRoute && !fullPath.startsWith(baseRoute)) {
      const base = baseRoute.endsWith('/') ? baseRoute.slice(0, -1) : baseRoute
      // 确保子应用路径以 / 开头
      const subPath = fullPath.startsWith('/') ? fullPath : `/${fullPath}`
      syncPath = `${base}${subPath}`
    }
    
    // 直接同步路由到主应用（不通过 navigate，避免重复处理）
    microApp.router.syncRouteToHost(syncPath)
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

