export const isMicroApp = () => {
  return window.top !== window
}

export const joinUrl = (url: string, ...paths: (string | undefined)[]) => {
  return [url, ...(paths || [])]
    .filter(Boolean)
    .join('/')
    .replace(/([^:]\/)\/+/g, '$1')
}
