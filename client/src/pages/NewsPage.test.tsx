import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/render'
import { loadNews } from '../lib/news'

describe('news pages', () => {
  it('lists all posts newest first', () => {
    renderApp('/news')
    const posts = loadNews()
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(headings).toEqual(posts.map((p) => p.title))
  })

  it('renders an article with markdown body', () => {
    renderApp('/news/2026-05-15-novyi-ofis')
    expect(screen.getByRole('heading', { level: 1, name: 'Мы переехали в новый офис на Немиге' })).toBeInTheDocument()
    expect(screen.getByText(/С 15 мая наш офис находится/)).toBeInTheDocument()
    expect(screen.getByText('15 мая 2026 г.')).toBeInTheDocument()
  })

  it('shows 404 for an unknown slug', () => {
    renderApp('/news/does-not-exist')
    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument()
  })
})
