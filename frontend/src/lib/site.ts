import { PUBLIC_SITE_URL } from '$app/env/public'

export const site = {
  name: 'baitbuzz',
  tagline: 'AI & tech content, synthesized from the best discussions on social media.',
  url: PUBLIC_SITE_URL.replace(/\/$/, ''),
  description:
    'baitbuzz is a media platform for AI and technology content. Articles are synthesized from collections of posts and replies across X, Threads, LinkedIn and more, rewritten in our own words with the help of AI.'
}
