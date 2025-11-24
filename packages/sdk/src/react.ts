import type { createBrowserRouter } from 'react-router-dom'

type Router = ReturnType<typeof createBrowserRouter>

/**
 * 初始化子应用
 */
export const createSubReactApp = ({ name, router }: { name: string; router: Router }) => {
  // 保存原始的 navigate 方法
  const originalNavigate = router.navigate

  // 重写 navigate 方法，使用 replace 而不是 push
  router.navigate = ((to: Parameters<typeof router.navigate>[0], options?: Parameters<typeof router.navigate>[1]) => {
    return originalNavigate(to, { ...options, replace: true } as Parameters<typeof router.navigate>[1])
  }) as typeof router.navigate

  // 订阅路由状态变化
  const unsubscribe = router.subscribe((state: { location: { pathname: string; search: string; hash: string }; historyAction: string }) => {
    const currentPath = state.location.pathname + state.location.search + state.location.hash

    console.log('to', currentPath, state)
    console.log('--------------')

    window.top!.postMessage(
      {
        type: 'route-change',
        payload: {
          name,
          path: currentPath,
        },
      },
      '*'
    )
  })

  // 监听来自主应用的路由变化消息
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'route-change') {
      const { path } = event.data.payload
      const currentPath = router.state.location.pathname + router.state.location.search + router.state.location.hash

      if (path === currentPath) {
        return
      }

      router.navigate(path, { replace: true })
    }
  }

  window.addEventListener('message', handleMessage)

  // 返回清理函数（可选，用于卸载时清理）
  return () => {
    unsubscribe()
    window.removeEventListener('message', handleMessage)
  }
}

