import type { MicroApp } from './micro-app'

/**
 * React Router 相关依赖
 */
export interface ReactRouterDependencies {
  useLocation: typeof import('react-router-dom').useLocation
  useNavigate: typeof import('react-router-dom').useNavigate
  useEffect: typeof import('react').useEffect
  useRef: typeof import('react').useRef
}

/**
 * 创建路由同步 Hook（工厂函数）
 */
export function createUseRouteSync(reactRouter: ReactRouterDependencies) {
  const { useLocation, useNavigate, useEffect, useRef } = reactRouter

  /**
   * React Hook：自动处理路由同步
   */
  return function useRouteSync(microApp: MicroApp): void {
    const location = useLocation()
    const navigate = useNavigate()
    const isInitialMount = useRef(true)

    useEffect(() => {
      // 监听路由变化，同步到微前端系统
      const syncRoute = () => {
        // 如果是首次挂载，跳过同步（主应用已经发送了初始路由）
        if (isInitialMount.current) {
          isInitialMount.current = false
          return
        }

        const fullPath = location.pathname + location.search + location.hash
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
      }

      // 路由变化时同步
      syncRoute()

      // 监听微前端路由变化，同步到 React Router
      const unsubscribe = microApp.router.onRouteChange((route) => {
        const props = microApp.getCurrentProps()
        const baseRoute = props?.route || ''

        // 主应用现在发送的已经是子应用的路由部分，直接使用
        let targetPath = route
        // 如果主应用发送的是完整路径（兼容旧版本），提取子应用路由部分
        if (baseRoute && route.startsWith(baseRoute)) {
          targetPath = route.substring(baseRoute.length) || '/'
        }

        if (targetPath !== location.pathname) {
          // 使用 React Router 的 navigate 方法
          navigate(targetPath, { replace: true })
        }
      })

      return unsubscribe
    }, [microApp, location, navigate])
  }
}
