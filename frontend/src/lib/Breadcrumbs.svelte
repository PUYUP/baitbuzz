<script lang="ts">
  import type { Crumb } from './breadcrumb'

  let { items }: { items: Crumb[] } = $props()
</script>

<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol>
    {#each items as item, i (item.name)}
      <li class:last={i === items.length - 1}>
        {#if item.href && i < items.length - 1}
          <a href={item.href}>{item.name}</a>
        {:else}
          <span aria-current={i === items.length - 1 ? 'page' : undefined}>{item.name}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
