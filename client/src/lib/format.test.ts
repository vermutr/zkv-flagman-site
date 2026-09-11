import { describe, expect, it } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('appends BYN with a non-breaking space', () => {
    expect(formatPrice(150)).toBe('150\u00a0BYN')
  })
  it('groups thousands with a narrow no-break space', () => {
    expect(formatPrice(1500)).toBe('1\u202f500\u00a0BYN')
    expect(formatPrice(1234567)).toBe('1\u202f234\u202f567\u00a0BYN')
  })
})
