import { createApp, provide, h } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import App from './App.vue'
import { createSubVueApp } from '@micro-iframe/sdk'

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

// 创建 Vue Router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

createSubVueApp({ name: 'vue', router });

// 创建应用实例
const appInstance = createApp(App)
appInstance.use(router)
appInstance.mount('#app')
