import type { CollectionConfig } from 'payload'

const isEditor = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

/**
 * Raw posts and replies captured from social platforms (X, Threads,
 * Facebook, LinkedIn, ...). These are the synthesis source material for
 * AI-generated articles.
 */
export const RawPosts: CollectionConfig = {
  slug: 'raw-posts',
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['platform', 'externalId', 'authorHandle', 'postedAt', 'synthesisStatus'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { synthesisStatus: { not_equals: 'pending' } }),
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  fields: [
    {
      name: 'platform',
      type: 'select',
      required: true,
      defaultValue: 'x',
      index: true,
      options: [
        { label: 'X (Twitter)', value: 'x' },
        { label: 'Threads', value: 'threads' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Platform the post was captured from.',
      },
    },
    {
      name: 'externalId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Platform-specific post ID (e.g. the numeric X/Twitter status ID).',
      },
    },
    {
      name: 'authorHandle',
      type: 'text',
      index: true,
    },
    {
      name: 'authorName',
      type: 'text',
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sourceUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Link to the original post on the platform.',
      },
    },
    {
      name: 'postedAt',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'isReply',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'parentId',
      type: 'text',
      admin: {
        description: 'externalId of the parent post when isReply is true.',
      },
    },
    {
      name: 'synthesisStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Used', value: 'used' },
        { label: 'Skipped', value: 'skipped' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Whether this post has been consumed by the AI synthesis pipeline.',
      },
    },
    {
      name: 'fetchedAt',
      type: 'date',
    },
    {
      name: 'raw',
      type: 'json',
      admin: {
        description: 'Full original payload from the platform API, kept for traceability.',
      },
    },
  ],
}
