import type { Article, Topic } from './types'

const dateFmt = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Jakarta'
})

export function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : dateFmt.format(d)
}

export function formatDateRFC(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toUTCString()
}

export function readingTime(markdown?: string | null): number {
  if (!markdown) return 0
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function articleTopics(article: Article): Topic[] {
  return Array.isArray(article.topics) ? article.topics : []
}
