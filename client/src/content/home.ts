import { Clock, FileCheck2, MessageCircle, ShieldCheck, type LucideIcon } from 'lucide-react'
import { company } from './company'

export type Advantage = { icon: LucideIcon; title: string; text: string }

/** Блок «Почему мы» на главной. */
export const advantages: Advantage[] = [
  { icon: ShieldCheck, title: 'Отвечаем за результат', text: 'Штрафы по нашей вине оплачиваем сами. Это прописано в договоре.' },
  { icon: Clock, title: 'Отчёты всегда вовремя', text: 'Календарь сдачи под контролем: напоминаем заранее и сдаём без просрочек.' },
  { icon: MessageCircle, title: 'Бухгалтер на связи', text: 'Отвечаем в мессенджерах в течение рабочего дня, а не раз в квартал.' },
  { icon: FileCheck2, title: 'Порядок в документах', text: 'Электронный архив и ЭДО: нужный документ находится за минуту.' },
]

/** Подзаголовок первого экрана. */
export const heroSubtitle =
  'Берём на себя учёт, налоги, зарплату и отчётность для ИП и компаний. Вы занимаетесь бизнесом, мы — цифрами.'

/** Цифры первого экрана. Стаж считается от `foundedYear` в company.ts. */
export function heroStats(): { value: string; label: string }[] {
  const years = new Date().getFullYear() - company.foundedYear
  return [
    { value: `${years}+`, label: 'лет на рынке' },
    { value: '320+', label: 'клиентов на обслуживании' },
    { value: '0', label: 'просроченных отчётов за год' },
  ]
}

/** Финальный блок с призывом оставить заявку. */
export const ctaTitle = 'Не знаете, какой пакет подходит?'
export const ctaText =
  'Оставьте заявку, и бухгалтер перезвонит в течение рабочего дня, чтобы подобрать формат под ваш бизнес.'
