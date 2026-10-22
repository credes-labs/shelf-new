import type { CollectionConfig } from 'payload'

import { authenticated, slugFrom } from '../lib/access'
import { readingTimeHook } from '../lib/reading-time'
import { revalidatePost, revalidatePostAfterDelete } from '../lib/revalidate'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Posts' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    description: 'Long-form notes. Drafts stay private until published.',
  },
  access: {
    // Signed-in editors see everything; the public only sees published posts.
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  hooks: {
    beforeChange: [readingTimeHook],
    afterChange: [revalidatePost],
    afterDelete: [revalidatePostAfterDelete],
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
        description: 'Used in the URL: /blog/<slug>. Generated from the title if left empty.',
      },
      hooks: {
        beforeValidate: [slugFrom('title')],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 400,
      admin: {
        description: 'One or two sentences for the blog index, search results and link previews.',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Wide image shown at the top of the article (1600×1000 works well).',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: { description: 'Optional keywords for filtering later.' },
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      defaultValue: 'Divyaraj Chauhan',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Controls ordering on the blog.',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Minutes, calculated from the body on save.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Pin this post to the top of the blog.',
      },
    },
    {
      name: 'seriesNote',
      type: 'textarea',
      admin: {
        description: 'Optional footer note, e.g. which series the post belongs to.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
