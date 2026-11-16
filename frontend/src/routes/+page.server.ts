import { getArticles, getHeadlineArticles, getTopics } from '#lib/api'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [articles, headline, topics] = await Promise.all([
    getArticles({ limit: 30 }),
    getHeadlineArticles(3),
    getTopics()
  ])
  return { articles: articles.docs, headline: headline.docs, topics: topics.docs }
}
