import { getArticles, getHeadlineArticles, getPopularArticles, getTopics } from '#lib/api'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [articles, headline, popular, topics] = await Promise.all([
    getArticles({ limit: 30 }),
    getHeadlineArticles(3),
    getPopularArticles(7, 3),
    getTopics()
  ])
  return {
    articles: articles.docs,
    headline: headline.docs,
    popular: popular.articles,
    topics: topics.docs
  }
}
