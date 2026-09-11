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

// Клиентское письмо не повторяет введённый пользователем текст: название услуги
// ограничено схемой (без переводов строк и угловых скобок), остальное — наш текст.
export function clientMessage(order: Order): MailMessage {
  const text = [
    'Здравствуйте!',
    '',
    'Ваша заявка получена. Мы свяжемся с вами в рабочее время (Пн–Пт 9:00–18:00).',
    ...(order.item ? [`Услуга: ${order.item.name}`] : []),
    '',
    'С уважением,',
    'команда Баланс Про',
  ].join('\n')
  return { to: order.email, subject: 'Мы получили вашу заявку — Баланс Про', text }
}
