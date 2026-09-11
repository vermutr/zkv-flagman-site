// Точка входа для Vercel: то же Express-приложение, но без раздачи статики —
// её отдаёт сам Vercel из client/dist (см. vercel.json).
import { createApp } from '../server/src/app'
import { createMailer } from '../server/src/order/mailer'

export function createVercelApp(env: NodeJS.ProcessEnv) {
  return createApp({
    mailer: createMailer(env),
    orderTo: env.ORDER_TO || '',
  })
}

export default createVercelApp(process.env)
