export * from './lifecycle'
export * from './communication'
export * from './router'
export { MicroApp, createMicroApp } from './micro-app'
export { initReactMicroApp, type ReactMicroAppOptions, type ReactDependencies } from './react'
export { initVueMicroApp, type VueMicroAppOptions, type VueDependencies } from './vue'
export { createUseRouteSync, type ReactRouterDependencies } from './useRouteSync'
// 重新导出类型，方便子应用使用
export type { AppProps } from '@micro-iframe/types'

