import type {
  Message,
  MessageHandler,
  EventMessage,
  RequestMessage,
  ResponseMessage,
  LifecycleMessage,
} from '@micro-iframe/types'
import { MessageSource, MessageType } from '@micro-iframe/types'

/**
 * 通信管理器
 */
export class CommunicationManager {
  private handlers: Map<MessageType | string, Set<MessageHandler>> = new Map()
  private requestHandlers: Map<
    string,
    {
      resolve: (value: unknown) => void
      reject: (reason?: unknown) => void
      timeout: NodeJS.Timeout
    }
  > = new Map()
  private requestIdCounter = 0
  private requestTimeout = 30000

  constructor(private source: MessageSource) {
    this.init()
  }

  /**
   * 初始化消息监听
   */
  private init(): void {
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent<Message>): void {
    let message: Message

    try {
      message = event.data

      // 验证消息格式
      if (!message || typeof message !== 'object') {
        return
      }

      if (!message.type || !message.source) {
        return
      }

      // 忽略来自同一源的消息
      if (message.source === this.source) {
        return
      }
    } catch (error) {
      // 忽略无效消息
      console.warn('Invalid message received:', error)
      return
    }

    // 处理响应消息
    if (message.type === MessageType.RESPONSE && message.id) {
      const requestHandler = this.requestHandlers.get(message.id)
      if (requestHandler) {
        clearTimeout(requestHandler.timeout)
        if (message.success) {
          requestHandler.resolve(message.data)
        } else {
          requestHandler.reject(new Error(message.error || 'Request failed'))
        }
        this.requestHandlers.delete(message.id)
        return
      }
    }

    // 处理其他消息类型
    this.triggerHandlers(message.type, message)
    this.triggerHandlers('*', message)
  }

  /**
   * 发送消息
   */
  private sendMessage(
    message: Omit<Message, 'source' | 'timestamp'>,
    targetWindow?: Window
  ): void {
    const fullMessage = {
      ...message,
      source: this.source,
      timestamp: Date.now(),
    } as Message

    const target = targetWindow || window.parent

    if (target && target !== window) {
      target.postMessage(fullMessage, '*')
    }
  }

  /**
   * 发送事件消息
   */
  public emit(event: string, payload?: unknown, targetWindow?: Window): void {
    const eventMessage: Omit<EventMessage, 'source' | 'timestamp'> = {
      type: MessageType.EVENT,
      event,
      payload,
    }
    this.sendMessage(eventMessage, targetWindow)
  }

  /**
   * 发送生命周期消息
   */
  public sendLifecycle(
    type: MessageType.MOUNT | MessageType.UNMOUNT | MessageType.UPDATE,
    props?: { route?: string; meta?: Record<string, unknown> },
    targetWindow?: Window
  ): void {
    const lifecycleMessage: Omit<LifecycleMessage, 'source' | 'timestamp'> = {
      type,
      props,
    }
    this.sendMessage(lifecycleMessage, targetWindow)
  }

  /**
   * 发送请求消息
   */
  public request(
    method: string,
    params?: unknown,
    targetWindow?: Window
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = `req_${++this.requestIdCounter}_${Date.now()}`

      const timeout = setTimeout(() => {
        this.requestHandlers.delete(id)
        reject(new Error('Request timeout'))
      }, this.requestTimeout)

      this.requestHandlers.set(id, { resolve, reject, timeout })

      const requestMessage: Omit<RequestMessage, 'source' | 'timestamp'> = {
        type: MessageType.REQUEST,
        id,
        method,
        params,
      }
      this.sendMessage(requestMessage, targetWindow)
    })
  }

  /**
   * 注册请求处理器
   */
  public onRequest(
    method: string,
    handler: (params?: unknown) => unknown | Promise<unknown>
  ): void {
    this.on(MessageType.REQUEST, async (message: Message) => {
      if (message.type === MessageType.REQUEST && message.method === method) {
        try {
          const result = await handler(message.params)
          this.sendResponse(message.id!, true, result)
        } catch (error) {
          this.sendResponse(
            message.id!,
            false,
            undefined,
            error instanceof Error ? error.message : String(error)
          )
        }
      }
    })
  }

  /**
   * 发送响应消息
   */
  private sendResponse(
    id: string,
    success: boolean,
    data?: unknown,
    error?: string,
    targetWindow?: Window
  ): void {
    const responseMessage: Omit<ResponseMessage, 'source' | 'timestamp'> = {
      type: MessageType.RESPONSE,
      id,
      success,
      data,
      error,
    }
    this.sendMessage(responseMessage, targetWindow)
  }

  /**
   * 订阅消息
   */
  public on(type: MessageType | string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }

    this.handlers.get(type)!.add(handler)

    // 返回取消订阅函数
    return () => {
      const handlers = this.handlers.get(type)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.handlers.delete(type)
        }
      }
    }
  }

  /**
   * 取消订阅消息
   */
  public off(type: MessageType | string, handler: MessageHandler): void {
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.handlers.delete(type)
      }
    }
  }

  /**
   * 触发消息处理
   */
  private triggerHandlers(type: MessageType | string, message: Message): void {
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message)
        } catch (error) {
          console.error(`Error in message handler for ${type}:`, error)
        }
      })
    }
  }

  /**
   * 销毁通信管理器
   */
  public destroy(): void {
    this.handlers.clear()
    this.requestHandlers.forEach((handler) => {
      clearTimeout(handler.timeout)
    })
    this.requestHandlers.clear()
    window.removeEventListener('message', this.handleMessage.bind(this))
  }

  /**
   * 设置请求超时时间
   */
  public setRequestTimeout(timeout: number): void {
    this.requestTimeout = timeout
  }
}

