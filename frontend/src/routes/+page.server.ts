import { getArticles, getTopics } from '#lib/api'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [articles, topics] = await Promise.all([getArticles({ limit: 30 }), getTopics()])
  return { articles: articles.docs, topics: topics.docs }
}
