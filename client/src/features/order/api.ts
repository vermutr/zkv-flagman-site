import type { OrderPayload } from './schema'

export class OrderError extends Error {
  fieldErrors: Record<string, string>

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'OrderError'
    this.fieldErrors = fieldErrors
  }
}

const FALLBACK = 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.'

export async function submitOrder(payload: OrderPayload): Promise<void> {
  const res = await fetch('/api/order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (res.ok) return
  let data: { error?: string; errors?: Record<string, string> } = {}
  try {
    data = await res.json()
  } catch {
    // non-JSON error body
  }
  throw new OrderError(data.error ?? FALLBACK, data.errors)
}
