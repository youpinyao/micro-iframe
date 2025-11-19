import { MicroCommunication } from './communication'
import { LifecycleManager, type LifecycleHook } from './lifecycle'
import { MicroRouter } from './router'
import type { AppProps } from '@micro-iframe/types'

/**
 * 检测是否在微前端环境中
 */
export function isMicroApp(): boolean {
  return window.self !== window.top
}

/**
 * 微前端子应用类
 */
export class MicroApp {
  public communication: MicroCommunication
  public lifecycle: LifecycleManager
  public router: MicroRouter

  constructor() {
    // 初始化通信管理器
    this.communication = new MicroCommunication()

    // 初始化生命周期管理器
    this.lifecycle = new LifecycleManager(this.communication)

    // 初始化路由管理器，传入 MicroApp 实例以便访问 baseRoute
    this.router = new MicroRouter(this.communication, this)
  }

  /**
   * 设置挂载钩子
   */
  public onMount(hook: LifecycleHook): void {
    this.lifecycle.onMount(hook)
  }

  /**
   * 设置卸载钩子
   */
  public onUnmount(hook: LifecycleHook): void {
    this.lifecycle.onUnmount(hook)
  }

  /**
   * 设置更新钩子
   */
  public onUpdate(hook: LifecycleHook): void {
    this.lifecycle.onUpdate(hook)
  }

  /**
   * 获取当前属性
   */
  public getCurrentProps(): AppProps | undefined {
    return this.lifecycle.getCurrentProps()
  }

  /**
   * 检查是否在微前端环境中
   */
  public isMicroApp(): boolean {
    return isMicroApp()
  }

  /**
   * 销毁应用
   */
  public destroy(): void {
    this.router.destroy()
    this.communication.destroy()
  }
}

/**
 * 创建微前端应用实例
 */
export function createMicroApp(): MicroApp {
  return new MicroApp()
}

