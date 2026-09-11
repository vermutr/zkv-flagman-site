import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'
import type { Mailer } from '../src/order/mailer'

const valid = {
  name: 'Иван',
  phone: '+375 29 123-45-67',
  email: 'ivan@example.com',
  item: { kind: 'package', slug: 'small', name: 'Малый бизнес' },
}

let send: ReturnType<typeof vi.fn>
let mailer: Mailer

beforeEach(() => {
  send = vi.fn().mockResolvedValue(undefined)
  mailer = { send }
})

const app = () => createApp({ mailer, orderTo: 'owner@x.by', rateLimit: false })

describe('POST /api/order', () => {
  it('sends owner and client emails for a valid order', async () => {
    const res = await request(app()).post('/api/order').send(valid)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
    expect(send).toHaveBeenCalledTimes(2)
    expect(send.mock.calls[0][0].to).toBe('owner@x.by')
    expect(send.mock.calls[1][0].to).toBe('ivan@example.com')
  })

  it('accepts a list of items and passes them to the emails', async () => {
    const items = [
      { kind: 'package', slug: 'ip', name: 'ИП' },
      { kind: 'service', slug: 'reviziya', name: 'Ревизия учёта' },
    ]
    const { item: _item, ...rest } = valid
    const res = await request(app()).post('/api/order').send({ ...rest, items })
    expect(res.status).toBe(200)
    expect(send.mock.calls[0][0].text).toContain('Ревизия учёта')
    expect(send.mock.calls[1][0].text).toContain('ИП')
  })

  it('rejects more than 20 items', async () => {
    const items = Array.from({ length: 21 }, (_, i) => ({ kind: 'service', slug: `s-${i}`, name: `Услуга ${i}` }))
    const res = await request(app()).post('/api/order').send({ ...valid, items })
    expect(res.status).toBe(400)
    expect(res.body.errors).toHaveProperty('items')
  })

  it('sends both emails at the same time instead of one after another', async () => {
    const resolvers: Array<() => void> = []
    send.mockImplementation(() => new Promise<void>((resolve) => resolvers.push(resolve)))
    // supertest стартует запрос только при await/then, поэтому оборачиваем в Promise
    const pending = Promise.resolve(request(app()).post('/api/order').send(valid))
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2))
    resolvers.forEach((resolve) => resolve())
    const res = await pending
    expect(res.status).toBe(200)
  })

  it('returns 400 with field errors for an invalid order', async () => {
    const res = await request(app()).post('/api/order').send({ ...valid, email: 'bad' })
    expect(res.status).toBe(400)
    expect(res.body.ok).toBe(false)
    expect(res.body.errors).toHaveProperty('email')
    expect(send).not.toHaveBeenCalled()
  })

  it('silently accepts honeypot submissions', async () => {
    const res = await request(app()).post('/api/order').send({ ...valid, website: 'http://spam' })
    expect(res.status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })

  it('returns 502 when the mailer fails', async () => {
    send.mockRejectedValueOnce(new Error('smtp down'))
    const res = await request(app()).post('/api/order').send(valid)
    expect(res.status).toBe(502)
    expect(res.body.ok).toBe(false)
  })

  it('rate limits after 5 requests when enabled', async () => {
    const limited = createApp({ mailer, orderTo: 'o@x.by', rateLimit: true })
    for (let i = 0; i < 5; i++) await request(limited).post('/api/order').send(valid)
    const res = await request(limited).post('/api/order').send(valid)
    expect(res.status).toBe(429)
  })
})

describe('GET /api/health', () => {
  it('responds ok', async () => {
    const res = await request(app()).get('/api/health')
    expect(res.body).toEqual({ ok: true })
  })
  it('returns JSON 404 for unknown api routes', async () => {
    const res = await request(app()).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ ok: false, error: 'Not found' })
  })
})
