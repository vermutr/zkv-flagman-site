import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render'
import { services, serviceCategories } from '../content/services'

describe('ServicesPage', () => {
  it('shows packages by default and switches to services', async () => {
    renderApp('/services')
    expect(screen.getByRole('tab', { name: 'Пакеты' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('heading', { name: 'Малый бизнес' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: services[0].name })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Отдельные услуги' }))
    for (const c of serviceCategories) expect(screen.getByRole('heading', { name: c })).toBeInTheDocument()
    for (const s of services) expect(screen.getByRole('heading', { name: s.name })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Малый бизнес' })).not.toBeInTheDocument()
  })

  it('opens the services tab from the query string', () => {
    renderApp('/services?tab=services')
    expect(screen.getByRole('tab', { name: 'Отдельные услуги' })).toHaveAttribute('aria-selected', 'true')
  })
})
