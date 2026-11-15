import { getAllArticleSlugs, getAllPageSlugs, getTopics } from '#lib/api'
import { site } from '#lib/site'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  const [{ docs: articles }, { docs: topics }, { docs: pages }] = await Promise.all([
    getAllArticleSlugs(),
    getTopics(),
    getAllPageSlugs()
  ])

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    '## Content',
    '',
    `- [Home](${site.url}/): Latest articles list.`,
    `- [Topics](${site.url}/topics): Hashtag/category index.`,
    `- [RSS Feed](${site.url}/rss.xml): Latest articles feed.`,
    '',
    '## Articles',
    '',
    ...articles.map((a) => `- [${a.slug}](${site.url}/articles/${a.slug})`),
    '',
    '## Topics',
    '',
    ...topics.map((t) => `- [#${t.name.toLowerCase()}](${site.url}/topics/${t.slug})`),
    '',
    '## Pages',
    '',
    ...pages.map((p) => `- [${p.title}](${site.url}/${p.slug})`),
    ''
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  })
}
