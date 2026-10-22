import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import sharp from 'sharp'

import config from './payload.config'

type Block = { heading?: string; text?: string }

type SeedArticle = {
  slug: string
  category: string
  title: string
  date: string
  intro: string
  series: string | null
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
  content: Block[]
  publishedAt: string
  tags: string[]
  featured: boolean
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const articles = JSON.parse(fs.readFileSync(path.resolve(dirname, 'seed/articles.json'), 'utf8')) as SeedArticle[]
const force = process.env.SEED_FORCE === 'true' || process.argv.includes('--force')

/** Colour blocks, a big circle and a pixel staircase — no text, no fonts. */
function coverSvg(article: SeedArticle, index: number): string {
  const rotation = index % 2 === 0 ? -14 : 12
  const accent = index % 2 === 0 ? '#d9d6ff' : '#8f9cff'
  const grid = Array.from({ length: 24 }, (_, i) => {
    const x = i * 72
    return `<path d="M${x} 0V1000" />`
  }).join('')
  const rows = Array.from({ length: 15 }, (_, i) => {
    const y = i * 72
    return `<path d="M0 ${y}H1600" />`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
    <rect width="1600" height="1000" fill="#2430bc"/>
    <g stroke="#8f9cff" stroke-width="1" opacity=".22">${grid}${rows}</g>
    <g transform="rotate(${rotation} 1140 470)">
      <circle cx="1140" cy="470" r="330" fill="#6c4bff"/>
      <circle cx="1140" cy="470" r="250" fill="none" stroke="${accent}" stroke-width="3" opacity=".7"/>
      <circle cx="1140" cy="470" r="170" fill="none" stroke="${accent}" stroke-width="2" opacity=".55"/>
      <circle cx="1140" cy="470" r="90" fill="${accent}" opacity=".9"/>
    </g>
    <g fill="#d9d6ff" opacity=".9">
      <rect x="190" y="640" width="48" height="48"/>
      <rect x="238" y="592" width="48" height="48"/>
      <rect x="286" y="544" width="48" height="48"/>
      <rect x="334" y="496" width="48" height="48"/>
      <rect x="382" y="448" width="48" height="48"/>
    </g>
    <g fill="#171a5c" opacity=".55">
      <rect x="0" y="860" width="1600" height="140"/>
    </g>
    <path d="M120 150h140v14H120z" fill="#d9d6ff"/>
    <path d="M120 180h86v14h-86z" fill="#8f9cff"/>
  </svg>`
}

function textNode(text: string) {
  return { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }
}

function blockNode(block: Block) {
  if (block.heading) {
    return {
      type: 'heading',
      tag: 'h2',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      textStyle: '',
      children: [textNode(block.heading)],
    }
  }
  return {
    type: 'paragraph',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    textFormat: 0,
    textStyle: '',
    children: [textNode(block.text ?? '')],
  }
}

function toLexical(blocks: Block[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: blocks.map(blockNode),
    },
  }
}

async function run() {
  console.log(`[seed] starting${force ? ' (force)' : ''}`)
  const payload = await getPayload({ config })

  const seedEmail = process.env.PAYLOAD_SEED_EMAIL
  const seedPassword = process.env.PAYLOAD_SEED_PASSWORD
  if (seedEmail && seedPassword) {
    const users = await payload.find({ collection: 'users', limit: 1, depth: 0 })
    if (users.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: { email: seedEmail, password: seedPassword, name: 'Shelf Admin' },
      })
      console.log(`[seed] created admin ${seedEmail}`)
    } else {
      console.log('[seed] admin user already exists, leaving it alone')
    }
  }

  const categoryCache = new Map<string, number>()

  for (const [index, article] of articles.entries()) {
    // Category
    const categorySlug = article.category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    let categoryId = categoryCache.get(article.category)
    if (!categoryId) {
      const existingCategory = await payload.find({
        collection: 'categories',
        where: { slug: { equals: categorySlug } },
        limit: 1,
        depth: 0,
      })
      categoryId =
        existingCategory.docs[0]?.id ??
        (
          await payload.create({
            collection: 'categories',
            data: {
              title: article.category,
              slug: categorySlug,
              description: 'The emerging layer between AI wearables, cloud storage and personal knowledge tools.',
            },
          })
        ).id
      categoryCache.set(article.category, categoryId)
    }

    // Cover image
    const filename = `${article.slug}-cover.png`
    let coverId: number | undefined
    const existingMedia = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
    if (existingMedia.docs[0]) {
      coverId = existingMedia.docs[0].id
    } else {
      const buffer = await sharp(Buffer.from(coverSvg(article, index))).png().toBuffer()
      const media = await payload.create({
        collection: 'media',
        data: { alt: `Abstract cobalt and violet cover art for “${article.title}”.` },
        file: { data: buffer, mimetype: 'image/png', name: filename, size: buffer.length },
      })
      coverId = media.id
      console.log(`[seed] uploaded ${filename}`)
    }

    // Post
    const existingPost = await payload.find({
      collection: 'posts',
      where: { slug: { equals: article.slug } },
      limit: 1,
      depth: 0,
      draft: true,
    })

    const data = {
      title: article.title,
      slug: article.slug,
      excerpt: article.intro,
      category: categoryId!,
      coverImage: coverId,
      tags: article.tags,
      author: 'Divyaraj Chauhan',
      publishedAt: article.publishedAt,
      featured: article.featured,
      seriesNote: article.series ?? undefined,
      content: toLexical(article.content),
      _status: 'published' as const,
    }

    if (existingPost.docs[0]) {
      if (force) {
        await payload.update({ collection: 'posts', id: existingPost.docs[0].id, data })
        console.log(`[seed] updated ${article.slug}`)
      } else {
        console.log(`[seed] ${article.slug} already exists, skipping (use --force to overwrite)`)
      }
    } else {
      await payload.create({ collection: 'posts', data })
      console.log(`[seed] created ${article.slug}`)
    }
  }

  console.log('[seed] done')
  process.exit(0)
}

try {
  await run()
  process.exit(0)
} catch (error) {
  console.error('[seed] failed', error)
  process.exit(1)
}
