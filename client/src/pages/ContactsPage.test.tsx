import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/render'
import { company } from '../content/company'

describe('ContactsPage', () => {
  it('shows company contacts and a contact form without service select', () => {
    renderApp('/contacts')
    expect(screen.getAllByRole('link', { name: company.phone })[0]).toHaveAttribute('href', company.phoneHref)
    expect(company.phone2).toMatch(/^[+]375/)
    expect(screen.getAllByRole('link', { name: company.phone2 })[0]).toHaveAttribute('href', company.phone2Href)
    expect(screen.getAllByText(company.address).length).toBeGreaterThan(0)
    const map = screen.getByTitle('Карта: офис на карте')
    expect(map.tagName).toBe('IFRAME')
    expect(map).toHaveAttribute('loading', 'lazy')
    expect(map.getAttribute('src')).toContain(`${company.mapLon},${company.mapLat}`)
    expect(screen.getByRole('link', { name: 'Построить маршрут' })).toHaveAttribute('href', expect.stringContaining('yandex'))
    expect(screen.getByRole('button', { name: 'Отправить заявку' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Услуги')).not.toBeInTheDocument()
  })
})
