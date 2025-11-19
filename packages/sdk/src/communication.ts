import type {
  Message,
  MessageHandler,
  MessageSource,
  MessageType,
} from '@micro-iframe/types'
import { MessageSource as Source, MessageType as Type } from '@micro-iframe/types'

/**
 * 子应用通信管理器
 */
export class MicroCommunication {
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

  constructor() {
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
    const message = event.data

    // 验证消息格式
    if (!message || !message.type || !message.source) {
      return
    }

    // 只处理来自主应用的消息
    if (message.source !== Source.HOST) {
      return
    }

    // 处理响应消息
    if (message.type === Type.RESPONSE && message.id) {
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
    this.emit(message.type, message)
    this.emit('*', message)
  }

  /**
   * 发送消息到主应用
   */
  private sendMessage(message: Omit<Message, 'source' | 'timestamp'>): void {
    const fullMessage: Message = {
      ...message,
      source: Source.MICRO,
      timestamp: Date.now(),
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(fullMessage, '*')
    }
  }

  /**
   * 发送事件消息
   */
  public emit(event: string, payload?: unknown): void {
    this.sendMessage({
      type: Type.EVENT,
      event,
      payload,
    })
  }

  /**
   * 发送请求消息
   */
  public request(method: string, params?: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = `req_${++this.requestIdCounter}_${Date.now()}`

      const timeout = setTimeout(() => {
        this.requestHandlers.delete(id)
        reject(new Error('Request timeout'))
      }, this.requestTimeout)

      this.requestHandlers.set(id, { resolve, reject, timeout })

      this.sendMessage({
        type: Type.REQUEST,
        id,
        method,
        params,
      })
    })
  }

  /**
   * 注册请求处理器
   */
  public onRequest(
    method: string,
    handler: (params?: unknown) => unknown | Promise<unknown>
  ): () => void {
    return this.on(Type.REQUEST, async (message) => {
      if (message.type === Type.REQUEST && message.method === method) {
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
    error?: string
  ): void {
    this.sendMessage({
      type: Type.RESPONSE,
      id,
      success,
      data,
      error,
    })
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
  private emit(type: MessageType | string, message: Message): void {
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

