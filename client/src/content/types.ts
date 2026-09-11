export type Package = {
  slug: string
  name: string
  audience: string
  pricePerMonth: number
  features: string[]
  popular?: boolean
}

export type Service = {
  slug: string
  name: string
  description: string
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
