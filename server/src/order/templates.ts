import { orderItems, type Order, type OrderItem } from './schema'
import type { MailMessage } from './mailer'

const KIND_LABEL = { package: 'пакет', service: 'услуга' } as const

function itemLine(item: OrderItem): string {
  return `${item.name} (${KIND_LABEL[item.kind]})`
}

function positions(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} позиция`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} позиции`
  return `${n} позиций`
}

export function ownerMessage(order: Order, to: string): MailMessage {
  const items = orderItems(order)
  const subject =
    items.length === 0
      ? 'Обращение с сайта'
      : items.length === 1
        ? `Заявка с сайта: ${itemLine(items[0])}`
        : `Заявка с сайта: ${positions(items.length)}`
  const itemBlock = items.length === 0 ? ['Услуга: не указана'] : ['Услуги:', ...items.map((i) => `- ${itemLine(i)}`)]
  const text = [
    'Новая заявка с сайта',
    '',
    ...itemBlock,
    `Имя: ${order.name}`,
    `Телефон: ${order.phone}`,
    `Email: ${order.email}`,
    `Компания: ${order.company || '—'}`,
    '',
    'Комментарий:',
    order.message || '—',
  ].join('\n')
  return { to, subject, text }
}

// Клиентское письмо не повторяет введённый пользователем текст: названия услуг
// ограничены схемой (без переводов строк и угловых скобок), остальное — наш текст.
export function clientMessage(order: Order): MailMessage {
  const items = orderItems(order)
  const itemBlock =
    items.length === 0 ? [] : items.length === 1 ? [`Услуга: ${items[0].name}`] : ['Выбранные услуги:', ...items.map((i) => `- ${i.name}`)]
  const text = [
    'Здравствуйте!',
    '',
    'Ваша заявка получена. Мы свяжемся с вами в рабочее время (Пн–Пт 9:00–18:00).',
    ...itemBlock,
    '',
    'С уважением,',
    'команда ЗКВ ФЛАГМАН',
  ].join('\n')
  return { to: order.email, subject: 'Мы получили вашу заявку — ЗКВ ФЛАГМАН', text }
}
