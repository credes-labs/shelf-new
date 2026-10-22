/**
 * Minimal Lexical types and helpers shared by the blog pages.
 *
 * Payload stores rich text as Lexical JSON. The site renders it directly, so
 * there is no dependency on Payload's React bundle at runtime.
 */

export type LexicalNode = {
  type: string
  text?: string
  format?: number | string
  tag?: string
  listType?: string
  url?: string
  fields?: {
    url?: string
    newTab?: boolean
    linkType?: string
    doc?: { relationTo?: string; value?: string | { slug?: string } | null } | null
  }
  value?: unknown
  children?: LexicalNode[]
}

export type LexicalValue = { root: LexicalNode }

export type TextBlock = { heading?: string; text?: string }

const textNode = (text: string): LexicalNode => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
} as LexicalNode)

const blockNode = (block: TextBlock): LexicalNode =>
  block.heading
    ? ({
        type: 'heading',
        tag: 'h2',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [textNode(block.heading)],
      } as unknown as LexicalNode)
    : ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [textNode(block.text ?? '')],
      } as unknown as LexicalNode)

/** Convert the bundled fallback articles to the same shape the CMS returns. */
export function blocksToLexical(blocks: TextBlock[]): LexicalValue {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: blocks.map(blockNode),
    } as unknown as LexicalNode,
  }
}

/** Rough reading time for fallback content (the CMS stores its own). */
export function estimateReadingTime(blocks: TextBlock[]): number {
  const words = blocks
    .map((block) => `${block.heading ?? ''} ${block.text ?? ''}`)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}
