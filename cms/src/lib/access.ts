import type { Access, FieldHook } from 'payload'

/** Turn any title into a URL-safe slug. */
export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)

/**
 * Slug field hook: keeps an explicitly typed slug, otherwise derives one from
 * the document's title. Runs on create and on every update where the title
 * changes but the slug was left untouched.
 */
export const slugFrom = (titleField = 'title'): FieldHook => {
  return ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const source = data?.[titleField] ?? originalDoc?.[titleField] ?? ''
    return typeof source === 'string' ? slugify(source) : ''
  }
}

/** Anyone may read; only signed-in admins may change content. */
export const anyone: Access = () => true
export const authenticated: Access = ({ req }) => Boolean(req.user)
