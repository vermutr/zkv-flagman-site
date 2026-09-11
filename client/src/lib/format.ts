const NARROW_NBSP = '\u202f'
const NBSP = '\u00a0'

export function formatPrice(amount: number): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NBSP)
  return `${grouped}${NBSP}BYN`
}
