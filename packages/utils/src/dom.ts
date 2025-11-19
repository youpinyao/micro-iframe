/**
 * 获取容器元素
 */
export function getContainer(selector?: string): HTMLElement {
  if (selector) {
    const element = document.querySelector<HTMLElement>(selector)
    if (element) {
      return element
    }
  }

  // 默认容器
  const defaultContainer = document.getElementById('micro-app-container')
  if (defaultContainer) {
    return defaultContainer
  }

  // 创建默认容器
  const container = document.createElement('div')
  container.id = 'micro-app-container'
  document.body.appendChild(container)
  return container
}

/**
 * 创建 iframe 元素
 */
export function createIframe(url: string, name: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.src = url
  iframe.name = name
  iframe.setAttribute('frameborder', '0')
  iframe.setAttribute('scrolling', 'auto')
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'
  return iframe
}

/**
 * 移除 iframe 元素
 */
export function removeIframe(iframe: HTMLIFrameElement): void {
  if (iframe.parentNode) {
    iframe.parentNode.removeChild(iframe)
  }
}

