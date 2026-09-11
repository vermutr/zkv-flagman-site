import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { rateLimit } from 'express-rate-limit'
import { orderSchema } from './order/schema'
import type { Mailer } from './order/mailer'
import { clientMessage, ownerMessage } from './order/templates'

export type AppOptions = {
  mailer: Mailer
  orderTo: string
  staticDir?: string
  rateLimit?: boolean
}

export function createApp(opts: AppOptions): express.Express {
  const app = express()
  app.set('trust proxy', 1)
  app.use(express.json({ limit: '32kb' }))

  const api = express.Router()

  api.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  const orderLimiter =
    opts.rateLimit === false
      ? (_req: express.Request, _res: express.Response, next: express.NextFunction) => next()
      : rateLimit({
          windowMs: 10 * 60 * 1000,
          limit: 5,
          standardHeaders: 'draft-8',
          legacyHeaders: false,
          message: { ok: false, error: 'Слишком много заявок, попробуйте позже' },
        })

  api.post('/order', orderLimiter, async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    if (typeof body.website === 'string' && body.website.length > 0) {
      res.json({ ok: true })
      return
    }
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || 'form'
        if (!errors[key]) errors[key] = issue.message
      }
      res.status(400).json({ ok: false, errors })
      return
    }
    const order = parsed.data
    try {
      // Оба письма уходят одновременно: на serverless каждое — отдельное SMTP-соединение.
      await Promise.all([opts.mailer.send(ownerMessage(order, opts.orderTo)), opts.mailer.send(clientMessage(order))])
      res.json({ ok: true })
    } catch (err) {
      console.error('[order] mail error', err)
      res.status(502).json({ ok: false, error: 'Не удалось отправить письмо' })
    }
  })

  api.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Not found' })
  })

  app.use('/api', api)

  if (opts.staticDir && fs.existsSync(opts.staticDir)) {
    const indexHtml = path.join(opts.staticDir, 'index.html')
    app.use(express.static(opts.staticDir, { maxAge: '1h', index: false }))
    app.use((_req, res) => {
      res.sendFile(indexHtml)
    })
  }

  return app
}
