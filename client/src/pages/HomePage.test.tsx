import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render'
import { packages } from '../content/packages'

describe('HomePage', () => {
  it('shows all packages with prices and the popular badge', () => {
    renderApp('/')
    for (const p of packages) expect(screen.getByRole('heading', { name: p.name })).toBeInTheDocument()
    expect(screen.getByText('Популярный')).toBeInTheDocument()
    expect(screen.getByText(/^450 BYN/)).toBeInTheDocument()
  })

  it('opens the order modal preselecting the clicked package', async () => {
    renderApp('/')
    const card = screen.getByRole('heading', { name: 'Малый бизнес' }).closest('article')!
    await userEvent.click(within(card).getByRole('button', { name: 'Заказать' }))
    const dialog = screen.getByRole('dialog', { name: 'Заказать: Малый бизнес' })
    expect(within(dialog).getByLabelText('Услуга')).toHaveValue('package:small')
  })
})
