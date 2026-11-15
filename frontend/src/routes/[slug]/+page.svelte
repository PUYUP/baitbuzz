<script lang="ts">
  import { marked } from 'marked'
  import Breadcrumbs from '#lib/Breadcrumbs.svelte'
  import { breadcrumbJsonLd, type Crumb } from '#lib/breadcrumb'
  import { formatDate } from '#lib/format'
  import { site } from '#lib/site'
  import { absoluteUrl, jsonLdScript } from '#lib/seo'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const page = $derived(data.page)

  const html = $derived(marked.parse(page.body ?? '', { async: false }) as string)
  const description = $derived(page.metaDescription || page.excerpt || page.title)
  const title = $derived(page.metaTitle || page.title)
  const fullTitle = $derived(
    title.toLowerCase().includes(site.name.toLowerCase()) ? title : `${title} — ${site.name}`
  )
  const canonical = $derived(absoluteUrl(`/${page.slug}`, site.url))

  const crumbs: Crumb[] = $derived([
    { name: 'Home', href: '/' },
    { name: page.title }
  ])

  const jsonLd = $derived([
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description,
      url: canonical,
      inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', name: site.name, url: site.url },
      ...(page.publishedAt ? { datePublished: page.publishedAt } : {})
    },
    breadcrumbJsonLd(crumbs)
  ])
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  {#each jsonLd as schema (schema['@type'])}
    {@html `<script type="application/ld+json">${jsonLdScript(schema)}</script>`}
  {/each}
</svelte:head>

<article class="full">
  <Breadcrumbs items={crumbs} />
  <h1>{page.title}</h1>
  {#if page.publishedAt}
    <div class="meta">
      <time datetime={page.publishedAt}>{formatDate(page.publishedAt)}</time>
    </div>
  {/if}

  <div class="prose">
    {@html html}
  </div>
</article>
