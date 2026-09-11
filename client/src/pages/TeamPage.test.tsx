import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/render'
import { team } from '../content/team'

describe('TeamPage', () => {
  it('lists every team member with role', () => {
    renderApp('/team')
    for (const m of team) {
      expect(screen.getByRole('heading', { name: m.name })).toBeInTheDocument()
      expect(screen.getByText(m.role)).toBeInTheDocument()
    }
  })
})
