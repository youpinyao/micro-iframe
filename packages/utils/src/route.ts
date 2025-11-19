import type { RouteMatch } from '@micro-iframe/types'

/**
 * 匹配路由规则
 */
export function matchRoute(routeMatch: RouteMatch, path: string): boolean {
  if (typeof routeMatch === 'string') {
    return path.startsWith(routeMatch) || path === routeMatch
  }

  if (routeMatch instanceof RegExp) {
    return routeMatch.test(path)
  }

  if (typeof routeMatch === 'function') {
    return routeMatch(path)
  }

  return false
}

/**
 * 获取当前路由路径
 */
export function getCurrentPath(): string {
  return window.location.pathname + window.location.search + window.location.hash
}

/**
 * 获取路由路径（去除 hash 或 query）
 */
export function getRoutePath(path: string): string {
  try {
    const url = new URL(path, window.location.origin)
    return url.pathname
  } catch {
    return path.split('?')[0].split('#')[0]
  }
}

