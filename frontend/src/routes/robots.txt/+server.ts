import { site } from '#lib/site'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  const txt = `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`
  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
