import { MessageType, Message, RouteChangeMessage, MessageHandler } from '@micro-iframe/types'
import { getCurrentPath } from '@micro-iframe/utils'

/**
 * 路由管理器（子应用）
 */
export class MicroRouter {
  private currentRoute = ''
  private routeChangeListeners: Set<(route: string) => void> = new Set()

  constructor(
    private communication: {
      on: (type: string, handler: MessageHandler) => () => void
      emit: (event: string, payload?: unknown) => void
    }
  ) {
    this.init()
  }

  /**
   * 初始化路由管理器
   */
  private init(): void {
    // 监听主应用路由变化
    this.communication.on(MessageType.ROUTE_CHANGE, (message: Message) => {
      if (message.type === MessageType.ROUTE_CHANGE) {
        const routeMessage = message as RouteChangeMessage
        if (routeMessage.route) {
          this.handleRouteChange(routeMessage.route)
        }
      }
    })

    // 监听子应用内部路由变化
    this.setupRouteListener()

    // 初始化当前路由
    this.currentRoute = getCurrentPath()
  }

  private hashChangeHandler?: () => void
  private popStateHandler?: () => void
  private originalPushState?: typeof history.pushState
  private originalReplaceState?: typeof history.replaceState

  /**
   * 设置路由监听器
   */
  private setupRouteListener(): void {
    // Hash 模式
    this.hashChangeHandler = () => {
      this.syncRoute()
    }
    window.addEventListener('hashchange', this.hashChangeHandler)

    // History 模式
    this.popStateHandler = () => {
      this.syncRoute()
    }
    window.addEventListener('popstate', this.popStateHandler)

    // 拦截 pushState 和 replaceState
    this.interceptHistory()
  }

  /**
   * 拦截 History API
   */
  private interceptHistory(): void {
    this.originalPushState = history.pushState
    this.originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      this.originalPushState?.apply(history, args)
      this.syncRoute()
    }

    history.replaceState = (...args) => {
      this.originalReplaceState?.apply(history, args)
      this.syncRoute()
    }
  }

  /**
   * 同步路由到主应用
   */
  private syncRoute(): void {
    const route = getCurrentPath()
    if (route !== this.currentRoute) {
      this.currentRoute = route
      this.communication.emit(MessageType.ROUTE_SYNC, { route })
    }
  }

  /**
   * 处理路由变化
   */
  private handleRouteChange(route: string): void {
    if (route !== this.currentRoute) {
      this.currentRoute = route
      this.notifyRouteChange(route)
    }
  }

  /**
   * 通知路由变化
   */
  private notifyRouteChange(route: string): void {
    this.routeChangeListeners.forEach((listener) => {
      try {
        listener(route)
      } catch (error) {
        console.error('Error in route change listener:', error)
      }
    })
  }

  /**
   * 获取当前路由
   */
  public getCurrentRoute(): string {
    return this.currentRoute
  }

  /**
   * 监听路由变化
   */
  public onRouteChange(listener: (route: string) => void): () => void {
    this.routeChangeListeners.add(listener)
    return () => {
      this.routeChangeListeners.delete(listener)
    }
  }

  /**
   * 导航到指定路由（使用 pushState，不刷新页面）
   */
  public navigate(route: string, options?: { replace?: boolean }): void {
    const targetRoute = this.resolveRoute(route)
    if (targetRoute === this.currentRoute) {
      return
    }

    // 判断路由模式（检查当前 URL 是否有 hash）
    // 注意：在 iframe 中，子应用可能使用 hash 模式，需要根据实际情况判断
    const hasHash = window.location.hash !== ''
    
    if (hasHash) {
      // Hash 模式：使用 hash 进行路由
      // 确保 hash 格式正确（去掉开头的 #，因为 window.location.hash 会自动添加）
      const hashValue = targetRoute.startsWith('#') ? targetRoute.substring(1) : targetRoute
      if (options?.replace) {
        // replace 模式：使用 replaceState 替换 hash
        const newUrl = `${window.location.pathname}${window.location.search}#${hashValue}`
        history.replaceState(null, '', newUrl)
        // 手动触发同步
        this.syncRoute()
      } else {
        // push 模式：直接设置 hash，会触发 hashchange 事件
        window.location.hash = hashValue
      }
    } else {
      // History 模式：使用 pushState/replaceState
      if (options?.replace) {
        history.replaceState(null, '', targetRoute)
      } else {
        history.pushState(null, '', targetRoute)
      }
      // 手动触发同步（因为拦截器已经设置，但需要确保同步）
      this.syncRoute()
    }
  }

  /**
   * 使用 pushState 导航到指定路由
   */
  public push(route: string): void {
    this.navigate(route, { replace: false })
  }

  /**
   * 使用 replaceState 替换当前路由
   */
  public replace(route: string): void {
    this.navigate(route, { replace: true })
  }

  /**
   * 前进或后退指定步数
   */
  public go(delta: number): void {
    history.go(delta)
    // 等待浏览器处理后再同步
    setTimeout(() => {
      this.syncRoute()
    }, 0)
  }

  /**
   * 后退一步
   */
  public back(): void {
    this.go(-1)
  }

  /**
   * 前进一步
   */
  public forward(): void {
    this.go(1)
  }

  /**
   * 解析路由（支持相对路径和绝对路径）
   */
  private resolveRoute(route: string): string {
    // 如果是绝对路径，直接返回
    if (route.startsWith('/')) {
      return route
    }

    // 如果是相对路径，基于当前路由解析
    const current = this.currentRoute || getCurrentPath()
    const currentDir = current.substring(0, current.lastIndexOf('/') || 0) || '/'

    // 处理相对路径
    if (route.startsWith('./')) {
      return currentDir + route.substring(1)
    }

    if (route.startsWith('../')) {
      let path = currentDir
      let relative = route

      while (relative.startsWith('../')) {
        const lastSlash = path.lastIndexOf('/')
        if (lastSlash > 0) {
          path = path.substring(0, lastSlash)
        } else {
          path = '/'
        }
        relative = relative.substring(3)
      }

      return path === '/' ? `/${relative}` : `${path}/${relative}`
    }

    // 默认作为当前目录下的路径
    return currentDir === '/' ? `/${route}` : `${currentDir}/${route}`
  }

  /**
   * 销毁路由管理器
   */
  public destroy(): void {
    this.routeChangeListeners.clear()

    // 移除事件监听器
    if (this.hashChangeHandler) {
      window.removeEventListener('hashchange', this.hashChangeHandler)
      this.hashChangeHandler = undefined
    }

    if (this.popStateHandler) {
      window.removeEventListener('popstate', this.popStateHandler)
      this.popStateHandler = undefined
    }

    // 恢复原始的 History API
    if (this.originalPushState) {
      history.pushState = this.originalPushState
      this.originalPushState = undefined
    }

    if (this.originalReplaceState) {
      history.replaceState = this.originalReplaceState
      this.originalReplaceState = undefined
    }
  }
}

