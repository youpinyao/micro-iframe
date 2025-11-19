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

  /**
   * 设置路由监听器
   */
  private setupRouteListener(): void {
    // Hash 模式
    window.addEventListener('hashchange', () => {
      this.syncRoute()
    })

    // History 模式
    window.addEventListener('popstate', () => {
      this.syncRoute()
    })

    // 拦截 pushState 和 replaceState
    this.interceptHistory()
  }

  /**
   * 拦截 History API
   */
  private interceptHistory(): void {
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      originalPushState.apply(history, args)
      this.syncRoute()
    }

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args)
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
   * 导航到指定路由
   */
  public navigate(route: string): void {
    if (route !== this.currentRoute) {
      window.location.href = route
    }
  }

  /**
   * 销毁路由管理器
   */
  public destroy(): void {
    this.routeChangeListeners.clear()
    window.removeEventListener('hashchange', this.syncRoute)
    window.removeEventListener('popstate', this.syncRoute)
  }
}

