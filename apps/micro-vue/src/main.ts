import { createApp, provide, h } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { initVueMicroApp, isMicroApp, type AppProps, type VueDependencies } from '@micro-iframe/sdk'
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

// 如果不在微前端环境中，直接挂载应用（支持独立访问）
if (!isMicroApp()) {
  const containerElement = document.getElementById('app')
  if (containerElement) {
    // 创建 Vue Router
    const router = createRouter({
      history: createWebHistory(),
      routes,
    })

    // 创建包装组件，通过 provide 传递 microApp
    const WrappedComponent = {
      setup() {
        // 使用 provide 传递 microApp，确保所有子组件都能通过 inject 访问
        provide('microApp', microApp)
        // 使用 h 函数渲染原始组件
        return () => h(App)
      },
    }

    // 创建应用实例
    const appInstance = createApp(WrappedComponent)
    appInstance.use(router)
    appInstance.mount('#app')
  }
}

