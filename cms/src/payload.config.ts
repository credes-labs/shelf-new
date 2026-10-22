import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const siteURL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
const serverURL = (process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001').replace(/\/+$/, '')

const s3Enabled = Boolean(
  process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY,
)

const allowedOrigins = Array.from(new Set([siteURL, serverURL, 'http://localhost:3000', 'http://localhost:3001']))

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Shelf CMS',
      description: 'Posts, media and categories for Shelf.',
    },
  },
  collections: [Posts, Media, Categories, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'shelf-development-secret-change-before-deploying',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 10,
    },
    // Keep Payload's tables out of Supabase's public schema, which PostgREST
    // exposes. The waitlist lives in public; content lives in payload.
    schemaName: process.env.PAYLOAD_DB_SCHEMA || 'payload',
    // Schema changes ship as migrations (src/migrations). For quick local
    // prototyping you can opt into Payload's schema push with
    // PAYLOAD_DB_PUSH=true, but don't mix that with a migrated database.
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
  sharp,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  telemetry: false,
  plugins: [
    seoPlugin({
      collections: ['posts'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) => `${doc?.title ?? 'Shelf'} · Shelf`,
      generateDescription: ({ doc }) => doc?.excerpt ?? '',
      generateURL: ({ doc }) => (doc?.slug ? `${siteURL}/blog/${doc.slug}` : siteURL),
    }),
    ...(s3Enabled
      ? [
          s3Storage({
            collections: { media: true },
            bucket: process.env.S3_BUCKET as string,
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION || 'us-east-1',
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
              },
            },
          }),
        ]
      : []),
  ],
})
