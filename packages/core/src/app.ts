import { createRouterProxy, RouterProxyOptions } from './router'
import { joinUrl } from '@micro-iframe/utils'

export type MicroIframeApp = {
  name: string
  url: string
}

export type MicroIframeOptions = {
  routerProxy: RouterProxyOptions
  container: HTMLElement | string
  apps: MicroIframeApp[]
}
function getCurrentApp() {
  const items = window.location.pathname.replace(/^(\/)/, '').split('/')
  const name = items.shift()!
  const pathname = ['', ...items].join('/') || '/'
  const search = window.location.search
  const hash = window.location.hash

  return {
    name,
    path: pathname + search + hash,
  }
}
export function createMicroIframe(options: MicroIframeOptions) {
  const { apps, container: containerOption } = options
  const container =
    typeof containerOption === 'string' ? document.getElementById(containerOption) : containerOption
  const iframes = new Map<string, HTMLIFrameElement>()
  if (!container) {
    throw new Error('Container not found')
  }
  const waitForIFrameLoaded = (iframe: HTMLIFrameElement, callback: () => void) => {
    if (iframe.contentWindow) {
      callback()
    } else {
      setTimeout(() => {
        waitForIFrameLoaded(iframe, callback)
      }, 100)
    }
  }
  const getIFrame = (name: string, path?: string) => {
    const existIframe = iframes.get(name)
    if (existIframe) {
      waitForIFrameLoaded(existIframe, () => {
        existIframe.contentWindow?.postMessage(
          {
            type: 'route-change',
            payload: {
              name,
              path,
            },
          },
          '*'
        )
      })
      return existIframe
    }
    const iframe = document.createElement('iframe')
    iframe.src = joinUrl(apps.find((app) => app.name === name)!.url, path)
    iframe.id = name
    iframe.style.display = 'none'
    container.appendChild(iframe)
    iframes.set(name, iframe)

    return iframe
  }
  const showIFrame = (name: string, path?: string) => {
    iframes.forEach((iframe) => {
      iframe.style.display = 'none'
    })
    getIFrame(name, path).style.display = 'block'
  }
  const hideIFrame = () => {
    iframes.forEach((iframe) => {
      iframe.style.display = 'none'
    })
  }
  const checkActiveApp = () => {
    const currentApp = getCurrentApp()
    const activeApp = apps.find((app) => app.name === currentApp.name)

    if (activeApp) {
      showIFrame(activeApp.name, currentApp.path)
    } else {
      hideIFrame()
    }
  }
  const routerProxy = createRouterProxy({
    ...options.routerProxy,
    onChange: (event) => {
      checkActiveApp()
      options.routerProxy.onChange?.(event)
    },
  })

  window.addEventListener('message', (event) => {
    if (event.data.type === 'route-change') {
      const { name, path, replace } = event.data.payload
      const { name: currentName, path: currentPath } = getCurrentApp()

      if (name === currentName && path === currentPath) {
        return
      }

      routerProxy.navigate(`/${joinUrl(name, path)}`, replace === true)
    }
  })

  checkActiveApp()
}
