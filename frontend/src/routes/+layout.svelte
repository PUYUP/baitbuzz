<script lang="ts">
  import '../app.css'
  import { PUBLIC_GA_ID } from '$app/env/public'
  import Brand from '#lib/Brand.svelte'
  import { site } from '#lib/site'
  import type { Snippet } from 'svelte'
  import type { LayoutData } from './$types'

  let { children, data }: { children: Snippet; data: LayoutData } = $props()
</script>

<svelte:head>
  {#if PUBLIC_GA_ID}
    {@html `<script async src="https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_ID}"></script>`}
    {@html `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${PUBLIC_GA_ID}');</script>`}
  {/if}
</svelte:head>

<div class="wrap">
  <header class="site">
    <a class="logo" href="/"><Brand /></a>
    <nav>
      {#each data.topTopics as topic (topic.slug)}
        <a href="/topics/{topic.slug}">#{topic.slug}</a>
      {/each}
      <a href="/topics">+ more</a>
    </nav>
  </header>

  <main>
    {@render children()}
  </main>

  <footer class="site">
    <span><Brand /> — {site.tagline}</span>
    <span>
      © {new Date().getFullYear()}
      {#each data.pages as page (page.slug)}
        · <a href="/{page.slug}">{page.title}</a>
      {/each}
      · Part of <a href="https://a09f.com" target="_blank" rel="noopener noreferrer">a09f</a>
    </span>
  </footer>
</div>
