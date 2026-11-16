<script lang="ts">
  import ArticleCard from '#lib/ArticleCard.svelte'
  import { articleTopics, formatDate } from '#lib/format'
  import { site } from '#lib/site'
  import { jsonLdScript, absoluteUrl } from '#lib/seo'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const lead = $derived(data.headline[0] ?? null)
  const secondary = $derived(data.headline.slice(1))
  const headlineIds = $derived(new Set(data.headline.map((a) => a.id)))
  const rest = $derived(data.articles.filter((a) => !headlineIds.has(a.id)))
  const leadHasImage = $derived(
    typeof lead?.heroImage === 'object' && lead.heroImage !== null && Boolean(lead.heroImage.url)
  )
  const leadHeroUrl = $derived(
    leadHasImage ? absoluteUrl((lead!.heroImage as { url: string }).url, site.url) : null
  )

  const title = `${site.name} — ${site.tagline}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: 'en'
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={site.description} />
  <link rel="canonical" href={site.url} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={site.description} />
  <meta property="og:url" content={site.url} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={site.description} />
  {@html `<script type="application/ld+json">${jsonLdScript(jsonLd)}</script>`}
</svelte:head>

{#if data.articles.length === 0 && data.headline.length === 0}
  <p class="empty">No articles published yet.</p>
{:else}
  {#if data.headline.length > 0 || data.popular.length > 0}
    <section class="headlines" aria-label="Headlines">
      <div class="headlines-grid" class:popular-only={data.headline.length === 0}>
        {#if data.headline.length > 0}
          <div class="headline-col">
            <h2 class="section-label">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
              Headlines
            </h2>

            {#if lead}
              <article class="lead-story">
                {#if leadHeroUrl}
                  <img class="lead-hero" src={leadHeroUrl} alt={lead.title} loading="lazy" />
                {/if}
                <h2 class="lead-title"><a href="/articles/{lead.slug}">{lead.title}</a></h2>
                {#if !leadHeroUrl && lead.excerpt}
                  <p class="lead-excerpt">{lead.excerpt}</p>
                {/if}
                <div class="meta">
                  <time datetime={lead.publishedAt ?? undefined}>{formatDate(lead.publishedAt)}</time>
                  {#each articleTopics(lead) as topic (topic.id)}
                    <a class="tag" href="/topics/{topic.slug}">#{topic.slug}</a>
                  {/each}
                </div>
              </article>
            {/if}

            {#if secondary.length > 0}
              <ol class="secondary-stories">
                {#each secondary as article (article.id)}
                  <li>
                    <a class="secondary-title" href="/articles/{article.slug}">{article.title}</a>
                    <time class="secondary-date" datetime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt)}</time>
                  </li>
                {/each}
              </ol>
            {/if}
          </div>
        {/if}

        {#if data.popular.length > 0}
          <aside class="popular-col" aria-label="Popular this week">
            <h2 class="section-label">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
              Popular this week
            </h2>
            <ol class="popular-list">
              {#each data.popular as article, i (article.id)}
                <li>
                  <span class="popular-rank">{i + 1}</span>
                  <a class="popular-title" href="/articles/{article.slug}">{article.title}</a>
                  <span class="popular-views">{article.views} {article.views === 1 ? 'view' : 'views'}</span>
                </li>
              {/each}
            </ol>
          </aside>
        {/if}
      </div>
    </section>
  {/if}

  {#if rest.length > 0}
    <section class="latest" aria-label="Latest articles">
      <h2 class="section-label">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
        Latest
      </h2>
      {#each rest as article (article.id)}
        <ArticleCard {article} />
      {/each}
    </section>
  {/if}
{/if}
