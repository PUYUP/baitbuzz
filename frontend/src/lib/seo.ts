export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function absoluteUrl(path: string, base: string): string {
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
