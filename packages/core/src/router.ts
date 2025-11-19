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
      window.addEventListener('hashchange', () => {
        this.handleRouteChange()
      })
    } else {
      // History 模式
      window.addEventListener('popstate', () => {
        this.handleRouteChange()
      })

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
   * 处理路由变化
   */
  private async handleRouteChange(): Promise<void> {
    const path = getCurrentPath()

    if (path === this.currentPath) {
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
      const iframeWindow = app.iframe?.contentWindow
      if (iframeWindow) {
        this.communication.emit(
          MessageType.MOUNT,
          {
            route,
            meta: app.config.meta,
          },
          iframeWindow
        )
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
        history.pushState(null, '', message.route)
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
   * 销毁路由管理器
   */
  public destroy(): void {
    // 清理监听器
    window.removeEventListener('hashchange', this.handleRouteChange)
    window.removeEventListener('popstate', this.handleRouteChange)
  }
}

