import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { buildConfig } from 'payload'

import { ArticleViews } from './collections/ArticleViews'
import { Articles } from './collections/Articles'
import { articleViewStats, trackArticleView } from './endpoints/articleViews'
import { ingestRawPosts } from './endpoints/ingestRawPosts'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { RawPosts } from './collections/RawPosts'
import { Topics } from './collections/Topics'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Topics, RawPosts, Articles, Pages, Media, ArticleViews],
  endpoints: [ingestRawPosts, trackArticleView, articleViewStats],
  cors: [
    'http://localhost:5173',
    'https://baitbuzz.com',
    'https://www.baitbuzz.com',
    'https://cms.baitbuzz.com',
  ],
  csrf: [
    'http://localhost:5173',
    'https://baitbuzz.com',
    'https://www.baitbuzz.com',
    'https://cms.baitbuzz.com',
  ],
  db:
    (process.env.DATABASE_URL || '').startsWith('postgres')
      ? postgresAdapter({
          pool: {
            connectionString: process.env.DATABASE_URL,
            // Transaction pooler (6543) multiplexes clients, so a normal pool
            // size is fine. Session pooler (5432) has a tiny client limit —
            // keep it minimal there to avoid EMAXCONNSESSION.
            max: Number(
              process.env.DATABASE_POOL_MAX ??
                ((process.env.DATABASE_URL ?? '').includes(':6543') ? 10 : 1)
            ),
            idleTimeoutMillis: 10_000,
            connectionTimeoutMillis: 30_000,
          },
          migrationDir: path.resolve(dirname, 'migrations/postgres'),
        })
      : sqliteAdapter({
          client: {
            url: 'file:./payload.db',
          },
          migrationDir: path.resolve(dirname, 'migrations/sqlite'),
        }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
