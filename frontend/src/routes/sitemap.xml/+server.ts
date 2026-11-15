import { getAllArticleSlugs, getAllPageSlugs, getTopics } from '#lib/api'
import { site } from '#lib/site'
import type { RequestHandler } from './$types'

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const GET: RequestHandler = async () => {
  const [{ docs: articles }, { docs: topics }, { docs: pages }] = await Promise.all([
    getAllArticleSlugs(),
    getTopics(),
    getAllPageSlugs()
  ])

  const urls = [
    { loc: site.url, lastmod: '' },
    { loc: `${site.url}/topics`, lastmod: '' },
    ...articles.map((a) => ({
      loc: `${site.url}/articles/${a.slug}`,
      lastmod: a.publishedAt ?? ''
    })),
    ...topics.map((t) => ({
      loc: `${site.url}/topics/${t.slug}`,
      lastmod: ''
    })),
    ...pages.map((p) => ({
      loc: `${site.url}/${p.slug}`,
      lastmod: ''
    }))
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
