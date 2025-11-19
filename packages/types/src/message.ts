/**
 * 消息类型
 */
export enum MessageType {
  // 生命周期消息
  MOUNT = 'MOUNT',
  UNMOUNT = 'UNMOUNT',
  UPDATE = 'UPDATE',

  // 路由消息
  ROUTE_CHANGE = 'ROUTE_CHANGE',
  ROUTE_SYNC = 'ROUTE_SYNC',

  // 通信消息
  EVENT = 'EVENT',
  REQUEST = 'REQUEST',
  RESPONSE = 'RESPONSE',

  // 数据共享
  DATA_SET = 'DATA_SET',
  DATA_GET = 'DATA_GET',
}

/**
 * 消息源
 */
export enum MessageSource {
  HOST = 'HOST',
  MICRO = 'MICRO',
}

/**
 * 消息基础结构
 */
export interface BaseMessage {
  /**
   * 消息类型
   */
  type: MessageType

  /**
   * 消息源
   */
  source: MessageSource

  /**
   * 目标应用名称（可选，用于定向通信）
   */
  target?: string

  /**
   * 消息 ID（用于请求/响应匹配）
   */
  id?: string

  /**
   * 时间戳
   */
  timestamp: number
}

/**
 * 事件消息
 */
export interface EventMessage extends BaseMessage {
  type: MessageType.EVENT
  event: string
  payload?: unknown
}

/**
 * 请求消息
 */
export interface RequestMessage extends BaseMessage {
  type: MessageType.REQUEST
  method: string
  params?: unknown
}

/**
 * 响应消息
 */
export interface ResponseMessage extends BaseMessage {
  type: MessageType.RESPONSE
  success: boolean
  data?: unknown
  error?: string
}

/**
 * 路由变更消息
 */
export interface RouteChangeMessage extends BaseMessage {
  type: MessageType.ROUTE_CHANGE
  route: string
}

/**
 * 路由同步消息
 */
export interface RouteSyncMessage extends BaseMessage {
  type: MessageType.ROUTE_SYNC
  route: string
}

/**
 * 数据设置消息
 */
export interface DataSetMessage extends BaseMessage {
  type: MessageType.DATA_SET
  key: string
  value: unknown
}

/**
 * 数据获取消息
 */
export interface DataGetMessage extends BaseMessage {
  type: MessageType.DATA_GET
  key: string
}

/**
 * 生命周期消息
 */
export interface LifecycleMessage extends BaseMessage {
  type: MessageType.MOUNT | MessageType.UNMOUNT | MessageType.UPDATE
  props?: {
    route: string
    meta?: Record<string, unknown>
  }
}

/**
 * 所有消息类型的联合
 */
export type Message =
  | EventMessage
  | RequestMessage
  | ResponseMessage
  | RouteChangeMessage
  | RouteSyncMessage
  | DataSetMessage
  | DataGetMessage
  | LifecycleMessage

/**
 * 消息处理器类型
 */
export type MessageHandler = (message: Message) => void | Promise<void>

