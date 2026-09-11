import { describe, expect, it } from 'vitest'
import { orderSchema } from '../src/order/schema'

const valid = {
  name: 'Иван',
  phone: '+375 29 123-45-67',
  email: 'ivan@example.com',
  company: 'ООО Ромашка',
  message: 'Хочу пакет',
  item: { kind: 'package', slug: 'small', name: 'Малый бизнес' },
  website: '',
}

describe('orderSchema', () => {
  it('accepts a valid order', () => {
    expect(orderSchema.safeParse(valid).success).toBe(true)
  })
  it('accepts an order without item, company and message', () => {
    const { item: _i, company: _c, message: _m, ...rest } = valid
    expect(orderSchema.safeParse(rest).success).toBe(true)
  })
  it('rejects short name, bad phone and bad email', () => {
    const r = orderSchema.safeParse({ ...valid, name: 'И', phone: 'abc', email: 'nope' })
    expect(r.success).toBe(false)
    const paths = r.error!.issues.map((i) => i.path.join('.'))
    expect(paths).toEqual(expect.arrayContaining(['name', 'phone', 'email']))
  })
  it('rejects unknown item kind', () => {
    expect(orderSchema.safeParse({ ...valid, item: { ...valid.item, kind: 'x' } }).success).toBe(false)
  })
})
