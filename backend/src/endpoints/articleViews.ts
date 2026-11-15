import type { Endpoint, PayloadRequest } from 'payload'

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

async function findArticleId(req: PayloadRequest, slug: string) {
  const res = await req.payload.find({
    collection: 'articles',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 0,
  })
  return res.docs[0]?.id ?? null
}

const dayKey = (iso: string) => iso.slice(0, 10)

/**
 * POST /api/views/track — record one article view.
 * Body: { "slug": "article-slug" }. viewedAt is always server time.
 */
export const trackArticleView: Endpoint = {
  path: '/views/track',
  method: 'post',
  handler: async (req) => {
    let body: { slug?: string }
    try {
      body = (await req.json!()) as { slug?: string }
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }
    const slug = String(body?.slug ?? '').trim()
    if (!slug) return json({ error: 'slug is required' }, 400)

    const articleId = await findArticleId(req, slug)
    if (!articleId) return json({ error: 'Article not found' }, 404)

    await req.payload.create({
      collection: 'article-views',
      data: { article: articleId, viewedAt: new Date().toISOString() },
    })
    return json({ ok: true })
  },
}

/**
 * GET /api/views/stats?article=<slug>&days=<n>
 * Returns total all-time views plus per-day counts for the last n days
 * (default 30, max 3650). Days are UTC, formatted YYYY-MM-DD.
 */
export const articleViewStats: Endpoint = {
  path: '/views/stats',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url!)
    const slug = url.searchParams.get('article') ?? ''
    const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? 30) || 30, 1), 3650)
    if (!slug) return json({ error: 'article param is required' }, 400)

    const articleId = await findArticleId(req, slug)
    if (!articleId) return json({ error: 'Article not found' }, 404)

    const since = new Date(Date.now() - days * 86_400_000).toISOString()

    const [total, recent] = await Promise.all([
      req.payload.count({
        collection: 'article-views',
        where: { article: { equals: articleId } },
      }),
      req.payload.find({
        collection: 'article-views',
        where: {
          and: [{ article: { equals: articleId } }, { viewedAt: { greater_than: since } }],
        },
        depth: 0,
        pagination: false,
        limit: 0,
      }),
    ])

    const byDay = new Map<string, number>()
    for (const v of recent.docs) {
      const key = dayKey(v.viewedAt)
      byDay.set(key, (byDay.get(key) ?? 0) + 1)
    }

    return json({
      article: slug,
      days,
      total: total.totalDocs,
      daily: [...byDay.entries()]
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    })
  },
}
