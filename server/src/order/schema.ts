import { z } from 'zod'

export const orderItemSchema = z.object({
  kind: z.enum(['package', 'service']),
  slug: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
})

export const orderSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{9,20}$/, 'Введите корректный телефон'),
  email: z.email('Введите корректный email').max(200),
  company: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
  item: orderItemSchema.optional(),
  website: z.string().max(0).optional(),
})

export type Order = z.infer<typeof orderSchema>
