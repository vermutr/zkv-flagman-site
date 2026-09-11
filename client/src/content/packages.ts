import raw from './packages.json'
import { parsePackages } from './schema'
import type { Package } from './types'

/** Тарифы редактируются в packages.json. Цены — «от», BYN в месяц. */
export const packages: Package[] = parsePackages(raw)
