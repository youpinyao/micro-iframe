/**
 * 路由代理器
 * 代理所有可以做页面跳转的方式，并提供统一的路由跳转方法
 */

export interface RouterProxyOptions {
  /**
   * 路由变化回调函数
   * 在路由变化时调用，时机与 popstate 事件相同
   */
  onChange?: (event: PopStateEvent) => void

  /**
   * 是否代理 history 对象
   * @default true
   */
  proxyHistory?: boolean

  /**
   * 是否代理 a 标签点击
   * @default true
   */
  proxyAnchorClick?: boolean
}

export interface RouterProxy {
  /**
   * 导航到指定 URL
   * @param url 目标 URL
   * @param replace 是否替换当前历史记录
   */
  navigate: (url: string, replace?: boolean) => void

  /**
   * 前进
   * @param delta 前进的步数，默认为 1
   */
  forward: (delta?: number) => void

  /**
   * 后退
   * @param delta 后退的步数，默认为 1
   */
  back: (delta?: number) => void

  /**
   * 跳转到历史记录的指定位置
   * @param delta 跳转的步数
   */
  go: (delta: number) => void

  /**
   * 销毁代理，恢复原始行为
   */
  destroy: () => void
}

/**
 * 创建路由代理
 * @param options 配置选项
 * @returns 路由代理实例
 */
export function createRouterProxy(options: RouterProxyOptions = {}): RouterProxy {
  const { onChange, proxyHistory = true, proxyAnchorClick = true } = options

  // 保存原始方法
  const originalHistoryPushState = window.history.pushState.bind(window.history)
  const originalHistoryReplaceState = window.history.replaceState.bind(window.history)
  const originalHistoryGo = window.history.go.bind(window.history)
  const originalHistoryBack = window.history.back.bind(window.history)
  const originalHistoryForward = window.history.forward.bind(window.history)

  // 触发 popstate 事件的辅助函数
  const triggerPopState = (replace?: boolean) => {
    const popStateEvent = new PopStateEvent('popstate', {
      state: replace ? { ...window.history.state, replace } : window.history.state,
    })
    window.dispatchEvent(popStateEvent)
  }

  // 监听 popstate 事件（包括手动触发和浏览器前进后退）
  // 统一通过 popstate 事件调用 onChange，避免重复调用
  if (onChange) {
    window.addEventListener('popstate', (event) => {
      onChange?.(event)
    })
  }

  // 代理 history API
  if (proxyHistory) {
    window.history.pushState = function (state: unknown, title: string, url?: string | URL | null) {
      if (url) {
        originalHistoryPushState(state, title, url)
        // 手动触发 popstate 事件，使路由变化统一处理
        triggerPopState()
      } else {
        originalHistoryPushState(state, title, url)
      }
    }

    window.history.replaceState = function (
      state: unknown,
      title: string,
      url?: string | URL | null
    ) {
      if (url) {
        originalHistoryReplaceState(state, title, url)
        // 手动触发 popstate 事件，使路由变化统一处理
        triggerPopState(true)
      } else {
        originalHistoryReplaceState(state, title, url)
      }
    }

    window.history.go = function (delta?: number) {
      if (delta !== undefined) {
        originalHistoryGo(delta)
      } else {
        originalHistoryGo()
      }
    }

    window.history.back = function () {
      originalHistoryBack()
    }

    window.history.forward = function () {
      originalHistoryForward()
    }
  }

  // 代理 a 标签点击
  let anchorClickHandler: ((event: MouseEvent) => void) | null = null
  if (proxyAnchorClick) {
    anchorClickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const anchor = target.closest('a')
      if (anchor && anchor.href) {
        // 检查是否是同源链接
        try {
          const anchorUrl = new URL(anchor.href, window.location.href)
          const currentUrl = new URL(window.location.href)
          // 只处理同源链接
          if (anchorUrl.origin === currentUrl.origin) {
            // 检查是否有 target="_blank" 等属性
            if (!anchor.target || anchor.target === '_self') {
              // 检查是否有 download 属性
              if (!anchor.hasAttribute('download')) {
                event.preventDefault()
                originalHistoryPushState({}, '', anchor.href)
                // 手动触发 popstate 事件，使路由变化统一处理
                triggerPopState()
              }
            }
          }
        } catch (error) {
          // URL 解析失败，可能是相对路径，尝试处理
          if (anchor.href && !anchor.target) {
            try {
              const resolvedUrl = new URL(anchor.href, window.location.href)
              const currentUrl = new URL(window.location.href)
              if (resolvedUrl.origin === currentUrl.origin) {
                event.preventDefault()
                originalHistoryPushState({}, '', anchor.href)
                // 手动触发 popstate 事件，使路由变化统一处理
                triggerPopState()
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    }

    document.addEventListener('click', anchorClickHandler, true)
  }

  // 返回代理实例
  return {
    navigate(url: string, replace = false) {
      if (replace) {
        originalHistoryReplaceState({}, '', url)
      } else {
        originalHistoryPushState({}, '', url)
      }
      // 手动触发 popstate 事件，使路由变化统一处理
      triggerPopState()
    },

    forward(delta = 1) {
      if (delta === 1) {
        originalHistoryForward()
      } else {
        originalHistoryGo(delta)
      }
    },

    back(delta = 1) {
      if (delta === 1) {
        originalHistoryBack()
      } else {
        originalHistoryGo(-delta)
      }
    },

    go(delta: number) {
      originalHistoryGo(delta)
    },

    destroy() {
      // 移除 popstate 事件监听
      if (onChange) {
        window.removeEventListener('popstate', onChange)
      }

      // 恢复原始方法
      if (proxyHistory) {
        window.history.pushState = originalHistoryPushState
        window.history.replaceState = originalHistoryReplaceState
        window.history.go = originalHistoryGo
        window.history.back = originalHistoryBack
        window.history.forward = originalHistoryForward
      }

      if (proxyAnchorClick && anchorClickHandler) {
        document.removeEventListener('click', anchorClickHandler, true)
        anchorClickHandler = null
      }
    },
  }
}
