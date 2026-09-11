import { z } from 'zod'
import type { OrderItem } from '../../content/types'

/** Свободный текст, который уходит в письмо: без переводов строк и угловых скобок. */
const SAFE_TEXT = /^[^\r\n\t<>]+$/
const SAFE_TEXT_MESSAGE = 'Уберите символы < > и переносы строк'

/** Те же правила, что и в server/src/order/schema.ts. */
export const orderItemSchema = z.object({
  kind: z.enum(['package', 'service']),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, SAFE_TEXT_MESSAGE)
    .max(64),
  name: z.string().min(1).max(120).regex(SAFE_TEXT, SAFE_TEXT_MESSAGE),
})

export const orderFormSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя').max(100, 'Слишком длинное имя').regex(SAFE_TEXT, SAFE_TEXT_MESSAGE),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{9,20}$/, 'Введите корректный телефон'),
  email: z.email('Введите корректный email').max(200, 'Слишком длинный email'),
  company: z
    .string()
    .trim()
    .max(200, 'Слишком длинное название')
    .refine((v) => v === '' || SAFE_TEXT.test(v), SAFE_TEXT_MESSAGE)
    .optional(),
  message: z.string().trim().max(2000, 'Не больше 2000 символов').optional(),
  /** Ключи выбранных позиций, см. itemKey(). */
  itemKeys: z.array(z.string()).max(20, 'Не больше 20 позиций').optional(),
  // Ловушка для ботов: проверяет её сервер, автозаполнение браузера не должно ломать отправку.
  website: z.string().optional(),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>

export type OrderPayload = Omit<OrderFormValues, 'itemKeys'> & { items?: OrderItem[] }

export function itemKey(item: OrderItem): string {
  return `${item.kind}:${item.slug}`
}

/** Выбранные позиции в порядке каталога; неизвестные ключи отбрасываются. */
export function toPayload(values: OrderFormValues, items: OrderItem[]): OrderPayload {
  const { itemKeys, ...rest } = values
  const chosen = new Set(itemKeys ?? [])
  const selected = items.filter((i) => chosen.has(itemKey(i)))
  return selected.length > 0 ? { ...rest, items: selected } : rest
}
