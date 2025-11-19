import type { AppConfig, AppInstance, AppStatus } from '@micro-iframe/types'
import { AppStatus as Status } from '@micro-iframe/types'

/**
 * 应用注册器
 */
export class AppRegistry {
  private apps: Map<string, AppInstance> = new Map()

  /**
   * 注册应用
   */
  public register(config: AppConfig): void {
    if (this.apps.has(config.name)) {
      throw new Error(`App ${config.name} is already registered`)
    }

    const instance: AppInstance = {
      config,
      status: Status.NOT_LOADED,
    }

    this.apps.set(config.name, instance)
  }

  /**
   * 取消注册应用
   */
  public unregister(name: string): void {
    this.apps.delete(name)
  }

  /**
   * 获取应用实例
   */
  public getApp(name: string): AppInstance | undefined {
    return this.apps.get(name)
  }

  /**
   * 获取所有应用
   */
  public getAllApps(): AppInstance[] {
    return Array.from(this.apps.values())
  }

  /**
   * 根据路由匹配应用
   */
  public matchApps(path: string): AppInstance[] {
    return this.getAllApps().filter((app) => {
      const { routeMatch } = app.config
      return this.matchRoute(routeMatch, path)
    })
  }

  /**
   * 匹配路由规则
   */
  private matchRoute(
    routeMatch: string | RegExp | ((path: string) => boolean),
    path: string
  ): boolean {
    if (typeof routeMatch === 'string') {
      return path.startsWith(routeMatch) || path === routeMatch
    }

    if (routeMatch instanceof RegExp) {
      return routeMatch.test(path)
    }

    if (typeof routeMatch === 'function') {
      return routeMatch(path)
    }

    return false
  }

  /**
   * 更新应用状态
   */
  public updateAppStatus(name: string, status: AppStatus): void {
    const app = this.apps.get(name)
    if (app) {
      app.status = status
    }
  }

  /**
   * 更新应用错误
   */
  public updateAppError(name: string, error: Error): void {
    const app = this.apps.get(name)
    if (app) {
      app.error = error
      app.status = Status.ERROR
    }
  }

  /**
   * 清除应用错误
   */
  public clearAppError(name: string): void {
    const app = this.apps.get(name)
    if (app) {
      app.error = undefined
    }
  }
}

