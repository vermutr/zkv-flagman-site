import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'

const html = '<!doctype html><title>Баланс Про</title><div id="root"></div>'
let staticDir: string

beforeAll(() => {
  staticDir = fs.mkdtempSync(path.join(os.tmpdir(), 'balans-static-'))
  fs.writeFileSync(path.join(staticDir, 'index.html'), html)
})

afterAll(() => {
  fs.rmSync(staticDir, { recursive: true, force: true })
})

const app = () =>
  createApp({ mailer: { send: vi.fn().mockResolvedValue(undefined) }, orderTo: 'owner@x.by', staticDir, rateLimit: false })

describe('static SPA serving', () => {
  it('serves index.html at the root', async () => {
    const res = await request(app()).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toBe(html)
  })

  it('serves index.html for client routes', async () => {
    const res = await request(app()).get('/services')
    expect(res.status).toBe(200)
    expect(res.text).toBe(html)
  })

  it('still returns the JSON 404 for unknown api routes', async () => {
    const res = await request(app()).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ ok: false, error: 'Not found' })
  })
})
