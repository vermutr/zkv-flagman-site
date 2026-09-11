import { describe, expect, it } from 'vitest'
import { itemKey, orderFormSchema, toPayload } from './schema'

const items = [
  { kind: 'package' as const, slug: 'small', name: 'Малый бизнес' },
  { kind: 'service' as const, slug: 'payroll', name: 'Расчёт заработной платы' },
]

describe('orderFormSchema', () => {
  it('reports russian messages for required fields', () => {
    const r = orderFormSchema.safeParse({ name: '', phone: '', email: '' })
    expect(r.success).toBe(false)
    const messages = r.error!.issues.map((i) => i.message)
    expect(messages).toEqual(expect.arrayContaining(['Введите имя', 'Введите корректный телефон', 'Введите корректный email']))
  })
})

describe('toPayload', () => {
  it('maps itemKey to the matching item', () => {
    const payload = toPayload(
      { name: 'Иван', phone: '+375291234567', email: 'i@x.by', itemKey: itemKey(items[1]) },
      items,
    )
    expect(payload.item).toEqual(items[1])
    expect(payload).not.toHaveProperty('itemKey')
  })
  it('omits item when key is empty or unknown', () => {
    expect(toPayload({ name: 'Иван', phone: '+375291234567', email: 'i@x.by', itemKey: '' }, items).item).toBeUndefined()
    expect(toPayload({ name: 'Иван', phone: '+375291234567', email: 'i@x.by', itemKey: 'x:y' }, items).item).toBeUndefined()
  })
})
