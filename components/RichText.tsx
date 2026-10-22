import { Fragment, type ReactNode } from 'react'
import type { LexicalNode, LexicalValue } from '../lib/lexical'
import { mediaUrl } from '../lib/media'

const BOLD = 1
const ITALIC = 2
const STRIKETHROUGH = 4
const UNDERLINE = 8
const CODE = 16
const SUBSCRIPT = 32
const SUPERSCRIPT = 64

function childrenOf(node: LexicalNode): LexicalNode[] {
  return Array.isArray(node.children) ? node.children : []
}

function renderText(node: LexicalNode, key: string): ReactNode {
  let content: ReactNode = node.text ?? ''
  const format = typeof node.format === 'number' ? node.format : 0
  if (format & CODE) content = <code>{content}</code>
  if (format & BOLD) content = <strong>{content}</strong>
  if (format & ITALIC) content = <em>{content}</em>
  if (format & UNDERLINE) content = <u>{content}</u>
  if (format & STRIKETHROUGH) content = <s>{content}</s>
  if (format & SUBSCRIPT) content = <sub>{content}</sub>
  if (format & SUPERSCRIPT) content = <sup>{content}</sup>
  return <Fragment key={key}>{content}</Fragment>
}

function headingTag(tag?: string): 'h2' | 'h3' | 'h4' {
  if (tag === 'h3') return 'h3'
  if (tag === 'h4' || tag === 'h5' || tag === 'h6') return 'h4'
  return 'h2'
}

function linkHref(node: LexicalNode): string {
  const fields = node.fields
  if (fields?.linkType === 'internal' && fields.doc?.value && typeof fields.doc.value === 'object') {
    const slug = fields.doc.value.slug
    if (slug) return fields.doc.relationTo === 'posts' ? `/blog/${slug}` : `/${slug}`
  }
  return fields?.url || node.url || '#'
}

function renderUpload(node: LexicalNode, key: string): ReactNode {
  const value = node.value
  if (!value || typeof value !== 'object') return null
  const media = value as { url?: string | null; alt?: string | null; caption?: string | null; width?: number | null; height?: number | null }
  const src = mediaUrl(media.url)
  if (!src) return null
  return (
    <figure className="article-figure" key={key}>
      {/* Plain img: the CMS owns dimensions and the site ships unoptimized images. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={media.alt?.trim() || ''} width={media.width ?? undefined} height={media.height ?? undefined} loading="lazy" />
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  )
}

function renderNode(node: LexicalNode, key: string): ReactNode {
  const children = childrenOf(node).map((child, index) => renderNode(child, `${key}-${index}`))

  switch (node.type) {
    case 'text':
      return renderText(node, key)
    case 'paragraph':
      return <p key={key}>{children.length ? children : <br />}</p>
    case 'heading': {
      const Tag = headingTag(node.tag)
      return <Tag key={key}>{children}</Tag>
    }
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return <Tag key={key}>{children}</Tag>
    }
    case 'listitem':
      return <li key={key}>{children}</li>
    case 'quote':
      return <blockquote key={key}>{children}</blockquote>
    case 'link':
      return (
        <a
          key={key}
          href={linkHref(node)}
          {...(node.fields?.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    case 'upload':
      return renderUpload(node, key)
    case 'horizontalrule':
      return <hr key={key} />
    case 'linebreak':
      return <br key={key} />
    case 'code':
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      )
    case 'root':
      return <Fragment key={key}>{children}</Fragment>
    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

export default function RichText({ value }: { value?: LexicalValue | null }) {
  const nodes = value?.root?.children
  if (!Array.isArray(nodes) || nodes.length === 0) return null
  return <>{nodes.map((node, index) => renderNode(node, `n${index}`))}</>
}
