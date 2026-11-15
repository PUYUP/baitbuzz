<script lang="ts">
  import ArticleCard from '#lib/ArticleCard.svelte'
  import Breadcrumbs from '#lib/Breadcrumbs.svelte'
  import { breadcrumbJsonLd, type Crumb } from '#lib/breadcrumb'
  import { site } from '#lib/site'
  import { jsonLdScript } from '#lib/seo'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const topic = $derived(data.topic)

  const title = $derived(`#${topic.name} — ${site.name}`)
  const description = $derived(topic.description || `Articles about ${topic.name} on ${site.name}.`)
  const canonical = $derived(`${site.url}/topics/${topic.slug}`)

  const crumbs: Crumb[] = $derived([
    { name: 'Home', href: '/' },
    { name: 'Topics', href: '/topics' },
    { name: `#${topic.slug}` }
  ])

  const jsonLd = $derived([
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonical,
      inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', name: site.name, url: site.url }
    },
    breadcrumbJsonLd(crumbs)
  ])
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  {#each jsonLd as schema (schema['@type'])}
    {@html `<script type="application/ld+json">${jsonLdScript(schema)}</script>`}
  {/each}
</svelte:head>

<Breadcrumbs items={crumbs} />
<h1 style="font-size:1.6rem; margin:0 0 0.4rem; letter-spacing:-0.02em">#{topic.slug}</h1>
{#if topic.description}
  <p style="color:var(--muted); margin:0 0 1.5rem">{topic.description}</p>
{/if}

{#if data.articles.length === 0}
  <p class="empty">No articles in this topic yet.</p>
{:else}
  {#each data.articles as article (article.id)}
    <ArticleCard {article} />
  {/each}
{/if}
