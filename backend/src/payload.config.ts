import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { buildConfig } from 'payload'

import { Articles } from './collections/Articles'
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
  collections: [Users, Topics, RawPosts, Articles, Pages, Media],
  cors: [
    'http://localhost:5173',
    'https://baitbuzz.com',
    'https://www.baitbuzz.com',
  ],
  csrf: [
    'http://localhost:5173',
    'https://baitbuzz.com',
    'https://www.baitbuzz.com',
  ],
  db:
    (process.env.DATABASE_URL || '').startsWith('postgres')
      ? postgresAdapter({
          pool: {
            connectionString: process.env.DATABASE_URL,
            // Serverless-safe: Supabase session pooler has a small client
            // limit (default pool_size 15). Keep per-instance connections low.
            max: Number(process.env.DATABASE_POOL_MAX ?? 1),
            idleTimeoutMillis: 10_000,
            connectionTimeoutMillis: 10_000,
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
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
