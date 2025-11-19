import { createMicroApp, type AppProps, type Message } from '@micro-iframe/sdk'

// 创建微前端应用实例
const microApp = createMicroApp()

// 当前页面状态
let currentRoute = '/'
let counter = 0

// 路由配置
const routes: Record<string, () => string> = {
  '/': () => `
    <h1>欢迎来到 HTML 子应用</h1>
    <div class="info-box">
      <p>这是一个使用原生 HTML、CSS 和 JavaScript 构建的微前端子应用。</p>
      <p>它展示了如何在微前端框架中使用原生技术栈。</p>
    </div>
    <h2>功能特性</h2>
    <ul>
      <li>✅ 原生 JavaScript，无需框架</li>
      <li>✅ 路由管理</li>
      <li>✅ 生命周期管理</li>
      <li>✅ 通信能力</li>
      <li>✅ 响应式设计</li>
    </ul>
    <div class="counter">
      计数器: <span id="counter-value">${counter}</span>
    </div>
    <button id="increment-btn">增加</button>
    <button id="decrement-btn">减少</button>
  `,
  '/page1': () => `
    <h1>页面 1</h1>
    <p>这是第一个页面内容。</p>
    <p>你可以在这里添加任何你想要的 HTML 内容。</p>
    <div class="info-box">
      <p><strong>提示：</strong>这个页面展示了基本的页面结构。</p>
    </div>
  `,
  '/page2': () => `
    <h1>页面 2</h1>
    <p>这是第二个页面内容。</p>
    <p>每个页面都可以有自己独特的内容和功能。</p>
    <div class="info-box">
      <p><strong>提示：</strong>路由切换是自动管理的。</p>
    </div>
  `,
  '/detail': () => `
    <h1>详情页面</h1>
    <p>这里可以显示详细信息。</p>
    <h2>应用信息</h2>
    <ul>
      <li>应用名称: HTML 子应用</li>
      <li>技术栈: 原生 HTML/JS</li>
      <li>端口: 3003</li>
      <li>路由匹配: /html</li>
    </ul>
  `,
  '/settings': () => `
    <h1>设置页面</h1>
    <p>这里可以配置应用设置。</p>
    <div class="info-box">
      <p><strong>当前路由：</strong>${currentRoute}</p>
      <p><strong>计数器值：</strong>${counter}</p>
    </div>
  `,
}

// 渲染页面内容
function renderPage(route: string) {
  const contentEl = document.getElementById('page-content')
  if (!contentEl) {
    return
  }

  const renderFn = routes[route] || routes['/']
  contentEl.innerHTML = renderFn()

  // 更新导航状态
  updateNavActive(route)

  // 绑定事件（如果页面有按钮等交互元素）
  bindPageEvents()
}

// 更新导航激活状态
function updateNavActive(route: string) {
  const navLinks = document.querySelectorAll('nav a[data-route]')
  navLinks.forEach((link) => {
    const linkEl = link as HTMLAnchorElement
    const linkRoute = linkEl.dataset.route || ''
    linkEl.classList.remove('active')

    if (linkRoute === route || (route === '/' && linkRoute === '/')) {
      linkEl.classList.add('active')
    } else if (linkRoute !== '/' && route.startsWith(linkRoute)) {
      linkEl.classList.add('active')
    }
  })
}

// 绑定页面事件
function bindPageEvents() {
  // 计数器按钮
  const incrementBtn = document.getElementById('increment-btn')
  const decrementBtn = document.getElementById('decrement-btn')
  const counterValue = document.getElementById('counter-value')

  if (incrementBtn) {
    incrementBtn.onclick = () => {
      counter++
      if (counterValue) {
        counterValue.textContent = String(counter)
      }
      // 发送消息到主应用
      microApp.communication.emit('COUNTER_CHANGED', {
        value: counter,
        source: 'html-app',
      })
    }
  }

  if (decrementBtn) {
    decrementBtn.onclick = () => {
      counter--
      if (counterValue) {
        counterValue.textContent = String(counter)
      }
      // 发送消息到主应用
      microApp.communication.emit('COUNTER_CHANGED', {
        value: counter,
        source: 'html-app',
      })
    }
  }

  // 导航链接点击事件
  const navLinks = document.querySelectorAll('nav a[data-route]')
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const route = (link as HTMLAnchorElement).dataset.route
      if (route) {
        navigate(route)
      }
    })
  })
}

// 导航函数
function navigate(route: string) {
  currentRoute = route
  renderPage(route)
  // 通知路由变化
  microApp.router.navigate(route)
}

// 挂载钩子
microApp.onMount((props: AppProps) => {
  console.log('HTML 应用挂载:', props)

  // 获取初始路由
  const initialRoute = props.route || '/'
  currentRoute = initialRoute

  // 渲染初始页面
  renderPage(initialRoute)

  // 绑定导航事件
  bindPageEvents()
})

// 卸载钩子
microApp.onUnmount((props: AppProps) => {
  console.log('HTML 应用卸载:', props)

  // 清理事件监听器
  const navLinks = document.querySelectorAll('nav a[data-route]')
  navLinks.forEach((link) => {
    const newLink = link.cloneNode(true)
    link.parentNode?.replaceChild(newLink, link)
  })
})

// 更新钩子
microApp.onUpdate((props: AppProps) => {
  console.log('HTML 应用更新:', props)

  // 如果路由变化，更新页面
  if (props.route && props.route !== currentRoute) {
    currentRoute = props.route
    renderPage(currentRoute)
  }
})

// 监听路由变化
microApp.router.onRouteChange((route: string) => {
  console.log('路由变化:', route)
  if (route !== currentRoute) {
    currentRoute = route
    renderPage(route)
  }
})

// 监听通信
microApp.communication.on('*', (message: Message) => {
  console.log('收到消息 html:', message)
})

// 如果不在微前端环境中，直接渲染（用于独立开发）
if (!microApp.isMicroApp()) {
  renderPage('/')
  bindPageEvents()
}

