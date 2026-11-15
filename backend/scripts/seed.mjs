#!/usr/bin/env node
/**
 * Seed script for BaitBuzz backend.
 *
 * Usage:
 *   API=http://localhost:3000/api node scripts/seed.mjs
 *
 * Env overrides:
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */

const API = (process.env.API || 'http://localhost:3000/api').replace(/\/$/, '')
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@baitbuzz.dev'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin'

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
  }
  return json
}

async function main() {
  // 1. Ensure an admin user exists (first-register works only when no users exist)
  let token
  try {
    const reg = await api('/users/first-register', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME }
    })
    token = reg.token
    console.log(`Created admin user: ${ADMIN_EMAIL}`)
  } catch (e) {
    const login = await api('/users/login', {
      method: 'POST',
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    })
    token = login.token
    console.log(`Logged in as existing admin: ${ADMIN_EMAIL}`)
  }

  const auth = { token }

  // 2. Topics
  const topics = [
    { name: 'Artificial Intelligence', description: 'Latest news and analysis about AI.' },
    { name: 'Open Source', description: 'Open source projects and the developer ecosystem.' },
    { name: 'Startups', description: 'Funding rounds, launches, and startup ecosystem news.' }
  ]
  const topicDocs = []
  for (const t of topics) {
    const existing = await api(`/topics?where[slug][equals]=${encodeURIComponent(t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}&limit=1`, auth)
    if (existing.docs.length) {
      topicDocs.push(existing.docs[0])
      console.log(`Topic exists: ${t.name}`)
    } else {
      const { doc } = await api('/topics', { method: 'POST', token, body: t })
      topicDocs.push(doc)
      console.log(`Created topic: ${t.name}`)
    }
  }

  // 3. Raw posts (sources for synthesis)
  const rawPosts = [
    {
      platform: 'x',
      externalId: '1234567890',
      authorHandle: 'sama',
      authorName: 'Sam Altman',
      text: 'We are launching a new reasoning model next week. It is our strongest yet on math and code benchmarks.',
      sourceUrl: 'https://x.com/sama/status/1234567890',
      postedAt: '2026-11-14T10:00:00.000Z',
      synthesisStatus: 'used'
    },
    {
      platform: 'x',
      externalId: '1234567891',
      authorHandle: 'karpathy',
      authorName: 'Andrej Karpathy',
      text: 'The gap between frontier models keeps widening. Local models are catching up fast though.',
      sourceUrl: 'https://x.com/karpathy/status/1234567891',
      postedAt: '2026-11-14T12:00:00.000Z',
      isReply: true,
      parentId: '1234567890',
      synthesisStatus: 'used'
    },
    {
      platform: 'linkedin',
      externalId: 'li-post-987654321',
      authorHandle: 'openai',
      authorName: 'OpenAI',
      text: 'Our new reasoning model is already being tested by research partners across math and competitive programming.',
      sourceUrl: 'https://www.linkedin.com/posts/openai_reasoning-model-activity-987654321',
      postedAt: '2026-11-14T14:00:00.000Z',
      synthesisStatus: 'used'
    }
  ]
  const sourceIds = []
  for (const p of rawPosts) {
    const existing = await api(`/raw-posts?where[externalId][equals]=${p.externalId}&limit=1`, auth)
    if (existing.docs.length) {
      sourceIds.push(existing.docs[0].id)
      console.log(`Raw post exists: ${p.externalId}`)
    } else {
      const { doc } = await api('/raw-posts', { method: 'POST', token, body: p })
      sourceIds.push(doc.id)
      console.log(`Created raw post: ${p.externalId} (${p.platform})`)
    }
  }

  // 4. Article
  const articleSlug = 'openai-prepares-new-reasoning-model-that-beats-math-and-coding-benchmarks'
  const existingArticle = await api(`/articles?where[slug][equals]=${articleSlug}&limit=1`, auth)
  if (existingArticle.docs.length) {
    console.log('Article exists, skipping')
  } else {
    await api('/articles', {
      method: 'POST',
      token,
      body: {
        title: 'OpenAI Prepares New Reasoning Model That Beats Math and Coding Benchmarks',
        excerpt:
          'Sam Altman announced a new reasoning model generation, claimed to be the strongest yet on math and coding benchmarks.',
        body: `## Context

Discussion on X heated up after **Sam Altman** announced that OpenAI will launch a new reasoning model next week.

## Details

- Said to be the strongest on math and code benchmarks.
- **Andrej Karpathy** responded that the gap between frontier models keeps widening, though local models are catching up fast.

> The gap between frontier models keeps widening. Local models are catching up fast though.

## Implications

The launch could shift the evaluation standards for open source models.`,
        topics: topicDocs.map((t) => t.id),
        sources: sourceIds,
        status: 'published',
        publishedAt: '2026-11-15T10:00:00.000Z',
        metaTitle: 'OpenAI Launches New Reasoning Model — BaitBuzz',
        metaDescription:
          'Sam Altman announces OpenAI\'s new reasoning model, beating math and coding benchmarks.'
      }
    })
    console.log('Created article')
  }

  // 5. Pages
  const pages = [
    {
      title: 'About',
      body: `## About BaitBuzz

BaitBuzz is a media platform for AI and technology content.

Articles are synthesized by AI from collections of posts and replies across social platforms (X, Threads, LinkedIn, and more), then rewritten in our own words.

Our goal is to surface the most interesting technical discussions happening across social media and turn them into readable, well-structured articles.`
    },
    {
      title: 'Contact',
      body: `## Contact

Have a tip, correction, or feedback? Reach us at **hello@baitbuzz.dev**.`
    }
  ]
  for (const p of pages) {
    const slug = p.title.toLowerCase()
    const existing = await api(`/pages?where[slug][equals]=${slug}&limit=1`, auth)
    if (existing.docs.length) {
      console.log(`Page exists: ${p.title}`)
    } else {
      await api('/pages', {
        method: 'POST',
        token,
        body: { ...p, status: 'published', publishedAt: '2026-11-15T00:00:00.000Z' }
      })
      console.log(`Created page: ${p.title}`)
    }
  }

  console.log('\nSeed complete.')
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
