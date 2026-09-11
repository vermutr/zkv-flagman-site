import { packages } from './packages'
import { services } from './services'
import type { OrderItem } from './types'

export function allOrderItems(): OrderItem[] {
  return [
    ...packages.map((p) => ({ kind: 'package' as const, slug: p.slug, name: p.name })),
    ...services.map((s) => ({ kind: 'service' as const, slug: s.slug, name: s.name })),
  ]
}
