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

describe('several items', () => {
  const items = [
    { kind: 'package' as const, slug: 'ip', name: 'ИП' },
    { kind: 'service' as const, slug: 'reviziya', name: 'Ревизия учёта' },
  ]
  const multi: Order = { ...order, item: undefined, items }

  it('lists every chosen item for the owner and counts them in the subject', () => {
    const m = ownerMessage(multi, 'o@x.by')
    expect(m.subject).toBe('Заявка с сайта: 2 позиции')
    expect(m.text).toContain('- ИП (пакет)')
    expect(m.text).toContain('- Ревизия учёта (услуга)')
  })
  it('lists every chosen item for the client', () => {
    const m = clientMessage(multi)
    expect(m.text).toContain('- ИП')
    expect(m.text).toContain('- Ревизия учёта')
  })
  it('uses the single-item subject when items has one entry', () => {
    expect(ownerMessage({ ...multi, items: [items[1]] }, 'o@x.by').subject).toBe('Заявка с сайта: Ревизия учёта (услуга)')
  })
})

describe('clientMessage', () => {
  it('confirms to the client', () => {
    const m = clientMessage(order)
    expect(m.to).toBe('ivan@example.com')
    expect(m.subject).toBe('Мы получили вашу заявку — ЗКВ ФЛАГМАН')
    expect(m.text).toContain('Здравствуйте!')
    expect(m.text).toContain('Малый бизнес')
    expect(m.text).not.toContain(order.name)
  })
})
