# router.ts

## 概述

路由代理器是一个用于统一管理页面路由跳转的工具。它通过代理浏览器原生的路由跳转方式（History API 和 a 标签点击），提供统一的路由变化监听和跳转方法，适用于微前端架构中的路由管理场景。

## 功能特性

- **代理所有可以做页面跳转的方式**
  - 代理 `history.pushState` 和 `history.replaceState`
  - 代理 `history.go`、`history.back` 和 `history.forward`
  - 代理 a 标签的点击事件（仅处理同源链接）
- **提供统一的路由跳转方法**
  - `navigate`: 导航到指定 URL
  - `forward`: 前进
  - `back`: 后退
  - `go`: 跳转到历史记录的指定位置
- **统一的路由变化监听**
  - 通过 `onChange` 回调统一监听所有路由变化
  - 自动触发 `popstate` 事件，确保路由变化的一致性
- **灵活的配置选项**
  - 可选择是否代理 History API
  - 可选择是否代理 a 标签点击
- **生命周期管理**
  - 提供 `destroy` 方法用于清理代理，恢复原始行为

## API 文档

### createRouterProxy

创建路由代理实例。

```typescript
function createRouterProxy(options?: RouterProxyOptions): RouterProxy
```

#### 参数

##### RouterProxyOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `onChange` | `() => void` | `undefined` | 路由变化回调函数，在路由变化时调用，时机与 `popstate` 事件相同 |
| `proxyHistory` | `boolean` | `true` | 是否代理 history 对象 |
| `proxyAnchorClick` | `boolean` | `true` | 是否代理 a 标签点击 |

#### 返回值

##### RouterProxy

路由代理实例，提供以下方法：

| 方法 | 说明 | 参数 |
|------|------|------|
| `navigate(url, replace?)` | 导航到指定 URL | `url: string` - 目标 URL<br>`replace?: boolean` - 是否替换当前历史记录，默认为 `false` |
| `forward(delta?)` | 前进 | `delta?: number` - 前进的步数，默认为 `1` |
| `back(delta?)` | 后退 | `delta?: number` - 后退的步数，默认为 `1` |
| `go(delta)` | 跳转到历史记录的指定位置 | `delta: number` - 跳转的步数，正数表示前进，负数表示后退 |
| `destroy()` | 销毁代理，恢复原始行为 | 无 |

## 使用示例

### 基础用法

```typescript
import { createRouterProxy } from '@micro-iframe/core'

// 创建路由代理
const routerProxy = createRouterProxy({
  onChange: () => {
    const currentRoute = window.location.pathname
    console.log('路由变化:', currentRoute)
    // 在这里处理路由变化，例如更新 UI、加载组件等
  },
})

// 使用路由跳转方法
routerProxy.navigate('/home')
routerProxy.navigate('/about', true) // 替换当前历史记录
routerProxy.back()
routerProxy.forward()
routerProxy.go(-2) // 后退 2 步

// 清理
routerProxy.destroy()
```

### 更新导航链接激活状态

```typescript
import { createRouterProxy } from '@micro-iframe/core'

let currentRoute = window.location.pathname

// 更新导航链接的激活状态
const updateActiveNav = (route: string) => {
  const navLinks = document.querySelectorAll('nav a')
  navLinks.forEach((link) => {
    const linkRoute = link.getAttribute('data-route')
    if (linkRoute === route) {
      link.classList.add('active')
    } else {
      link.classList.remove('active')
    }
  })
}

// 创建路由代理
const routerProxy = createRouterProxy({
  onChange: () => {
    const newRoute = window.location.pathname
    updateActiveNav(newRoute)
  },
  proxyHistory: true,
  proxyAnchorClick: true,
})

// 初始化导航链接的激活状态
updateActiveNav(currentRoute)
```

### 自定义配置

```typescript
import { createRouterProxy } from '@micro-iframe/core'

// 只代理 History API，不代理 a 标签点击
const routerProxy = createRouterProxy({
  onChange: () => {
    console.log('路由变化')
  },
  proxyHistory: true,
  proxyAnchorClick: false, // 不代理 a 标签点击
})
```

## 实现原理

1. **代理 History API**
   - 保存原始的 `pushState`、`replaceState`、`go`、`back`、`forward` 方法
   - 重写这些方法，在执行原始方法后手动触发 `popstate` 事件
   - 确保所有路由变化都通过 `popstate` 事件统一处理

2. **代理 a 标签点击**
   - 在文档根节点监听 `click` 事件（使用捕获阶段）
   - 检查点击目标是否为 a 标签
   - 只处理同源链接，忽略 `target="_blank"` 和带有 `download` 属性的链接
   - 阻止默认行为，使用 `pushState` 进行路由跳转

3. **统一事件处理**
   - 所有路由变化（无论是通过 History API 还是 a 标签点击）都会触发 `popstate` 事件
   - `onChange` 回调通过监听 `popstate` 事件来统一处理路由变化

## 注意事项

1. **同源限制**: a 标签点击代理只处理同源链接，跨域链接会使用默认行为（页面跳转）

2. **特殊属性处理**: 带有以下属性的 a 标签不会被代理：
   - `target="_blank"` 或其他非 `_self` 的值
   - `download` 属性

3. **事件触发时机**: `onChange` 回调的触发时机与 `popstate` 事件相同，包括：
   - 通过代理的 History API 方法触发的路由变化
   - 通过代理的 a 标签点击触发的路由变化
   - 浏览器原生的前进/后退操作

4. **清理资源**: 使用完毕后应调用 `destroy()` 方法清理代理，避免内存泄漏

5. **多次创建**: 可以创建多个路由代理实例，但需要注意它们会相互影响，建议只创建一个实例

6. **URL 格式**: `navigate` 方法接受的 URL 可以是绝对路径或相对路径，会自动解析为完整的 URL
