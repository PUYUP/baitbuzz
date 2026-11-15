<script lang="ts">
  import { marked } from 'marked'
  import Breadcrumbs from '#lib/Breadcrumbs.svelte'
  import { breadcrumbJsonLd, type Crumb } from '#lib/breadcrumb'
  import type { RawPost } from '#lib/types'
  import { articleTopics, formatDate, readingTime } from '#lib/format'
  import { site } from '#lib/site'
  import { absoluteUrl, jsonLdScript } from '#lib/seo'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const article = $derived(data.article)

  const topics = $derived(articleTopics(article))
  const html = $derived(marked.parse(article.body ?? '', { async: false }) as string)
  const description = $derived(
    article.metaDescription || article.excerpt || article.title
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
  <div class="meta">
    <time datetime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt)}</time>
    <span>· {readingTime(article.body)} min read</span>
    {#each topics as topic (topic.id)}
      <a class="tag" href="/topics/{topic.slug}">#{topic.slug}</a>
    {/each}
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
