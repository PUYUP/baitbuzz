import { PUBLIC_SITE_URL } from '$app/env/public'

export const site = {
  name: 'baitbuzz',
  tagline: 'AI & tech content, synthesized from the best discussions on social media.',
  url: PUBLIC_SITE_URL.replace(/\/$/, ''),
  description:
    'AI & tech news synthesized from social posts, rewritten in our own words.'
}
