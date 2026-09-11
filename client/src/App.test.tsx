import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App shell', () => {
  it('renders navigation with all sections', () => {
    renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Основное меню' })
    for (const label of ['Услуги', 'Команда', 'Новости', 'Контакты']) {
      expect(nav).toHaveTextContent(label)
    }
  })
  it('renders 404 page for unknown routes', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument()
  })
  it('exposes the mobile menu as a nav landmark when opened', async () => {
    const user = userEvent.setup()
    renderAt('/')
    const burger = screen.getByRole('button', { name: 'Открыть меню' })
    await user.click(burger)
    expect(screen.getByRole('navigation', { name: 'Мобильное меню' })).toBeInTheDocument()
    expect(burger).toHaveAttribute('aria-expanded', 'true')
  })
})
