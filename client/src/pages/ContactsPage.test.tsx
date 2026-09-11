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
    expect(screen.getByRole('button', { name: 'Отправить заявку' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Услуга')).not.toBeInTheDocument()
  })
})
