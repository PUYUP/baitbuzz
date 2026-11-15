import type { CollectionConfig } from 'payload'

/**
 * One document per article view. Rows are grouped by day (viewedAt)
 * for time-series queries via the /api/views/stats endpoint.
 * Writes go through the public /api/views/track endpoint only.
 */
export const ArticleViews: CollectionConfig = {
  slug: 'article-views',
  admin: {
    hidden: true,
    defaultColumns: ['article', 'viewedAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      index: true,
    },
    {
      name: 'viewedAt',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
      },
    },
  ],
}
