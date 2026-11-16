import { PUBLIC_PAYLOAD_API } from '$app/env/public'
import type { Article, Page, PayloadList, Topic } from './types'

const API_URL = PUBLIC_PAYLOAD_API.replace(/\/$/, '')

// Short-lived in-memory cache per lambda instance — public read-only
// content doesn't need a fresh API call on every page view.
const CACHE_TTL_MS = 60_000
const cache = new Map<string, { data: unknown; expires: number }>()

async function apiGet<T>(path: string): Promise<T> {
  const hit = cache.get(path)
  if (hit && hit.expires > Date.now()) return hit.data as T

  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) {
    throw new Error(`Payload API error ${res.status} for ${path}`)
  }
  const json = (await res.json()) as T
  cache.set(path, { data: json, expires: Date.now() + CACHE_TTL_MS })
  return json
}

export function clearApiCache() {
  cache.clear()
}

export function getArticles(opts: { limit?: number; topicSlug?: string } = {}) {
  const { limit = 30, topicSlug } = opts
  const conditions: string[] = []
  if (topicSlug) {
    conditions.push(`where[and][0][status][equals]=published`)
    conditions.push(`where[and][1][topics.slug][equals]=${encodeURIComponent(topicSlug)}`)
  } else {
    conditions.push(`where[status][equals]=published`)
  }
  const qs = [
    ...conditions,
    'sort=-publishedAt',
    `limit=${limit}`,
    'depth=2'
  ].join('&')
  return apiGet<PayloadList<Article>>(`/articles?${qs}`)
}

export function getHeadlineArticles(limit = 3) {
  const qs = [
    'where[status][equals]=published',
    'where[headline][equals]=true',
    'sort=-publishedAt',
    `limit=${limit}`,
    'depth=2'
  ].join('&')
  return apiGet<PayloadList<Article>>(`/articles?${qs}`)
}

export function getArticleBySlug(slug: string) {
  const qs = [
    'where[status][equals]=published',
    `where[slug][equals]=${encodeURIComponent(slug)}`,
    'limit=1',
    'depth=2'
  ].join('&')
  return apiGet<PayloadList<Article>>(`/articles?${qs}`).then((r) => r.docs[0] ?? null)
}

export function getTopics() {
  return apiGet<PayloadList<Topic>>('/topics?limit=200&depth=0&sort=name')
}

export function getTopicBySlug(slug: string) {
  const qs = [
    `where[slug][equals]=${encodeURIComponent(slug)}`,
    'limit=1',
    'depth=0'
  ].join('&')
  return apiGet<PayloadList<Topic>>(`/topics?${qs}`).then((r) => r.docs[0] ?? null)
}

/**
 * Top topics ranked by number of published articles (counted over the
 * most recent articles for efficiency).
 */
export async function getTopTopics(limit = 5): Promise<Topic[]> {
  const [topicsRes, articlesRes] = await Promise.all([
    apiGet<PayloadList<Topic>>('/topics?limit=500&depth=0&sort=name'),
    apiGet<PayloadList<Article>>(
      '/articles?where[status][equals]=published&sort=-publishedAt&limit=500&depth=1&select[topics]=true'
    )
  ])
  const byId = new Map<string, Topic>()
  for (const t of topicsRes.docs) byId.set(String(t.id), t)
  const counts = new Map<string, number>()
  for (const a of articlesRes.docs) {
    const ts = Array.isArray(a.topics) ? a.topics : []
    for (const t of ts) {
      if (typeof t === 'object' && t !== null && 'id' in t) {
        const id = String((t as Topic).id)
        counts.set(id, (counts.get(id) ?? 0) + 1)
      }
    }
  }
  return topicsRes.docs
    .map((t) => ({ topic: t, count: counts.get(String(t.id)) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ topic }) => topic)
}

export interface ArticleViewStats {
  article: string
  days: number
  total: number
  daily: { date: string; count: number }[]
}

export function getArticleViewStats(slug: string, days = 30) {
  return apiGet<ArticleViewStats>(`/views/stats?article=${encodeURIComponent(slug)}&days=${days}`)
}

export type PopularArticle = Article & { views: number }

export function getPopularArticles(days = 7, limit = 5) {
  return apiGet<{ days: number; articles: PopularArticle[] }>(
    `/views/popular?days=${days}&limit=${limit}`
  )
}

export function trackArticleView(slug: string) {
  return fetch(`${API_URL}/views/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug })
  }).catch(() => {})
}

export function getPages() {
  return apiGet<PayloadList<Page>>('/pages?where[status][equals]=published&sort=title&limit=100&depth=0')
}

export function getPageBySlug(slug: string) {
  const qs = [
    'where[status][equals]=published',
    `where[slug][equals]=${encodeURIComponent(slug)}`,
    'limit=1',
    'depth=0'
  ].join('&')
  return apiGet<PayloadList<Page>>(`/pages?${qs}`).then((r) => r.docs[0] ?? null)
}

export function getAllPageSlugs() {
  return apiGet<PayloadList<Pick<Page, 'slug' | 'title'>>>(
    '/pages?where[status][equals]=published&limit=1000&depth=0&select[slug]=true&select[title]=true'
  )
}

export function getAllArticleSlugs() {
  return apiGet<PayloadList<Pick<Article, 'slug' | 'publishedAt'>>>('/articles?where[status][equals]=published&limit=1000&depth=0&select[slug]=true&select[publishedAt]=true')
}
