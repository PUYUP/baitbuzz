<script lang="ts">
  import ArticleCard from '#lib/ArticleCard.svelte'
  import { articleTopics, formatDate } from '#lib/format'
  import { site } from '#lib/site'
  import { jsonLdScript } from '#lib/seo'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const lead = $derived(data.headline[0] ?? null)
  const secondary = $derived(data.headline.slice(1))
  const headlineIds = $derived(new Set(data.headline.map((a) => a.id)))
  const rest = $derived(data.articles.filter((a) => !headlineIds.has(a.id)))

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
  {#if data.headline.length > 0}
    <section class="top-stories" aria-label="Headlines">
    <h2 class="section-label">Headlines</h2>

    {#if lead}
      <article class="lead-story">
        <h2 class="lead-title"><a href="/articles/{lead.slug}">{lead.title}</a></h2>
        {#if lead.excerpt}
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
    </section>
  {/if}

  {#each rest as article (article.id)}
    <ArticleCard {article} />
  {/each}
{/if}
