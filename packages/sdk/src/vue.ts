import type { Router } from 'vue-router'
/**
 * 初始化子应用
 */
export const createSubVueApp = ({ name, router }: { name: string; router: Router }) => {
  router.push = (...args) => {
    console.log('push', args)
    const location = typeof args[0] === 'string' ? { path: args[0] } : args[0]
    return router.replace({
      ...location,
      state: {
        ...(location.state || {}),
        isPush: true,
      },
    })
  }

  router.afterEach((to, from) => {
    console.log('from', from, from.fullPath)
    console.log('to', to, to.fullPath)
    const isPush = !!(window.history.state && window.history.state.isPush)
    console.log('isPush', isPush, window.history.state)
    console.log('--------------')

    window.top!.postMessage(
      {
        type: 'route-change',
        payload: {
          name,
          path: to.fullPath,
          replace: !isPush,
        },
      },
      '*'
    )
    if(isPush) {
      window.history.state.isPush = false
    }
  })

  window.addEventListener('message', (event) => {
    if (event.data.type === 'route-change') {
      const { path } = event.data.payload
      if (path === router.currentRoute.value.fullPath) {
        return
      }
      router.replace(path)
    }
  })
}
