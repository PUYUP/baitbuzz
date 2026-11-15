<script lang="ts">
  import type { Article } from './types'
  import { articleTopics, formatDate } from './format'

  let { article }: { article: Article } = $props()
  const topics = $derived(articleTopics(article))
</script>

<article class="card">
  <h2><a href="/articles/{article.slug}">{article.title}</a></h2>
  {#if article.excerpt}
    <p class="excerpt">{article.excerpt}</p>
  {/if}
  <div class="meta">
    <time datetime={article.publishedAt ?? undefined}>{formatDate(article.publishedAt)}</time>
    {#each topics as topic (topic.id)}
      <a class="tag" href="/topics/{topic.slug}">#{topic.slug}</a>
    {/each}
  </div>
</article>
