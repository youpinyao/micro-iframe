import type { Router } from 'vue-router'
/**
 * 初始化子应用
 */
export const createSubVueApp = ({ name, router }: { name: string; router: Router }) => {
  router.push = router.replace

  router.afterEach((to, from) => {
    console.log('to', to.fullPath)
    console.log('from', from.fullPath)
    console.log('--------------')

    window.top!.postMessage(
      {
        type: 'route-change',
        payload: {
          name,
          path: to.fullPath,
        },
      },
      '*'
    )
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
