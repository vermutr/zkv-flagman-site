import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render'
import { packages } from '../content/packages'
import { services, serviceCategories } from '../content/services'

describe('ServicesPage', () => {
  it('shows packages by default and switches to services', async () => {
    renderApp('/services')
    expect(screen.getByRole('tab', { name: 'Пакеты' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: packages[0].name })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: services[0].name })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Отдельные услуги' }))
    for (const c of serviceCategories) expect(screen.getByRole('heading', { name: c })).toBeInTheDocument()
    for (const s of services) expect(screen.getByRole('heading', { name: s.name })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: packages[0].name })).not.toBeInTheDocument()
  })

  it('links tabs to panels and switches them with arrow keys', async () => {
    renderApp('/services')
    const packagesTab = screen.getByRole('tab', { name: 'Пакеты' })
    expect(screen.getByRole('tabpanel', { name: 'Пакеты' })).toBeInTheDocument()
    packagesTab.focus()
    await userEvent.keyboard('{ArrowRight}')
    const servicesTab = screen.getByRole('tab', { name: 'Отдельные услуги' })
    expect(servicesTab).toHaveAttribute('aria-selected', 'true')
    expect(servicesTab).toHaveFocus()
    expect(screen.getByRole('tabpanel', { name: 'Отдельные услуги' })).toBeInTheDocument()
  })

  it('opens service details and hands off to the order form with the service preselected', async () => {
    renderApp('/services?tab=services')
    const s = services[0]
    const card = screen.getByRole('heading', { name: s.name }).closest('article')!
    await userEvent.click(within(card).getByRole('button', { name: 'Подробнее' }))
    const details = screen.getByRole('dialog', { name: s.name })
    expect(within(details).getByText(s.details[0])).toBeInTheDocument()
    await userEvent.click(within(details).getByRole('button', { name: 'Заказать услугу' }))
    expect(screen.queryByRole('dialog', { name: s.name })).not.toBeInTheDocument()
    const order = screen.getByRole('dialog', { name: `Заказать: ${s.name}` })
    expect(within(order).getByRole('button', { name: `Убрать: ${s.name}` })).toBeInTheDocument()
  })

  it('opens the services tab from the query string', () => {
    renderApp('/services?tab=services')
    expect(screen.getByRole('tab', { name: 'Отдельные услуги' })).toHaveAttribute('aria-selected', 'true')
  })
})
