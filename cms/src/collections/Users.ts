import type { CollectionConfig } from 'payload'

import { authenticated } from '../lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Admin', plural: 'Admins' },
  admin: {
    useAsTitle: 'email',
    group: 'Settings',
    description: 'People who can sign in to this CMS.',
  },
  auth: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: { description: 'Shown next to posts written here.' },
    },
  ],
}
