import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
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
  }
})
