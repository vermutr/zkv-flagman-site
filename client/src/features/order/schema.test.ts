import { describe, expect, it } from 'vitest'
import { itemKey, orderFormSchema, orderItemSchema, toPayload } from './schema'

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

describe('orderItemSchema', () => {
  it('mirrors the server rules for slug and item name', () => {
    expect(orderItemSchema.safeParse(items[0]).success).toBe(true)
    expect(orderItemSchema.safeParse({ ...items[0], slug: 'Bad Slug!' }).success).toBe(false)
    expect(orderItemSchema.safeParse({ ...items[0], name: 'Пакет\n<b>' }).success).toBe(false)
  })
})

describe('free-text rules', () => {
  const base = { name: 'Иван', phone: '+375 29 123-45-67', email: 'ivan@example.com' }
  it('rejects control characters in name and company', () => {
    expect(orderFormSchema.safeParse({ ...base, name: 'Иван\nBcc: spam@x.by' }).success).toBe(false)
    expect(orderFormSchema.safeParse({ ...base, company: 'ООО\r\nX' }).success).toBe(false)
    expect(orderFormSchema.safeParse({ ...base, company: '' }).success).toBe(true)
  })
  it('does not block the submit when a browser autofills the honeypot', () => {
    expect(orderFormSchema.safeParse({ ...base, website: 'https://autofill.example' }).success).toBe(true)
  })
})
