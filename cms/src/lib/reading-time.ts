import type { CollectionBeforeChangeHook } from 'payload'

type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
}

function collect(node: LexicalNode, parts: string[]): void {
  if (!node || typeof node !== 'object') return
  if (typeof node.text === 'string') parts.push(node.text)
  if (Array.isArray(node.children)) {
    for (const child of node.children) collect(child, parts)
    // Keep words from adjacent blocks from gluing together.
    if (node.type && node.type !== 'root' && node.type !== 'text' && node.type !== 'link') {
      parts.push('\n')
    }
  }
}

/** Flatten Payload's Lexical JSON into plain text (used for reading time). */
export function lexicalToPlainText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const wrapped = value as { root?: LexicalNode }
  const parts: string[] = []
  collect(wrapped.root ?? (value as LexicalNode), parts)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

const WORDS_PER_MINUTE = 220

/** Store an estimated reading time on every save so the site never guesses. */
export const readingTimeHook: CollectionBeforeChangeHook = ({ data }) => {
  if (!data?.content) return data
  const words = lexicalToPlainText(data.content).split(/\s+/).filter(Boolean).length
  data.readingTime = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  return data
}
