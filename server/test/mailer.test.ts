import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMailer } from '../src/order/mailer'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createMailer without SMTP settings', () => {
  it('warns once and logs messages to the console instead of sending', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    const mailer = createMailer({})
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('SMTP_HOST')

    await expect(
      mailer.send({ to: 'ivan@example.com', subject: 'Тема', text: 'Текст письма' }),
    ).resolves.toBeUndefined()

    expect(log).toHaveBeenCalledTimes(1)
    const printed = String(log.mock.calls[0][0])
    expect(printed).toContain('ivan@example.com')
    expect(printed).toContain('Тема')
    expect(printed).toContain('Текст письма')
  })
})
