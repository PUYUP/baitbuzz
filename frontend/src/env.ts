import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
  PUBLIC_SITE_NAME: {
    public: true,
    schema: (value) => value || '',
    description: 'Site name shown in logo, titles and metadata'
  },
  PUBLIC_SITE_TAGLINE: {
    public: true,
    schema: (value) => value || '',
    description: 'Site tagline shown in the footer'
  },
  PUBLIC_SITE_DESCRIPTION: {
    public: true,
    schema: (value) => value || '',
    description: 'Site meta description. Falls back to a built-in default.'
  },
  PUBLIC_PAYLOAD_API: {
    public: true,
    schema: (value) => value || 'http://localhost:3000/api',
    description: 'PayloadCMS REST API base URL'
  },
  PUBLIC_SITE_URL: {
    public: true,
    schema: (value) => value || 'http://localhost:5173',
    description: 'Public base URL of this site (canonical, OG, sitemap, RSS)'
  },
  PUBLIC_GA_ID: {
    public: true,
    schema: (value) => value || '',
    description: 'Google Analytics 4 measurement ID (G-XXXXXXX). Empty disables GA.'
  },
  REVALIDATE_SECRET: {
    schema: (value) => value || '',
    description: 'Shared secret for POST /api/revalidate cache busting. Must match the backend value.'
  }
})
