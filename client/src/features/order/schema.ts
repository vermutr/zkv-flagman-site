import { z } from 'zod'
import type { OrderItem } from '../../content/types'

export const orderFormSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя').max(100, 'Слишком длинное имя'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{9,20}$/, 'Введите корректный телефон'),
  email: z.email('Введите корректный email').max(200, 'Слишком длинный email'),
  company: z.string().trim().max(200, 'Слишком длинное название').optional(),
  message: z.string().trim().max(2000, 'Не больше 2000 символов').optional(),
  itemKey: z.string().optional(),
  website: z.string().max(0).optional(),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>

export type OrderPayload = Omit<OrderFormValues, 'itemKey'> & { item?: OrderItem }

export function itemKey(item: OrderItem): string {
  return `${item.kind}:${item.slug}`
}

export function toPayload(values: OrderFormValues, items: OrderItem[]): OrderPayload {
  const { itemKey: key, ...rest } = values
  const item = key ? items.find((i) => itemKey(i) === key) : undefined
  return item ? { ...rest, item } : rest
}
