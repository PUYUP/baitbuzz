import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { revalidateFrontend, revalidateFrontendDelete } from '../hooks/revalidateFrontend'

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
 * Articles are AI-synthesized pieces generated from a cluster of raw social posts.
 * The body is stored as Markdown so it renders cleanly on the reader frontend.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'topics'],
    preview: (doc) => `/articles/${doc?.slug}`,
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
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary used for cards, meta descriptions and RSS.',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Article body in Markdown.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'topics',
      type: 'relationship',
      relationTo: 'topics',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Hashtag-style categories shown on the reader site.',
      },
    },
    {
      name: 'sources',
      type: 'relationship',
      relationTo: 'raw-posts',
      hasMany: true,
      admin: {
        description: 'Raw posts this article was synthesized from.',
      },
    },
    {
      name: 'headline',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this article in the homepage headline section.',
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
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        description: 'SEO title. Falls back to the article title.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        description: 'SEO description. Falls back to the excerpt.',
      },
    },
  ],
  hooks: {
    beforeChange: [formatSlug('title')],
    afterChange: [revalidateFrontend],
    afterDelete: [revalidateFrontendDelete],
  },
}
