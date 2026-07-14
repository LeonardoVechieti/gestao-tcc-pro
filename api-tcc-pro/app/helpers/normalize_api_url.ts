export function normalizeApiUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.replace(/^\/|\/$/g, '').split('/')
    const lastSegment = segments[segments.length - 1]

    if (/^\d{4}$/.test(lastSegment)) {
      segments.pop()
      parsed.pathname = `/${segments.join('/')}`
    }

    return parsed.toString().replace(/\/+$/, '')
  } catch {
    return url.replace(/\/+$/, '')
  }
}
