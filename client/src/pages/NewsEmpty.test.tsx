import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/render'

vi.mock('../lib/news', () => ({
  loadNews: () => [],
  getPost: () => undefined,
}))

describe('news without posts', () => {
  it('shows an empty state on the news page', () => {
    renderApp('/news')
    expect(screen.getByText('Новостей пока нет')).toBeInTheDocument()
  })

  it('hides the news section on the home page', () => {
    renderApp('/')
    expect(screen.queryByRole('heading', { name: 'Что нового' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Все новости' })).not.toBeInTheDocument()
  })
})
