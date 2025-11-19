import type { AppConfig } from '@micro-iframe/types'
import { MessageSource } from '@micro-iframe/types'
import { AppRegistry } from './registry'
import { AppLoader } from './loader'
import { RouterManager, RouterMode } from './router'
import { CommunicationManager } from './communication'

/**
 * 微前端框架主类
 */
export class MicroIframe {
  private registry: AppRegistry
  private communication: CommunicationManager
  private loader: AppLoader
  private router: RouterManager

  constructor(options?: { routerMode?: RouterMode }) {
    // 初始化通信管理器
    this.communication = new CommunicationManager(MessageSource.HOST)

    // 初始化应用注册器
    this.registry = new AppRegistry()

    // 初始化应用加载器
    this.loader = new AppLoader(this.communication)

    // 初始化路由管理器
    this.router = new RouterManager(
      this.registry,
      this.loader,
      this.communication
    )

    if (options?.routerMode) {
      this.router.setMode(options.routerMode)
    }
  }

  /**
   * 注册应用
   */
  public registerApp(config: AppConfig): void {
    this.registry.register(config)
    // 注册后检查当前路径，如果匹配则自动加载
    this.router.checkRoute()
  }

  /**
   * 注册多个应用
   */
  public registerApps(configs: AppConfig[]): void {
    configs.forEach((config) => this.registry.register(config))
    // 所有应用注册后检查当前路径，如果匹配则自动加载
    this.router.checkRoute()
  }

  /**
   * 取消注册应用（如果应用有缓存，会先销毁缓存）
   */
  public async unregisterApp(name: string): Promise<void> {
    const app = this.registry.getApp(name)
    if (app && app.iframe) {
      // 如果应用有缓存，先销毁缓存
      await this.loader.destroyCache(app).catch(() => {
        // 忽略销毁错误
      })
    }
    this.registry.unregister(name)
  }

  /**
   * 清理指定应用的缓存（真正卸载并移除 iframe，触发 unmount 生命周期）
   */
  public async clearCache(name: string): Promise<void> {
    const app = this.registry.getApp(name)
    if (app && app.iframe && app.config.cache) {
      await this.loader.destroyCache(app)
    }
  }

  /**
   * 获取应用实例
   */
  public getApp(name: string) {
    return this.registry.getApp(name)
  }

  /**
   * 获取所有应用
   */
  public getAllApps() {
    return this.registry.getAllApps()
  }

  /**
   * 获取当前应用
   */
  public getCurrentApps() {
    return this.router.getCurrentApps()
  }

  /**
   * 获取通信管理器
   */
  public getCommunication() {
    return this.communication
  }

  /**
   * 获取路由管理器
   */
  public getRouter() {
    return this.router
  }

  /**
   * 设置路由模式
   */
  public setRouterMode(mode: RouterMode): void {
    this.router.setMode(mode)
  }

  /**
   * 销毁框架
   */
  public async destroy(): Promise<void> {
    // 销毁所有应用（包括缓存的应用）
    const apps = this.registry.getAllApps()
    await Promise.all(
      apps.map((app) => {
        if (app.iframe) {
          // 如果有缓存，使用 destroyCache 真正销毁
          if (app.config.cache) {
            return this.loader.destroyCache(app).catch(() => {
              // 忽略销毁错误
            })
          } else {
            return this.loader.unmountApp(app).catch(() => {
              // 忽略卸载错误
            })
          }
        }
        return Promise.resolve()
      })
    )

    // 销毁路由管理器
    this.router.destroy()

    // 销毁通信管理器
    this.communication.destroy()

    // 清空注册表
    apps.forEach((app) => {
      this.registry.unregister(app.config.name)
    })
  }
}

