import { z } from 'zod'
import type { Package, Service } from './types.ts'

/**
 * Схемы для services.json и packages.json. Проверяются при сборке (vite.config.ts)
 * и при загрузке в браузере, так что опечатка в JSON ломает сборку, а не сайт.
 */

const slug = z.string().regex(/^[a-z0-9-]+$/, 'slug: только латиница, цифры и дефис')
const text = z.string().trim().min(1)
const lines = z.array(text)

export const serviceSchema = z.object({
  slug,
  name: text,
  description: text,
  details: lines.min(1),
  includes: lines.optional(),
  benefits: lines.optional(),
  priceFrom: z.number().nonnegative(),
  unit: text.optional(),
  category: text,
})

export const packageSchema = z.object({
  slug,
  name: text,
  audience: text,
  pricePerMonth: z.number().nonnegative(),
  features: lines.min(1),
  popular: z.boolean().optional(),
})

function assertUniqueSlugs(items: { slug: string }[], what: string) {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.slug)) throw new Error(`${what}: slug «${item.slug}» встречается дважды`)
    seen.add(item.slug)
  }
}

function describeIssues(what: string, error: z.ZodError): string {
  const lines = error.issues.map((i) => `  ${what}[${i.path.join('.')}]: ${i.message}`)
  return `Ошибка в ${what}.json:\n${lines.join('\n')}`
}

export function parseServices(raw: unknown): Service[] {
  const result = z.array(serviceSchema).safeParse(raw)
  if (!result.success) throw new Error(describeIssues('services', result.error))
  assertUniqueSlugs(result.data, 'services')
  return result.data
}

export function parsePackages(raw: unknown): Package[] {
  const result = z.array(packageSchema).safeParse(raw)
  if (!result.success) throw new Error(describeIssues('packages', result.error))
  assertUniqueSlugs(result.data, 'packages')
  return result.data
}
