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
  private isSyncingFromMicro = false

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
        // 如果是从子应用同步的路由变化，不触发路由处理（避免循环）
        if (!this.isSyncingFromMicro) {
          this.handleRouteChange()
        }
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
      // 如果是从子应用同步的路由变化，不触发路由处理（避免循环）
      if (!this.isSyncingFromMicro) {
        this.handleRouteChange()
      }
    }

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args)
      // 如果是从子应用同步的路由变化，不触发路由处理（避免循环）
      if (!this.isSyncingFromMicro) {
        this.handleRouteChange()
      }
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

      // 发送路由变更消息给匹配的应用
      // 针对每个匹配的应用，提取子应用路由部分并发送
      // 只发送给已经挂载的应用（有 iframe 的应用）
      // 排除刚刚挂载的应用，因为它们已经在 mountApp 中收到了初始路由
      for (const app of matchedApps) {
        const iframeWindow = app.iframe?.contentWindow
        // 如果应用刚刚挂载，跳过发送路由变更消息（已经在 mountApp 中发送了初始路由）
        const isJustMounted = appsToMount.find((mounted) => mounted.config.name === app.config.name)
        if (iframeWindow && !isJustMounted) {
          try {
            const subRoute = this.extractSubRoute(path, app.config.routeMatch)
            this.communication.sendRouteChange(subRoute, iframeWindow)
          } catch (error) {
            console.warn(`Failed to send route change to ${app.config.name}:`, error)
          }
        }
      }
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

      // 如果是 cache 模式且已经挂载过，只显示应用，不触发 mount 生命周期
      const isFromCache = app.config.cache && app.hasMounted

      if (!isFromCache) {
        // 发送挂载消息（首次挂载或非 cache 模式）
        // 延迟发送，确保子应用的通信管理器已经初始化
        const iframeWindow = app.iframe?.contentWindow
        if (iframeWindow) {
          // 使用 setTimeout 确保子应用的通信管理器已经初始化
          setTimeout(() => {
            try {
              // 发送基础路径（routeMatch）而不是完整路径，让子应用知道自己的基础路径
              const baseRoute = typeof app.config.routeMatch === 'string' 
                ? app.config.routeMatch 
                : ''
              this.communication.sendLifecycle(
                MessageType.MOUNT,
                {
                  name: app.config.name,
                  route: baseRoute,
                  meta: app.config.meta,
                },
                iframeWindow
              )
            } catch (error) {
              console.warn(`Failed to send mount message to ${app.config.name}:`, error)
            }
          }, 100)
        }
        // 标记为已挂载
        app.hasMounted = true
      }

      // 显示应用
      this.loader.showApp(app)

      // 发送初始路由给子应用（确保子应用知道当前路由）
      const iframeWindow = app.iframe?.contentWindow
      if (iframeWindow) {
        // 延迟发送，确保子应用的路由管理器已经初始化
        setTimeout(() => {
          try {
            const subRoute = this.extractSubRoute(route, app.config.routeMatch)
            this.communication.sendRouteChange(subRoute, iframeWindow)
          } catch (error) {
            console.warn(`Failed to send initial route to ${app.config.name}:`, error)
          }
        }, 150)
      }
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
   * 从完整路径中提取子应用的路由部分
   */
  private extractSubRoute(fullPath: string, routeMatch: string | RegExp | ((path: string) => boolean)): string {
    if (typeof routeMatch === 'string') {
      // 字符串匹配：去掉匹配的前缀
      if (fullPath.startsWith(routeMatch)) {
        const subRoute = fullPath.substring(routeMatch.length)
        // 如果子路由为空，返回 '/'，否则返回子路由
        return subRoute || '/'
      }
      // 如果完全匹配，返回 '/'
      if (fullPath === routeMatch) {
        return '/'
      }
      return fullPath
    }

    if (routeMatch instanceof RegExp) {
      // 正则匹配：尝试提取匹配组
      const match = fullPath.match(routeMatch)
      if (match && match[1]) {
        // 如果有捕获组，返回第一个捕获组
        return match[1] || '/'
      }
      // 如果没有捕获组，尝试去掉匹配的部分
      if (match) {
        const matchedPart = match[0]
        const subRoute = fullPath.substring(matchedPart.length)
        return subRoute || '/'
      }
      return fullPath
    }

    if (typeof routeMatch === 'function') {
      // 函数匹配：无法自动提取，返回完整路径
      // 子应用需要自己处理
      return fullPath
    }

    return fullPath
  }

  /**
   * 处理路由同步
   */
  private handleRouteSync(message: { route?: string }): void {
    if (message.route) {
      const routeWithoutHash = message.route.split('#')[0]
      
      // 如果路径没有变化，直接返回
      if (routeWithoutHash === this.currentPath) {
        return
      }

      // 同步子应用路由到主应用
      if (this.mode === RouterMode.HASH) {
        // 标记为来自子应用的同步，避免循环触发
        this.isSyncingFromMicro = true
        try {
          window.location.hash = message.route
          // 更新当前路径
          this.currentPath = message.route
        } finally {
          this.isSyncingFromMicro = false
        }
      } else {
        // History 模式下，去除 hash 部分
        // 标记为来自子应用的同步，避免循环触发
        this.isSyncingFromMicro = true
        try {
          // 保留现有的 history.state
          history.pushState(history.state, '', routeWithoutHash)
          // 更新当前路径
          this.currentPath = routeWithoutHash
          // 不触发 handleRouteChange，因为子应用已经在运行，只需要更新 URL
        } finally {
          this.isSyncingFromMicro = false
        }
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

