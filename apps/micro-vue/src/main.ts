import { createApp, provide, h } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { initVueMicroApp, type AppProps, type VueDependencies } from '@micro-iframe/sdk'
import App from './App.vue'

// 定义路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('./views/Home.vue'),
  },
  {
    path: '/page1',
    name: 'Page1',
    component: () => import('./views/Page1.vue'),
  },
  {
    path: '/page2',
    name: 'Page2',
    component: () => import('./views/Page2.vue'),
  },
  {
    path: '/detail',
    name: 'Detail',
    component: () => import('./views/Detail.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./views/Settings.vue'),
  },
]

// 准备 Vue 依赖
const vueDeps: VueDependencies = {
  createApp,
  provide,
  h,
  createRouter,
  createWebHistory,
}

// 初始化微前端应用
const microApp = initVueMicroApp({
  vue: vueDeps,
  rootComponent: App,
  routes,
  containerId: 'app',
  onMount: (props: AppProps) => {
    console.log('Vue 应用挂载:', props)
  },
  onUnmount: (props: AppProps) => {
    console.log('Vue 应用卸载:', props)
  },
  onUpdate: (props: AppProps) => {
    console.log('Vue 应用更新:', props)
  },
})

// 监听路由变化（可选）
microApp.router.onRouteChange((route: string) => {
  console.log('路由变化:', route)
})

// 监听通信（可选）
microApp.communication.on('*', (message: unknown) => {
  console.log('收到消息 vue:', message)
})

