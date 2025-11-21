import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import App from './App'
import Home from './views/Home'
import Page1 from './views/Page1'
import Page2 from './views/Page2'
import Detail from './views/Detail'
import Settings from './views/Settings'

// 定义路由配置
const routes: RouteObject[] = [
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
]
