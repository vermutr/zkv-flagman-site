import path from 'node:path'
import dotenv from 'dotenv'
import { createApp } from './app'
import { createMailer } from './order/mailer'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const port = Number(process.env.PORT || 3001)
const orderTo = process.env.ORDER_TO || ''
if (!orderTo) console.warn('[server] ORDER_TO не задан — заявки некуда отправлять')
if (!process.env.MAIL_FROM) console.warn('[server] MAIL_FROM не задан — hoster.by отклоняет письма с чужим отправителем')

const app = createApp({
  mailer: createMailer(process.env),
  orderTo,
  staticDir: path.resolve(__dirname, '../../client/dist'),
})

app.listen(port, () => {
  console.log(`[server] http://localhost:${port}`)
})
