import { describe, expect, it } from 'vitest'
import { buildPosts, parseFrontmatter } from './news'

const raw = `---
title: Заголовок
date: 2026-08-20
excerpt: Кратко
cover: /news/a.jpg
---

# Текст

Абзац.`

describe('parseFrontmatter', () => {
  it('splits frontmatter keys from the body', () => {
    const { data, body } = parseFrontmatter(raw)
    expect(data).toEqual({ title: 'Заголовок', date: '2026-08-20', excerpt: 'Кратко', cover: '/news/a.jpg' })
    expect(body.trim()).toBe('# Текст\n\nАбзац.')
  })
  it('returns empty data when there is no frontmatter', () => {
    expect(parseFrontmatter('just text')).toEqual({ data: {}, body: 'just text' })
  })
})

describe('buildPosts', () => {
  it('derives slug from filename and sorts newest first', () => {
    const posts = buildPosts({
      '../content/news/2026-01-01-old.md': '---\ntitle: Old\ndate: 2026-01-01\nexcerpt: o\n---\nold',
      '../content/news/2026-03-01-new.md': '---\ntitle: New\ndate: 2026-03-01\nexcerpt: n\n---\nnew',
    })
    expect(posts.map((p) => p.slug)).toEqual(['2026-03-01-new', '2026-01-01-old'])
    expect(posts[0]).toMatchObject({ title: 'New', date: '2026-03-01', excerpt: 'n', body: 'new' })
    expect(posts[0].cover).toBeUndefined()
  })
})
