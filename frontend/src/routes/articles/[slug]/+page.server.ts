import { error } from '@sveltejs/kit'
import { getArticleBySlug, getArticleViewStats, getArticles } from '#lib/api'
import { articleTopics } from '#lib/format'
import type { Article } from '#lib/types'
import type { PageServerLoad } from './$types'

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'has', 'are',
  'was', 'were', 'will', 'would', 'could', 'should', 'your', 'you', 'our',
  'its', 'their', 'they', 'them', 'but', 'not', 'all', 'can', 'how', 'why',
  'what', 'when', 'who', 'new', 'says', 'said',
])

function titleWords(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
  )
}

function topicSlugs(article: Article): Set<string> {
  return new Set(articleTopics(article).map((t) => t.slug))
}

function scoreRelated(article: Article, candidate: Article): number {
  let score = 0
  const aTopics = topicSlugs(article)
  const cTopics = topicSlugs(candidate)
  for (const slug of cTopics) if (aTopics.has(slug)) score += 3
  const aWords = titleWords(article.title)
  for (const w of titleWords(candidate.title)) if (aWords.has(w)) score += 2
  return score
}

function pickRelated(article: Article, candidates: Article[], limit = 4): Article[] {
  return candidates
    .filter((c) => c.id !== article.id && c.slug !== article.slug)
    .map((c) => ({ c, score: scoreRelated(article, c) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || String(b.c.publishedAt).localeCompare(String(a.c.publishedAt)))
    .slice(0, limit)
    .map((x) => x.c)
}

export const load: PageServerLoad = async ({ params }) => {
  const article = await getArticleBySlug(params.slug)
  if (!article) {
    error(404, 'Article not found')
  }
  const [viewStats, all] = await Promise.all([
    getArticleViewStats(article.slug).catch(() => null),
    getArticles({ limit: 50 })
  ])
  const related = pickRelated(article, all.docs)
  return { article, viewStats, related }
}
