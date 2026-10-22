import { redirect } from 'next/navigation'

/** The CMS only serves the admin panel and the REST/GraphQL API. */
export default function CmsHome() {
  redirect('/admin')
}
