export type Package = {
  slug: string
  name: string
  audience: string
  /** Цена «от», BYN в месяц. */
  pricePerMonth: number
  features: string[]
  popular?: boolean
}

export type Service = {
  slug: string
  name: string
  /** Короткий текст для карточки, одно-два предложения. */
  description: string
  /** Полное описание для окна «Подробнее», по абзацам. */
  details: string[]
  /** Что входит в услугу. */
  includes?: string[]
  /** Преимущества, показываются в окне отдельным списком. */
  benefits?: string[]
  priceFrom: number
  unit?: string
  category: string
}

export type TeamMember = {
  slug: string
  name: string
  role: string
  experienceYears: number
  specialties: string[]
  bio: string
  photo?: string
}

export type OrderItem = {
  kind: 'package' | 'service'
  slug: string
  name: string
}
