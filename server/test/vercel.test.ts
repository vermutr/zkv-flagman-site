import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createVercelApp } from '../../api/index'

describe('Vercel entry point', () => {
  it('serves the API without static files and without SMTP configured', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const app = createVercelApp({})
    const health = await request(app).get('/api/health')
    expect(health.body).toEqual({ ok: true })
    const root = await request(app).get('/')
    expect(root.status).toBe(404)
    warn.mockRestore()
  })
})
