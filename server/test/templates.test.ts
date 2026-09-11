import { describe, expect, it } from 'vitest'
import { clientMessage, ownerMessage } from '../src/order/templates'
import type { Order } from '../src/order/schema'

const order: Order = {
  name: 'Иван',
  phone: '+375 29 123-45-67',
  email: 'ivan@example.com',
  company: 'ООО Ромашка',
  message: 'Хочу пакет',
  item: { kind: 'package', slug: 'small', name: 'Малый бизнес' },
}

describe('ownerMessage', () => {
  it('addresses the owner and lists every field', () => {
    const m = ownerMessage(order, 'owner@x.by')
    expect(m.to).toBe('owner@x.by')
    expect(m.subject).toBe('Заявка с сайта: Малый бизнес (пакет)')
    for (const s of ['Иван', '+375 29 123-45-67', 'ivan@example.com', 'ООО Ромашка', 'Хочу пакет']) {
      expect(m.text).toContain(s)
    }
  })
  it('uses a generic subject without an item', () => {
    const { item: _i, ...rest } = order
    expect(ownerMessage(rest, 'o@x.by').subject).toBe('Обращение с сайта')
  })
})

describe('clientMessage', () => {
  it('confirms to the client', () => {
    const m = clientMessage(order)
    expect(m.to).toBe('ivan@example.com')
    expect(m.subject).toBe('Мы получили вашу заявку — Баланс Про')
    expect(m.text).toContain('Здравствуйте!')
    expect(m.text).toContain('Малый бизнес')
    expect(m.text).not.toContain(order.name)
  })
})
