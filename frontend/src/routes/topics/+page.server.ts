import { getTopics } from '#lib/api'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const topics = await getTopics()
  return { topics: topics.docs }
}
