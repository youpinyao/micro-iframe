import type { AppInstance, AppProps } from '@micro-iframe/types'
import { AppStatus } from '@micro-iframe/types'
import { createIframe, getContainer, removeIframe } from '@micro-iframe/utils'
import { CommunicationManager } from './communication'
import { MessageSource, MessageType } from '@micro-iframe/types'

/**
 * 应用加载器
 */
export class AppLoader {
  private loadTimeout = 30000

  constructor(private communication: CommunicationManager) {}

  /**
   * 加载应用
   */
  public async loadApp(app: AppInstance): Promise<void> {
    if (app.status === AppStatus.LOADED || app.status === AppStatus.MOUNTED) {
      return
    }

    if (app.status === AppStatus.LOADING) {
      return this.waitForLoad(app)
    }

    // 如果之前有错误，清除错误状态
    if (app.status === AppStatus.ERROR) {
      app.error = undefined
    }

    app.status = AppStatus.LOADING

    let timeoutId: NodeJS.Timeout | null = null

    try {
      // 验证 URL
      if (!app.config.url || typeof app.config.url !== 'string') {
        throw new Error(`Invalid app URL: ${app.config.url}`)
      }

      const container = getContainer(app.config.container)
      if (!container) {
        throw new Error('Container element not found')
      }

      const iframe = createIframe(app.config.url, app.config.name)
      app.iframe = iframe

      // 设置加载超时
      timeoutId = setTimeout(() => {
        if (app.status === AppStatus.LOADING) {
          this.handleLoadError(
            app,
            new Error(`Load timeout after ${this.loadTimeout}ms`)
          )
        }
      }, this.loadTimeout)

      // 监听 iframe 加载完成
      iframe.onload = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        // 延迟检查，确保 iframe 内容已加载
        setTimeout(() => {
          if (app.status === AppStatus.LOADING) {
            app.status = AppStatus.LOADED
          }
        }, 100)
      }

      // 监听 iframe 加载错误
      iframe.onerror = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        this.handleLoadError(
          app,
          new Error(`Failed to load iframe from ${app.config.url}`)
        )
      }

      // 将 iframe 添加到容器
      container.appendChild(iframe)

      // 等待加载完成
      await this.waitForLoad(app)
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      this.handleLoadError(
        app,
        error instanceof Error ? error : new Error('Unknown error')
      )
      throw error
    }
  }

  /**
   * 等待应用加载完成
   */
  private waitForLoad(app: AppInstance): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (app.status === AppStatus.LOADED) {
          clearInterval(checkInterval)
          resolve()
        } else if (app.status === AppStatus.ERROR) {
          clearInterval(checkInterval)
          reject(app.error || new Error('Load failed'))
        }
      }, 100)

      // 设置最大等待时间
      setTimeout(() => {
        clearInterval(checkInterval)
        if (app.status !== AppStatus.LOADED) {
          reject(new Error('Load timeout'))
        }
      }, this.loadTimeout)
    })
  }

  /**
   * 卸载应用
   */
  public async unmountApp(app: AppInstance): Promise<void> {
    if (!app.iframe) {
      app.status = AppStatus.NOT_LOADED
      return
    }

    app.status = AppStatus.UNMOUNTING

    try {
      // 发送卸载消息给子应用
      const iframeWindow = app.iframe.contentWindow
      if (iframeWindow) {
        try {
          this.communication.emit(
            MessageType.UNMOUNT,
            undefined,
            iframeWindow
          )
        } catch (error) {
          // 忽略跨域错误
          console.warn('Failed to send unmount message:', error)
        }
      }

      // 等待子应用卸载完成（可选）
      await new Promise((resolve) => setTimeout(resolve, 100))

      // 移除 iframe
      removeIframe(app.iframe)
      app.iframe = undefined
      app.status = AppStatus.NOT_LOADED
      app.error = undefined
    } catch (error) {
      // 即使卸载失败，也要清理 iframe
      if (app.iframe) {
        try {
          removeIframe(app.iframe)
        } catch {
          // 忽略清理错误
        }
        app.iframe = undefined
      }
      app.error = error instanceof Error ? error : new Error('Unmount failed')
      app.status = AppStatus.ERROR
      throw error
    }
  }

  /**
   * 显示应用
   */
  public showApp(app: AppInstance): void {
    if (app.iframe) {
      app.iframe.style.display = 'block'
    }
  }

  /**
   * 隐藏应用
   */
  public hideApp(app: AppInstance): void {
    if (app.iframe) {
      app.iframe.style.display = 'none'
    }
  }

  /**
   * 处理加载错误
   */
  private handleLoadError(app: AppInstance, error: Error): void {
    app.status = AppStatus.ERROR
    app.error = error

    if (app.iframe) {
      removeIframe(app.iframe)
      app.iframe = undefined
    }
  }

  /**
   * 设置加载超时时间
   */
  public setLoadTimeout(timeout: number): void {
    this.loadTimeout = timeout
  }
}

