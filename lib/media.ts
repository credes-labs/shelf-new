const CMS_URL = (process.env.PAYLOAD_URL || '').replace(/\/+$/, '')

/**
 * Payload returns relative media URLs for local uploads and absolute URLs for
 * S3/Supabase Storage. Resolve the relative ones against the CMS origin.
 */
export function mediaUrl(url?: string | null): string | null {
  if (!url) return null
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('/images/') || url.startsWith('/svg/')) {
    return url
  }
  if (!CMS_URL) return url
  return `${CMS_URL}${url.startsWith('/') ? '' : '/'}${url}`
}
