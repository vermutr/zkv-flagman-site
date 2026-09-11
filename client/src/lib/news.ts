export type NewsPost = {
  slug: string
  title: string
  date: string
  excerpt: string
  cover?: string
  body: string
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(FRONTMATTER)
  if (!match) return { data: {}, body: raw }
  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    data[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return { data, body: raw.slice(match[0].length) }
}

export function buildPosts(files: Record<string, string>): NewsPost[] {
  return Object.entries(files)
    .map(([path, raw]) => {
      const slug = path.split('/').pop()!.replace(/\.md$/, '')
      const { data, body } = parseFrontmatter(raw)
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? '',
        excerpt: data.excerpt ?? '',
        cover: data.cover || undefined,
        body,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

const files = import.meta.glob('../content/news/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const posts = buildPosts(files)

export function loadNews(): NewsPost[] {
  return posts
}

export function getPost(slug: string): NewsPost | undefined {
  return posts.find((p) => p.slug === slug)
}
