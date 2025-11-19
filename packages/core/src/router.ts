import type { AppInstance, Message } from '@micro-iframe/types'
import { getCurrentPath } from '@micro-iframe/utils'
import { CommunicationManager } from './communication'
import { AppRegistry } from './registry'
import { AppLoader } from './loader'
import { MessageType, MessageSource } from '@micro-iframe/types'

/**
 * 路由模式
 */
export enum RouterMode {
  HASH = 'hash',
  HISTORY = 'history',
}

/**
 * 路由管理器
 */
export class RouterManager {
  private currentPath = ''
  private currentApps: AppInstance[] = []
  private mode: RouterMode = RouterMode.HISTORY
  private hashChangeHandler?: () => void
  private popStateHandler?: () => void

  constructor(
    private registry: AppRegistry,
    private loader: AppLoader,
    private communication: CommunicationManager
  ) {
    this.init()
  }

  /**
   * 初始化路由管理器
   */
  private init(): void {
    // 监听路由变化
    this.setupRouteListener()

    // 监听子应用路由同步
    this.communication.on(MessageType.ROUTE_SYNC, (message: Message) => {
      if (message.source === MessageSource.MICRO) {
        this.handleRouteSync(message as { route?: string })
      }
    })

    // 初始路由
    this.handleRouteChange()
  }

  /**
   * 设置路由监听器
   */
  private setupRouteListener(): void {
    // 检测路由模式
    if (window.location.hash) {
      this.mode = RouterMode.HASH
    }

    if (this.mode === RouterMode.HASH) {
      // Hash 模式
      this.hashChangeHandler = () => {
        this.handleRouteChange()
      }
      window.addEventListener('hashchange', this.hashChangeHandler)
    } else {
      // History 模式
      this.popStateHandler = () => {
        this.handleRouteChange()
      }
      window.addEventListener('popstate', this.popStateHandler)

      // 拦截 pushState 和 replaceState
      this.interceptHistory()
    }
  }

  /**
   * 拦截 History API
   */
  private interceptHistory(): void {
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      originalPushState.apply(history, args)
      this.handleRouteChange()
    }

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args)
      this.handleRouteChange()
    }
  }

  /**
   * 获取当前路径（根据路由模式决定是否包含 hash）
   */
  private getPath(): string {
    const path = getCurrentPath()
    // History 模式下不包含 hash
    if (this.mode === RouterMode.HISTORY) {
      return path.split('#')[0]
    }
    return path
  }

  /**
   * 处理路由变化
   */
  private async handleRouteChange(force = false): Promise<void> {
    const path = this.getPath()

    // 如果路径没有变化且不是强制检查，直接返回
    // 但如果是强制检查，即使路径相同也要处理（用于应用注册后检查）
    if (!force && path === this.currentPath) {
      return
    }

    this.currentPath = path

    try {
      // 匹配应用
      const matchedApps = this.registry.matchApps(path)

      // 卸载不再匹配的应用
      const appsToUnmount = this.currentApps.filter(
        (app) => !matchedApps.find((matched) => matched.config.name === app.config.name)
      )

      for (const app of appsToUnmount) {
        try {
          await this.unmountApp(app)
        } catch (error) {
          console.error(`Failed to unmount app ${app.config.name}:`, error)
          // 继续处理其他应用
        }
      }

      // 加载新匹配的应用
      const appsToMount = matchedApps.filter(
        (app) =>
          !this.currentApps.find((current) => current.config.name === app.config.name)
      )

      for (const app of appsToMount) {
        try {
          await this.mountApp(app, path)
        } catch (error) {
          console.error(`Failed to mount app ${app.config.name}:`, error)
          // 继续处理其他应用
        }
      }

      // 更新当前应用列表
      this.currentApps = matchedApps.filter((app) =>
        this.currentApps.find((current) => current.config.name === app.config.name)
      ).concat(appsToMount)

      // 发送路由变更消息
      this.communication.emit(MessageType.ROUTE_CHANGE, { route: path })
    } catch (error) {
      console.error('Error handling route change:', error)
      // 不抛出错误，避免阻塞路由变化
    }
  }

  /**
   * 挂载应用
   */
  private async mountApp(app: AppInstance, route: string): Promise<void> {
    try {
      // 加载应用
      await this.loader.loadApp(app)

      // 获取容器
      const container = app.iframe?.parentElement
      if (!container) {
        throw new Error('Container not found')
      }

      // 发送挂载消息
      // 延迟发送，确保子应用的通信管理器已经初始化
      const iframeWindow = app.iframe?.contentWindow
      if (iframeWindow) {
        // 使用 setTimeout 确保子应用的通信管理器已经初始化
        setTimeout(() => {
          try {
            this.communication.sendLifecycle(
              MessageType.MOUNT,
              {
                route,
                meta: app.config.meta,
              },
              iframeWindow
            )
          } catch (error) {
            console.warn(`Failed to send mount message to ${app.config.name}:`, error)
          }
        }, 100)
      }

      // 显示应用
      this.loader.showApp(app)
    } catch (error) {
      console.error(`Failed to mount app ${app.config.name}:`, error)
      throw error
    }
  }

  /**
   * 卸载应用
   */
  private async unmountApp(app: AppInstance): Promise<void> {
    try {
      await this.loader.unmountApp(app)
    } catch (error) {
      console.error(`Failed to unmount app ${app.config.name}:`, error)
    }
  }

  /**
   * 处理路由同步
   */
  private handleRouteSync(message: { route?: string }): void {
    if (message.route) {
      // 同步子应用路由到主应用
      if (this.mode === RouterMode.HASH) {
        window.location.hash = message.route
      } else {
        // History 模式下，去除 hash 部分
        const routeWithoutHash = message.route.split('#')[0]
        history.pushState(null, '', routeWithoutHash)
        this.handleRouteChange()
      }
    }
  }

  /**
   * 设置路由模式
   */
  public setMode(mode: RouterMode): void {
    this.mode = mode
    this.setupRouteListener()
  }

  /**
   * 获取当前路由
   */
  public getCurrentPath(): string {
    return this.currentPath
  }

  /**
   * 获取当前应用
   */
  public getCurrentApps(): AppInstance[] {
    return [...this.currentApps]
  }

  /**
   * 手动触发路由检查（用于应用注册后检查当前路径）
   */
  public checkRoute(): void {
    // 强制检查，即使路径相同也要处理，因为可能有新注册的应用需要加载
    this.handleRouteChange(true)
  }

  /**
   * 销毁路由管理器
   */
  public destroy(): void {
    // 清理监听器
    if (this.hashChangeHandler) {
      window.removeEventListener('hashchange', this.hashChangeHandler)
      this.hashChangeHandler = undefined
    }
    if (this.popStateHandler) {
      window.removeEventListener('popstate', this.popStateHandler)
      this.popStateHandler = undefined
    }
  }
}

