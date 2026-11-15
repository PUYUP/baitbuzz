import { sveltekit } from '@sveltejs/kit/vite'
import adapterNode from '@sveltejs/adapter-node'
import adapterVercel from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// adapter-vercel on Vercel, adapter-node everywhere else (local prod builds)
const adapter = process.env.VERCEL ? adapterVercel() : adapterNode()

export default defineConfig({
  plugins: [
    sveltekit({
      adapter,
      preprocess: vitePreprocess(),
      alias: {
        '#lib': 'src/lib'
      }
    })
  ]
})
