import { z } from 'zod'

/** Свободный текст, который попадёт в исходящее письмо: без переводов строк и угловых скобок. */
const SAFE_TEXT = /^[^\r\n\t<>]+$/
const SAFE_TEXT_MESSAGE = 'Недопустимые символы'

export const orderItemSchema = z.object({
  kind: z.enum(['package', 'service']),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, SAFE_TEXT_MESSAGE)
    .max(64),
  name: z.string().min(1).max(120).regex(SAFE_TEXT, SAFE_TEXT_MESSAGE),
})

export type OrderItem = z.infer<typeof orderItemSchema>

export const orderSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя').max(100).regex(SAFE_TEXT, SAFE_TEXT_MESSAGE),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{9,20}$/, 'Введите корректный телефон'),
  email: z.email('Введите корректный email').max(200),
  company: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === '' || SAFE_TEXT.test(v), SAFE_TEXT_MESSAGE)
    .optional(),
  message: z.string().trim().max(2000).optional(),
  /** Одна позиция — старый формат формы, оставлен для совместимости. */
  item: orderItemSchema.optional(),
  /** Несколько позиций — текущий формат формы. */
  items: z.array(orderItemSchema).max(20, 'Не больше 20 позиций').optional(),
  website: z.string().max(0).optional(),
})

export type Order = z.infer<typeof orderSchema>

/** Все выбранные позиции заявки независимо от формата. */
export function orderItems(order: Order): OrderItem[] {
  if (order.items && order.items.length > 0) return order.items
  return order.item ? [order.item] : []
}
