import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import type { MicroApp } from '@micro-iframe/sdk'
import App from '../App'
import Home from '../views/Home'
import Page1 from '../views/Page1'
import Page2 from '../views/Page2'
import Detail from '../views/Detail'
import Settings from '../views/Settings'

/**
 * 创建 React Router 实例，与微前端路由系统集成
 */
export function createReactRouter(microApp: MicroApp) {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <App microApp={microApp} />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: 'page1',
          element: <Page1 />,
        },
        {
          path: 'page2',
          element: <Page2 />,
        },
        {
          path: 'detail',
          element: <Detail />,
        },
        {
          path: 'settings',
          element: <Settings />,
        },
      ],
    },
  ]

  const router = createBrowserRouter(routes)

  // 返回路由器和 Provider 组件
  return {
    router,
    Provider: () => <RouterProvider router={router} />,
  }
}

