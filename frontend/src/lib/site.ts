import {
  PUBLIC_SITE_DESCRIPTION,
  PUBLIC_SITE_NAME,
  PUBLIC_SITE_TAGLINE,
  PUBLIC_SITE_URL
} from '$app/env/public'

export const site = {
  name: PUBLIC_SITE_NAME || 'baitbuzz',
  tagline:
    PUBLIC_SITE_TAGLINE ||
    'AI & tech content, synthesized from the best discussions on social media.',
  url: PUBLIC_SITE_URL.replace(/\/$/, ''),
  description:
    PUBLIC_SITE_DESCRIPTION ||
    'AI & tech news synthesized from social posts, rewritten in our own words.'
}
