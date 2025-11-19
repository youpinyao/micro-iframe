import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { initReactMicroApp, type ReactDependencies } from '@micro-iframe/sdk'
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

// 准备 React 依赖
const reactDeps: ReactDependencies = {
  React,
  ReactDOM,
  createBrowserRouter,
  RouterProvider,
  RouteObject: {} as any, // 仅用于类型，实际不使用
}

// 初始化微前端应用
const microApp = initReactMicroApp({
  react: reactDeps,
  rootComponent: App,
  routes,
  containerId: 'root',
  onMount: (props) => {
    console.log('React 应用挂载:', props)
  },
  onUnmount: (props) => {
    console.log('React 应用卸载:', props)
  },
  onUpdate: (props) => {
    console.log('React 应用更新:', props)
  },
})

// 监听路由变化（可选）
microApp.router.onRouteChange((route) => {
  console.log('路由变化:', route)
})

// 监听通信（可选）
microApp.communication.on('*', (message) => {
  console.log('收到消息 react:', message)
})

