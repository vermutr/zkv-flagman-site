import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from './test/render'

describe('scroll on navigation', () => {
  beforeEach(() => vi.stubGlobal('scrollTo', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('scrolls to the top when a footer link opens another section', async () => {
    renderApp('/')
    const footer = screen.getByRole('contentinfo')
    await userEvent.click(within(footer).getByRole('link', { name: 'Команда' }))
    expect(screen.getByRole('heading', { name: 'Люди, которые ведут ваш учёт' })).toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }))
  })

  it('does not touch the scroll position on the initial load', () => {
    renderApp('/team')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})

describe('App shell', () => {
  it('renders navigation with all sections', () => {
    renderApp('/')
    const nav = screen.getByRole('navigation', { name: 'Основное меню' })
    for (const label of ['Услуги', 'Команда', 'Новости', 'Контакты']) {
      expect(nav).toHaveTextContent(label)
    }
  })
  it('offers a skip link that targets the main landmark', () => {
    renderApp('/')
    const skip = screen.getByRole('link', { name: 'Перейти к содержимому' })
    expect(skip).toHaveAttribute('href', '#main')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
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
  it('moves focus into the modal and returns it to the trigger on close', async () => {
    renderApp('/')
    const trigger = screen.getAllByRole('button', { name: 'Заказать услугу' })[0]
    await userEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Заказать услугу' })
    expect(dialog.contains(document.activeElement)).toBe(true)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })
})
