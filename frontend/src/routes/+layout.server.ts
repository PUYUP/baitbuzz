import { getPages, getTopTopics } from '#lib/api'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async () => {
  const [pages, topics] = await Promise.all([
    getPages().catch(() => ({ docs: [] })),
    getTopTopics(5).catch(() => [])
  ])
  return {
    pages: pages.docs.map((p) => ({ title: p.title, slug: p.slug })),
    topTopics: topics.map((t) => ({ name: t.name, slug: t.slug }))
  }
}
