# Micro-Iframe

基于 iframe 的微前端框架，支持多框架混用、独立部署，提供完整的生命周期管理、路由同步和通信机制。

## 特性

- 🎯 **基于 iframe**：天然隔离，支持样式和 JavaScript 完全隔离
- 🔄 **多框架支持**：支持 React、Vue、Angular 等任意框架
- 🚀 **独立部署**：每个子应用可以独立开发、构建和部署
- 📡 **通信机制**：基于 postMessage 的统一通信协议
- 🛣️ **路由同步**：主应用和子应用路由自动同步
- ⚡ **生命周期管理**：完整的应用生命周期钩子
- 🛡️ **错误处理**：完善的错误处理和恢复机制
- 📦 **TypeScript**：完整的 TypeScript 类型支持

## 项目结构

```
micro-iframe/
├── packages/
│   ├── core/          # 主应用框架核心库
│   ├── sdk/           # 子应用接入 SDK
│   ├── types/         # 共享类型定义
│   └── utils/         # 工具函数库
├── apps/
│   ├── host/          # 主应用示例
│   ├── micro-react/   # React 子应用示例
│   └── micro-vue/      # Vue 子应用示例
└── ...
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 启动所有应用
pnpm dev

# 或单独启动
cd apps/host && pnpm dev
cd apps/micro-react && pnpm dev
cd apps/micro-vue && pnpm dev
```

### 构建

```bash
pnpm build
```

## 使用指南

### 主应用

在主应用中注册和加载子应用：

```typescript
import { MicroIframe, RouterMode } from '@micro-iframe/core'

// 创建微前端框架实例
const microIframe = new MicroIframe({
  routerMode: RouterMode.HISTORY, // 或 RouterMode.HASH
})

// 注册子应用
microIframe.registerApps([
  {
    name: 'react-app',
    url: 'http://localhost:3001',
    routeMatch: '/react',
    container: '#micro-app-container',
  },
  {
    name: 'vue-app',
    url: 'http://localhost:3002',
    routeMatch: '/vue',
    container: '#micro-app-container',
  },
])

// 监听通信
const communication = microIframe.getCommunication()
communication.on('*', (message) => {
  console.log('收到消息:', message)
})
```

### 子应用

在子应用中接入 SDK：

#### React 应用

```typescript
import { createMicroApp } from '@micro-iframe/sdk'
import React from 'react'
import ReactDOM from 'react-dom/client'

const microApp = createMicroApp()

microApp.onMount((props) => {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(<App />)
})

microApp.onUnmount(() => {
  // 清理资源
})
```

#### Vue 应用

```typescript
import { createMicroApp } from '@micro-iframe/sdk'
import { createApp } from 'vue'
import App from './App.vue'

const microApp = createMicroApp()

microApp.onMount(() => {
  const app = createApp(App)
  app.mount('#app')
})

microApp.onUnmount(() => {
  // 清理资源
})
```

## API 文档

### 主应用 API

#### MicroIframe

主应用框架类。

```typescript
class MicroIframe {
  constructor(options?: { routerMode?: RouterMode })
  
  // 注册应用
  registerApp(config: AppConfig): void
  registerApps(configs: AppConfig[]): void
  
  // 获取应用
  getApp(name: string): AppInstance | undefined
  getAllApps(): AppInstance[]
  getCurrentApps(): AppInstance[]
  
  // 通信和路由
  getCommunication(): CommunicationManager
  getRouter(): RouterManager
  
  // 销毁
  destroy(): void
}
```

#### AppConfig

应用配置接口。

```typescript
interface AppConfig {
  name: string              // 应用名称（唯一标识）
  url: string               // 应用 URL
  routeMatch: RouteMatch    // 路由匹配规则
  container?: string        // 容器选择器
  lifecycle?: AppLifecycle  // 生命周期函数
  meta?: Record<string, unknown>  // 元数据
}
```

### 子应用 API

#### MicroApp

子应用类。

```typescript
class MicroApp {
  communication: MicroCommunication  // 通信管理器
  lifecycle: LifecycleManager       // 生命周期管理器
  router: MicroRouter               // 路由管理器
  
  // 生命周期钩子
  onMount(hook: LifecycleHook): void
  onUnmount(hook: LifecycleHook): void
  onUpdate(hook: LifecycleHook): void
  
  // 工具方法
  getCurrentProps(): AppProps | undefined
  isMicroApp(): boolean
  destroy(): void
}
```

#### 通信 API

```typescript
// 发送事件
microApp.communication.emit(event: string, payload?: unknown)

// 发送请求
const result = await microApp.communication.request(method: string, params?: unknown)

// 订阅消息
const unsubscribe = microApp.communication.on(type: string, handler: MessageHandler)
```

#### 路由 API

```typescript
// 获取当前路由
const route = microApp.router.getCurrentRoute()

// 监听路由变化
const unsubscribe = microApp.router.onRouteChange((route: string) => {
  console.log('路由变化:', route)
})

// 导航
microApp.router.navigate('/path')
```

## 通信协议

框架使用统一的消息协议进行通信：

```typescript
interface Message {
  type: MessageType
  source: MessageSource
  target?: string
  id?: string
  timestamp: number
  // ... 其他字段
}
```

### 消息类型

- `MOUNT` / `UNMOUNT` / `UPDATE`：生命周期消息
- `ROUTE_CHANGE` / `ROUTE_SYNC`：路由消息
- `EVENT`：事件消息
- `REQUEST` / `RESPONSE`：请求/响应消息

## 路由匹配

支持多种路由匹配方式：

```typescript
// 字符串匹配
routeMatch: '/app'

// 正则表达式
routeMatch: /^\/app/

// 函数匹配
routeMatch: (path: string) => path.startsWith('/app')
```

## 错误处理

框架提供了完善的错误处理机制：

- iframe 加载错误自动捕获
- 超时处理（默认 30 秒）
- 通信失败容错
- 应用卸载失败自动清理

## 开发规范

项目使用以下工具保证代码质量：

- **ESLint**：代码检查
- **Prettier**：代码格式化
- **TypeScript**：类型检查
- **Husky**：Git Hooks
- **Commitlint**：提交信息规范

## 技术栈

- TypeScript 5
- Vite 7
- Turbo 2
- pnpm workspace

## 许可证

MIT

