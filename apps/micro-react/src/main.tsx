import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate, type RouteObject } from 'react-router-dom'
import App from './App'
import Home from './views/Home'
import Page1 from './views/Page1'
import Page2 from './views/Page2'
import Detail from './views/Detail'
import Settings from './views/Settings'
import { createSubReactApp } from '@micro-iframe/sdk'

// 定义路由配置
const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
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

// 创建路由实例
const router = createBrowserRouter(routes)

createSubReactApp({ name: 'react', router })

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
