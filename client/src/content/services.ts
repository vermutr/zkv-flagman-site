import raw from './services.json'
import { parseServices } from './schema'
import type { Service } from './types'

/**
 * Услуги редактируются в services.json. Цены там ориентировочные: на zkvflagman.by
 * они не указаны, поменяйте priceFrom и unit на реальные.
 */
export const services: Service[] = parseServices(raw)

export const serviceCategories: readonly string[] = [...new Set(services.map((s) => s.category))]
