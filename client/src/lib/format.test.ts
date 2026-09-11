import { describe, expect, it } from 'vitest'
import { formatDate, formatPrice } from './format'

describe('formatPrice', () => {
  it('appends BYN with a non-breaking space', () => {
    expect(formatPrice(150)).toBe('150\u00a0BYN')
  })
  it('groups thousands with a narrow no-break space', () => {
    expect(formatPrice(1500)).toBe('1\u202f500\u00a0BYN')
    expect(formatPrice(1234567)).toBe('1\u202f234\u202f567\u00a0BYN')
  })
})

describe('formatDate', () => {
  it('formats ISO dates in Russian', () => {
    expect(formatDate('2026-08-20')).toBe('20 \u0430\u0432\u0433\u0443\u0441\u0442\u0430 2026 \u0433.')
  })
})
