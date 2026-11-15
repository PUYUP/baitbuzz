import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

const formatSlug =
  (fieldToUse = 'title'): CollectionBeforeChangeHook =>
  ({ data, operation }) => {
    if (operation === 'create' && data && typeof data === 'object') {
      const value = data[fieldToUse]
      if (typeof value === 'string' && value !== '') {
        data.slug = value
          .toLowerCase()
          .normalize('NFKD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      }
    }
    return data
  }

const isEditor = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

/**
 * Standalone pages such as About, Contact, Privacy Policy, etc.
 * Rendered by the frontend at the root level: /{slug}
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { status: { equals: 'published' } }),
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Public URL path: /{slug}',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Page body in Markdown.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
    },
    {
      name: 'metaDescription',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeChange: [formatSlug('title')],
  },
}
