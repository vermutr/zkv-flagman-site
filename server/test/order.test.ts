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
