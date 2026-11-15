<script lang="ts">
  import { onMount } from 'svelte'
  import { marked } from 'marked'
  import Breadcrumbs from '#lib/Breadcrumbs.svelte'
  import { breadcrumbJsonLd, type Crumb } from '#lib/breadcrumb'
  import type { RawPost } from '#lib/types'
  import { articleTopics, formatDate, readingTime } from '#lib/format'
  import { trackArticleView } from '#lib/api'
  import { site } from '#lib/site'
  import { absoluteUrl, jsonLdScript, metaDescription } from '#lib/seo'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const article = $derived(data.article)

  const topics = $derived(articleTopics(article))
  const html = $derived(marked.parse(article.body ?? '', { async: false }) as string)
  const description = $derived(
    metaDescription(article.metaDescription || article.excerpt || article.title)
  )
  const title = $derived(
    article.metaTitle || article.title
  )
  const fullTitle = $derived(
    title.toLowerCase().includes(site.name.toLowerCase()) ? title : `${title} — ${site.name}`
  )
  const canonical = $derived(absoluteUrl(`/articles/${article.slug}`, site.url))
  const heroUrl = $derived(
    typeof article.heroImage === 'object' && article.heroImage?.url
      ? absoluteUrl(article.heroImage.url, site.url)
      : null
  )
  const sources = $derived(
    Array.isArray(article.sources)
      ? (article.sources.filter((s) => typeof s === 'object') as RawPost[])
      : []
  )
  const platformLabel = (p?: string | null) =>
    p === 'x' ? 'X' : p === 'threads' ? 'Threads' : p === 'facebook' ? 'Facebook' : p === 'linkedin' ? 'LinkedIn' : p === 'other' ? 'Web' : 'Web'

  const shareLinks = $derived([
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(canonical)}`,
      icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`,
      icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`,
      icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
    }
  ])

  let copied = $state(false)
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(canonical)
      copied = true
      setTimeout(() => (copied = false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  const jsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description,
    inLanguage: 'en',
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.publishedAt ?? undefined,
    mainEntityOfPage: canonical,
    url: canonical,
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: { '@type': 'Organization', name: site.name, url: site.url },
    image: heroUrl ?? undefined,
    keywords: topics.map((t) => t.name).join(', '),
    articleSection: topics.map((t) => t.name)
  })

  const crumbs: Crumb[] = $derived([
    { name: 'Home', href: '/' },
    ...(topics[0] ? [{ name: `#${topics[0].slug}`, href: `/topics/${topics[0].slug}` }] : []),
    { name: article.title }
  ])

  const breadcrumbLd = $derived(breadcrumbJsonLd(crumbs))

  const viewCount = $derived(data.viewStats?.total ?? null)

  onMount(() => {
    trackArticleView(article.slug)
  })
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  {#if article.publishedAt}
    <meta property="article:published_time" content={article.publishedAt} />
  {/if}
  {#if heroUrl}
    <meta property="og:image" content={heroUrl} />
    <meta name="twitter:card" content="summary_large_image" />
  {:else}
    <meta name="twitter:card" content="summary" />
  {/if}
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {#if heroUrl}
    <meta name="twitter:image" content={heroUrl} />
  {/if}
  {@html `<script type="application/ld+json">${jsonLdScript(jsonLd)}</script>`}
  {@html `<script type="application/ld+json">${jsonLdScript(breadcrumbLd)}</script>`}
</svelte:head>

<article class="full">
  <Breadcrumbs items={crumbs} />
  <h1>{article.title}</h1>
  {#if article.excerpt}
    <p class="excerpt">{article.excerpt}</p>
  {/if}
  <div class="meta">
    <time datetime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt)}</time>
    <span>· {readingTime(article.body)} min read</span>
    {#if viewCount !== null}
      <span>· {viewCount} {viewCount === 1 ? 'view' : 'views'}</span>
    {/if}
    {#each topics as topic (topic.id)}
      <a class="tag" href="/topics/{topic.slug}">#{topic.slug}</a>
    {/each}
  </div>

  <div class="share" aria-label="Share this article">
    <span class="share-label">Share:</span>
    {#each shareLinks as link (link.name)}
      <a class="share-icon" href={link.href} target="_blank" rel="noopener noreferrer" aria-label="Share on {link.name}" title={link.name}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d={link.icon} /></svg>
      </a>
    {/each}
    <button class="share-icon share-copy" type="button" onclick={copyLink} aria-label="Copy link" title={copied ? 'Copied' : 'Copy link'}>
      {#if copied}
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
      {:else}
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
      {/if}
    </button>
  </div>

  {#if heroUrl}
    <img class="hero" src={heroUrl} alt={article.title} />
  {/if}

  <div class="prose">
    {@html html}
  </div>

  {#if sources.length > 0}
    <section class="sources" aria-label="Sources">
      <h2>Sources</h2>
      <ul>
        {#each sources as source (source.id)}
          <li>
            <span class="src-author">
              <span class="src-platform">{platformLabel(source.platform)}</span>
              {source.authorHandle}{source.isReply ? ' · reply' : ''}
            </span>
            {#if source.sourceUrl}
              <a class="src-text" href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
                {source.text}
              </a>
            {:else}
              <span class="src-text">{source.text}</span>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</article>
