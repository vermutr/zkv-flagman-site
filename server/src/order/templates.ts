import type { Order } from './schema'
import type { MailMessage } from './mailer'

const KIND_LABEL = { package: 'пакет', service: 'услуга' } as const

function itemLine(order: Order): string {
  return order.item ? `${order.item.name} (${KIND_LABEL[order.item.kind]})` : 'не указана'
}

export function ownerMessage(order: Order, to: string): MailMessage {
  const subject = order.item ? `Заявка с сайта: ${itemLine(order)}` : 'Обращение с сайта'
  const text = [
    'Новая заявка с сайта',
    '',
    `Услуга: ${itemLine(order)}`,
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

export function clientMessage(order: Order): MailMessage {
  const text = [
    `Здравствуйте, ${order.name}!`,
    '',
    'Мы получили вашу заявку и свяжемся с вами в рабочее время (Пн–Пт 9:00–18:00).',
    `Услуга: ${itemLine(order)}`,
    '',
    'С уважением,',
    'команда Баланс Про',
  ].join('\n')
  return { to: order.email, subject: 'Мы получили вашу заявку — Баланс Про', text }
}
