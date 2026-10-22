import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

import { authenticated } from '../lib/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Local uploads land in `cms/media`. In production set the Supabase Storage
 * (S3-compatible) env vars in `payload.config.ts` and uploads go to the bucket
 * instead.
 */
const staticDir = process.env.MEDIA_DIR || path.resolve(dirname, '../../media')
if (!process.env.S3_BUCKET) fs.mkdirSync(staticDir, { recursive: true })

/** Public base for Supabase Storage, e.g. https://<ref>.supabase.co/storage/v1/object/public/shelf-media */
const publicMediaBase = (process.env.SUPABASE_PUBLIC_MEDIA_URL || '').replace(/\/+$/, '')

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Media' },
  admin: {
    useAsTitle: 'alt',
    group: 'Content',
    description: 'Covers and inline images. Alt text is required.',
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir,
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 480, withoutEnlargement: true },
      { name: 'card', width: 960, withoutEnlargement: true },
      { name: 'hero', width: 1600, withoutEnlargement: true },
    ],
    adminThumbnail: 'thumbnail',
    ...(publicMediaBase
      ? {
          generateFileURL: ({ filename }: { filename: string }) => `${publicMediaBase}/${filename}`,
        }
      : {}),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for screen readers and search engines.' },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional line shown under the image.' },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Optional photographer or source credit.' },
    },
  ],
}
