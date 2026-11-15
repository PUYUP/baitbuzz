<script lang="ts">
  import Breadcrumbs from '#lib/Breadcrumbs.svelte'
  import { breadcrumbJsonLd, type Crumb } from '#lib/breadcrumb'
  import { site } from '#lib/site'
  import { jsonLdScript } from '#lib/seo'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const title = `Topics — ${site.name}`
  const description = 'Explore topics about AI and technology on BaitBuzz.'
  const canonical = `${site.url}/topics`

  const crumbs: Crumb[] = [
    { name: 'Home', href: '/' },
    { name: 'Topics' }
  ]

  const jsonLd = [
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
  ]
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
<h1 style="font-size:1.6rem; margin:0 0 1.5rem; letter-spacing:-0.02em">Topics</h1>

{#if data.topics.length === 0}
  <p class="empty">No topics yet.</p>
{:else}
  <div class="topics-grid">
    {#each data.topics as topic (topic.id)}
      <a href="/topics/{topic.slug}">#{topic.slug}</a>
    {/each}
  </div>
{/if}
