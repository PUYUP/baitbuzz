import { timingSafeEqual } from 'node:crypto'

import type { Endpoint, PayloadRequest } from 'payload'

const PLATFORMS = new Set(['x', 'threads', 'facebook', 'linkedin', 'other'])
const MAX_BATCH = 100

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

function isAuthorized(req: PayloadRequest): boolean {
  const key = process.env.INGEST_API_KEY
  if (!key) return false
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ')
    ? header.slice(7)
    : (req.headers.get('x-api-key') ?? '')
  const a = Buffer.from(token)
  const b = Buffer.from(key)
  return a.length === b.length && timingSafeEqual(a, b)
}

interface IncomingPost {
  platform?: string
  externalId?: string | null
  authorHandle?: string | null
  authorName?: string | null
  text?: string
  sourceUrl?: string
  postedAt?: string
  isReply?: boolean
  parentId?: string | null
  synthesisStatus?: string
  raw?: string | number | boolean | unknown[] | { [k: string]: unknown } | null
}

type Platform = 'x' | 'threads' | 'facebook' | 'linkedin' | 'other'
type SynthesisStatus = 'pending' | 'used' | 'skipped'

function normalize(p: IncomingPost) {
  const platform = (PLATFORMS.has(p.platform ?? '') ? p.platform : 'x') as Platform
  const synthesisStatus = (['pending', 'used', 'skipped'].includes(p.synthesisStatus ?? '')
    ? p.synthesisStatus
    : 'pending') as SynthesisStatus
  return {
    platform,
    externalId: p.externalId ?? undefined,
    authorHandle: p.authorHandle ?? undefined,
    authorName: p.authorName ?? undefined,
    text: String(p.text ?? '').trim(),
    sourceUrl: String(p.sourceUrl ?? '').trim(),
    postedAt: p.postedAt ? new Date(p.postedAt).toISOString() : new Date().toISOString(),
    isReply: Boolean(p.isReply),
    parentId: p.parentId ?? undefined,
    synthesisStatus,
    fetchedAt: new Date().toISOString(),
    raw: p.raw ?? undefined,
  }
}

/**
 * POST /api/ingest/raw-posts
 * Bulk-insert raw posts for the Chrome extension ingestion pipeline.
 * Auth: `Authorization: Bearer <INGEST_API_KEY>` or `x-api-key` header.
 * Body: a single post object, an array of posts, or { "posts": [...] }.
 * Posts with an externalId that already exists are skipped (dedupe).
 */
export const ingestRawPosts: Endpoint = {
  path: '/ingest/raw-posts',
  method: 'post',
  handler: async (req) => {
    if (!isAuthorized(req)) {
      return json({ error: 'Unauthorized' }, 401)
    }

    let body: unknown
    try {
      body = await req.json!()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const list: IncomingPost[] = Array.isArray(body)
      ? body
      : Array.isArray((body as { posts?: unknown[] })?.posts)
        ? (body as { posts: IncomingPost[] }).posts
        : [body as IncomingPost]

    if (list.length === 0) return json({ error: 'Empty payload' }, 400)
    if (list.length > MAX_BATCH) {
      return json({ error: `Batch too large (max ${MAX_BATCH})` }, 400)
    }

    const payload = req.payload
    const docs = list.map(normalize)

    // Dedupe by externalId when present
    const externalIds = docs.map((d) => d.externalId).filter(Boolean) as string[]
    const existing = new Set<string>()
    if (externalIds.length > 0) {
      const found = await payload.find({
        collection: 'raw-posts',
        where: { externalId: { in: externalIds } },
        limit: externalIds.length,
        depth: 0,
      })
      for (const doc of found.docs) {
        if (doc.externalId) existing.add(doc.externalId)
      }
    }

    const results = { created: 0, skipped: 0, errors: [] as { index: number; error: string }[] }

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]
      if (!doc.text || !doc.sourceUrl) {
        results.errors.push({ index: i, error: 'text and sourceUrl are required' })
        continue
      }
      if (doc.externalId && existing.has(doc.externalId)) {
        results.skipped++
        continue
      }
      try {
        await payload.create({ collection: 'raw-posts', data: doc })
        results.created++
        if (doc.externalId) existing.add(doc.externalId)
      } catch (e) {
        results.errors.push({
          index: i,
          error: e instanceof Error ? e.message : 'Unknown error',
        })
      }
    }

    return json(results, results.errors.length === docs.length ? 422 : 200)
  },
}
