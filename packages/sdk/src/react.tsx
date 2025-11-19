import { createMicroApp, type MicroApp } from './micro-app'
import type { AppProps } from '@micro-iframe/types'

/**
 * React 相关依赖
 */
export interface ReactDependencies {
  React: any // React 命名空间
  ReactDOM: typeof import('react-dom/client')
  createBrowserRouter: typeof import('react-router-dom').createBrowserRouter
  RouterProvider: typeof import('react-router-dom').RouterProvider
}

/**
 * React 微前端应用初始化选项
 */
export interface ReactMicroAppOptions {
  /**
   * React 相关依赖（从子应用传入）
   */
  react: ReactDependencies
  /**
   * 根组件（接收 microApp 作为 prop）
   */
  rootComponent: any // 使用 any 避免类型依赖
  /**
   * 路由配置
   */
  routes: any[] // 使用 any 避免类型依赖
  /**
   * 挂载容器 ID（默认：'root'）
   */
  containerId?: string
  /**
   * 生命周期钩子
   */
  onMount?: (props: AppProps) => void | Promise<void>
  onUnmount?: (props: AppProps) => void | Promise<void>
  onUpdate?: (props: AppProps) => void | Promise<void>
}

/**
 * 初始化 React 微前端应用
 */
export function initReactMicroApp(options: ReactMicroAppOptions): MicroApp {
  const {
    react,
    rootComponent: RootComponent,
    routes,
    containerId = 'root',
    onMount,
    onUnmount,
    onUpdate,
  } = options

  const { React, ReactDOM, createBrowserRouter, RouterProvider } = react

  // 创建微前端应用实例
  const microApp = createMicroApp()

  // 保存 React root 实例
  let root: ReturnType<typeof ReactDOM.createRoot> | null = null

  // 设置生命周期钩子
  microApp.onMount(async (props) => {
    if (onMount) {
      await onMount(props)
    }

    const rootElement = document.getElementById(containerId) as HTMLElement
    if (!rootElement) {
      console.error(`Container element #${containerId} not found`)
      return
    }

    // 创建路由配置，将 microApp 注入到根组件
    // 如果路由配置中已经有根路由，直接使用；否则创建一个
    let routerConfig: any[]
    const rootRoute = routes.find((r: any) => r.path === '/')
    if (rootRoute) {
      // 已有根路由，确保根组件注入了 microApp
      routerConfig = routes.map((route: any) => {
        if (route.path === '/') {
          return {
            ...route,
            element: route.element || React.createElement(RootComponent, { microApp }),
          }
        }
        return route
      })
    } else {
      // 没有根路由，创建一个并包含所有路由作为子路由
      routerConfig = [
        {
          path: '/',
          element: React.createElement(RootComponent, { microApp }),
          children: routes,
        },
      ]
    }

    const router = createBrowserRouter(routerConfig)

    // 如果 root 已存在，直接使用 render 更新
    if (root) {
      root.render(
        React.createElement(React.StrictMode, null, React.createElement(RouterProvider, { router }))
      )
    } else {
      // 首次挂载，创建 root
      root = ReactDOM.createRoot(rootElement)
      root.render(
        React.createElement(React.StrictMode, null, React.createElement(RouterProvider, { router }))
      )
    }
  })

  microApp.onUnmount((props) => {
    if (onUnmount) {
      onUnmount(props)
    }

    // 卸载并清理 root
    if (root) {
      root.unmount()
      root = null
    }
  })

  microApp.onUpdate((props) => {
    if (onUpdate) {
      onUpdate(props)
    }
  })

  return microApp
}
