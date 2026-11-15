import { error } from '@sveltejs/kit'
import { getPageBySlug } from '#lib/api'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const page = await getPageBySlug(params.slug)
  if (!page) {
    error(404, 'Page not found')
  }
  return { page }
}
