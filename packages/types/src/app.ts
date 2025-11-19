/**
 * 应用激活函数
 */
export type AppActiveFn = (props: AppProps) => Promise<void> | void

/**
 * 应用卸载函数
 */
export type AppUnmountFn = (props: AppProps) => Promise<void> | void

/**
 * 应用更新函数
 */
export type AppUpdateFn = (props: AppProps) => Promise<void> | void

/**
 * 应用生命周期函数
 */
export interface AppLifecycle {
  mount?: AppActiveFn
  unmount?: AppUnmountFn
  update?: AppUpdateFn
}

/**
 * 应用状态
 */
export enum AppStatus {
  NOT_LOADED = 'NOT_LOADED',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  MOUNTING = 'MOUNTING',
  MOUNTED = 'MOUNTED',
  UNMOUNTING = 'UNMOUNTING',
  ERROR = 'ERROR',
}

/**
 * 路由匹配规则
 */
export type RouteMatch = string | RegExp | ((path: string) => boolean)

/**
 * 应用配置
 */
export interface AppConfig {
  /**
   * 应用名称（唯一标识）
   */
  name: string

  /**
   * 应用 URL（支持独立部署）
   */
  url: string

  /**
   * 路由匹配规则
   */
  routeMatch: RouteMatch

  /**
   * 应用容器选择器
   */
  container?: string

  /**
   * 应用生命周期函数
   */
  lifecycle?: AppLifecycle

  /**
   * 应用元数据
   */
  meta?: Record<string, unknown>

  /**
   * 是否缓存应用（卸载时保留 iframe，下次加载时直接恢复）
   * @default false
   */
  cache?: boolean
}

/**
 * 应用实例
 */
export interface AppInstance {
  /**
   * 应用配置
   */
  config: AppConfig

  /**
   * 应用状态
   */
  status: AppStatus

  /**
   * iframe 元素
   */
  iframe?: HTMLIFrameElement

  /**
   * 错误信息
   */
  error?: Error

  /**
   * 是否已经挂载过（用于 cache 模式判断是否需要触发 mount 生命周期）
   */
  hasMounted?: boolean
}

/**
 * 应用属性（传递给子应用）
 */
export interface AppProps {
  /**
   * 应用名称
   */
  name: string

  /**
   * 路由信息
   */
  route: string

  /**
   * 应用元数据
   */
  meta?: Record<string, unknown>
}

