import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

const formatSlug =
  (fieldToUse = 'name'): CollectionBeforeChangeHook =>
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

export const Topics: CollectionConfig = {
  slug: 'topics',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', '_status'],
  },
  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
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
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'articles',
      type: 'join',
      collection: 'articles',
      on: 'topics',
    },
  ],
  hooks: {
    beforeChange: [formatSlug('name')],
  },
}
