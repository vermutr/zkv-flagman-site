import nodemailer from 'nodemailer'

export type MailMessage = { to: string; subject: string; text: string; replyTo?: string }

export type Mailer = { send(msg: MailMessage): Promise<void> }

export function createMailer(env: NodeJS.ProcessEnv): Mailer {
  const from = env.MAIL_FROM || 'site@localhost'

  if (!env.SMTP_HOST) {
    console.warn('[mailer] SMTP_HOST не задан — письма печатаются в консоль')
    return {
      async send(msg) {
        console.log(`[mailer] → ${msg.to}\nSubject: ${msg.subject}\n\n${msg.text}\n`)
      },
    }
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 465),
    secure: (env.SMTP_SECURE ?? 'true') !== 'false',
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  })

  return {
    async send(msg) {
      await transport.sendMail({ from, ...msg })
    },
  }
}
