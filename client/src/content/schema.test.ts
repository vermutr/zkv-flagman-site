import { describe, expect, it } from 'vitest'
import { parsePackages, parseServices } from './schema'

const service = {
  slug: 'reviziya',
  name: 'Ревизия',
  description: 'Коротко',
  details: ['Абзац'],
  priceFrom: 500,
  category: 'Разовые задачи',
}

const pkg = { slug: 'ip', name: 'ИП', audience: 'Для ИП', pricePerMonth: 320, features: ['До 30 операций'] }

describe('content schema', () => {
  it('accepts valid services and packages', () => {
    expect(parseServices([service])).toEqual([service])
    expect(parsePackages([pkg])).toEqual([pkg])
  })
  it('rejects a service without a slug and names the field in the error', () => {
    const { slug: _slug, ...noSlug } = service
    expect(() => parseServices([noSlug])).toThrow(/slug/)
  })
  it('rejects duplicate slugs', () => {
    expect(() => parseServices([service, service])).toThrow(/reviziya/)
    expect(() => parsePackages([pkg, pkg])).toThrow(/ip/)
  })
  it('rejects a negative price and a non-array details field', () => {
    expect(() => parseServices([{ ...service, priceFrom: -1 }])).toThrow(/priceFrom/)
    expect(() => parseServices([{ ...service, details: 'текст' }])).toThrow(/details/)
  })
})
