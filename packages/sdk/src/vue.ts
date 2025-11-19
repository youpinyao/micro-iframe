import { createMicroApp, type MicroApp } from './micro-app'
import type { AppProps } from '@micro-iframe/types'

/**
 * Vue 相关依赖
 */
export interface VueDependencies {
  createApp: typeof import('vue').createApp
  provide: typeof import('vue').provide
  h: typeof import('vue').h
  createRouter: typeof import('vue-router').createRouter
  createWebHistory: typeof import('vue-router').createWebHistory
}

/**
 * Vue 微前端应用初始化选项
 */
export interface VueMicroAppOptions {
  /**
   * Vue 相关依赖（从子应用传入）
   */
  vue: VueDependencies
  /**
   * 根组件
   */
  rootComponent: any
  /**
   * 路由配置
   */
  routes: any[] // 使用 any 避免类型依赖
  /**
   * 挂载容器 ID（默认：'app'）
   */
  containerId?: string
  /**
   * 生命周期钩子
   */
  onMount?: (props: AppProps) => void | Promise<void>
  onUnmount?: (props: AppProps) => void | Promise<void>
  onUpdate?: (props: AppProps) => void | Promise<void>
}

/**
 * 初始化 Vue 微前端应用
 */
export function initVueMicroApp(options: VueMicroAppOptions): MicroApp {
  const {
    vue,
    rootComponent,
    routes,
    containerId = 'app',
    onMount,
    onUnmount,
    onUpdate,
  } = options

  const { createApp, provide, h, createRouter, createWebHistory } = vue

  // 创建微前端应用实例
  const microApp = createMicroApp()

  let appInstance: ReturnType<typeof createApp> | null = null

  // 设置生命周期钩子
  microApp.onMount(async (props) => {
    if (onMount) {
      await onMount(props)
    }

    // 如果应用实例已存在，先卸载
    if (appInstance) {
      appInstance.unmount()
      appInstance = null
    }

    // 创建 Vue Router
    const router = createVueRouter(microApp, routes, vue)

    // 创建包装组件，通过 provide 传递 microApp
    const WrappedComponent = {
      setup() {
        // 使用 provide 传递 microApp，确保所有子组件都能通过 inject 访问
        provide('microApp', microApp)
        // 使用 h 函数渲染原始组件
        return () => h(rootComponent)
      },
    }

    // 创建新的应用实例
    appInstance = createApp(WrappedComponent)
    // 先设置 router，确保 provide/inject 正确初始化
    appInstance.use(router)
    // 挂载应用
    appInstance.mount(`#${containerId}`)
  })

  microApp.onUnmount((props) => {
    if (onUnmount) {
      onUnmount(props)
    }

    if (appInstance) {
      appInstance.unmount()
      appInstance = null
    }
  })

  microApp.onUpdate((props) => {
    if (onUpdate) {
      onUpdate(props)
    }
  })

  return microApp
}

/**
 * 创建 Vue Router 实例，与微前端路由系统集成
 */
function createVueRouter(microApp: MicroApp, routes: any[], vue: VueDependencies) {
  const { createRouter, createWebHistory } = vue
  
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
  router.afterEach((to: any, from: any) => {
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

