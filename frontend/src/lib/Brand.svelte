<script lang="ts">
  import { site } from './site'

  const name = site.name
  const aiIndex = name.toLowerCase().indexOf('ai')
</script>

<span class="brand">
  {#if aiIndex === -1}
    {name}
  {:else}
    {name.slice(0, aiIndex)}<strong>{name.slice(aiIndex, aiIndex + 2)}</strong>{name.slice(aiIndex + 2)}
  {/if}
</span>
