import { describe, expect, it } from 'vitest'
import { packages } from './packages'
import { services, serviceCategories } from './services'
import { team } from './team'
import { allOrderItems } from './orderItems'
import servicesJson from './services.json'
import packagesJson from './packages.json'
import { parsePackages, parseServices } from './schema'

const unique = (xs: string[]) => new Set(xs).size === xs.length

describe('content integrity', () => {
  it('exposes exactly the validated content of services.json and packages.json', () => {
    expect(services).toEqual(parseServices(servicesJson))
    expect(packages).toEqual(parsePackages(packagesJson))
  })
  it('has unique slugs', () => {
    expect(unique(packages.map((p) => p.slug))).toBe(true)
    expect(unique(services.map((s) => s.slug))).toBe(true)
    expect(unique(team.map((t) => t.slug))).toBe(true)
  })
  it('has exactly one popular package', () => {
    expect(packages.filter((p) => p.popular)).toHaveLength(1)
  })
  it('uses only known service categories', () => {
    for (const s of services) expect(serviceCategories).toContain(s.category)
  })
  it('describes every service with a short card text and full details', () => {
    expect(services).toHaveLength(10)
    for (const s of services) {
      expect(s.description.length).toBeLessThanOrEqual(160)
      expect(s.details.length).toBeGreaterThan(0)
    }
  })
  it('builds order items from packages then services', () => {
    const items = allOrderItems()
    expect(items).toHaveLength(packages.length + services.length)
    expect(items[0]).toEqual({ kind: 'package', slug: packages[0].slug, name: packages[0].name })
    expect(items.at(-1)).toEqual({ kind: 'service', slug: services.at(-1)!.slug, name: services.at(-1)!.name })
  })
})
