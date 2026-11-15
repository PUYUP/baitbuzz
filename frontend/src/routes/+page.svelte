<script lang="ts">
  import ArticleCard from '#lib/ArticleCard.svelte'
  import { site } from '#lib/site'
  import { jsonLdScript } from '#lib/seo'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

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

{#if data.articles.length === 0}
  <p class="empty">No articles published yet.</p>
{:else}
  {#each data.articles as article (article.id)}
    <ArticleCard {article} />
  {/each}
{/if}
