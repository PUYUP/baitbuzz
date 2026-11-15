import { error } from '@sveltejs/kit'
import { getArticles, getTopicBySlug } from '#lib/api'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const [topic, articles] = await Promise.all([
    getTopicBySlug(params.slug),
    getArticles({ topicSlug: params.slug, limit: 50 })
  ])
  if (!topic) {
    error(404, 'Topic not found')
  }
  return { topic, articles: articles.docs }
}
