import { error, json } from '@sveltejs/kit'
import { REVALIDATE_SECRET } from '$app/env/private'
import { clearApiCache } from '#lib/api'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  const secret = request.headers.get('x-revalidate-secret')
  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    throw error(401, 'Unauthorized')
  }
  clearApiCache()
  return json({ revalidated: true })
}
