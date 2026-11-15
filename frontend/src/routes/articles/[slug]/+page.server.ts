import { error } from '@sveltejs/kit'
import { getArticleBySlug, getArticleViewStats } from '#lib/api'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const article = await getArticleBySlug(params.slug)
  if (!article) {
    error(404, 'Article not found')
  }
  const viewStats = await getArticleViewStats(article.slug).catch(() => null)
  return { article, viewStats }
}
