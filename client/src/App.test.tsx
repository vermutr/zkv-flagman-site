import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from './test/render'

describe('App shell', () => {
  it('renders navigation with all sections', () => {
    renderApp('/')
    const nav = screen.getByRole('navigation', { name: 'Основное меню' })
    for (const label of ['Услуги', 'Команда', 'Новости', 'Контакты']) {
      expect(nav).toHaveTextContent(label)
    }
  })
  it('renders 404 page for unknown routes', () => {
    renderApp('/nope')
    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument()
  })
  it('exposes the mobile menu as a nav landmark when opened', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const burger = screen.getByRole('button', { name: 'Открыть меню' })
    await user.click(burger)
    expect(screen.getByRole('navigation', { name: 'Мобильное меню' })).toBeInTheDocument()
    expect(burger).toHaveAttribute('aria-expanded', 'true')
  })
  it('opens the order modal from the header button', async () => {
    renderApp('/')
    await userEvent.click(screen.getAllByRole('button', { name: 'Заказать услугу' })[0])
    expect(screen.getByRole('dialog', { name: 'Заказать услугу' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
