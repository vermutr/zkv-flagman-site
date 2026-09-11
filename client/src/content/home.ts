import { Cloud, FileCheck2, ShieldCheck, UserCheck, type LucideIcon } from 'lucide-react'
import { company } from './company'

export type Advantage = { icon: LucideIcon; title: string; text: string }

/** Блок «Почему мы» на главной. */
export const advantages: Advantage[] = [
  { icon: ShieldCheck, title: 'Несём финансовую ответственность', text: 'Отвечаем за результат работы: ошибки по нашей вине исправляем и оплачиваем сами.' },
  { icon: FileCheck2, title: 'Отчётность строго в срок', text: 'Декларации, ФСЗН, Белгосстрах и статистика уходят электронно и вовремя.' },
  { icon: UserCheck, title: 'Персональный бухгалтер', text: 'За каждым клиентом закреплён специалист, который знает специфику вашего бизнеса.' },
  { icon: Cloud, title: 'Личный кабинет', text: 'Облачный учёт: состояние бухгалтерии и нужные отчёты доступны в любой момент.' },
]

/** Подзаголовок первого экрана. */
export const heroSubtitle =
  'Ведём учёт, считаем налоги и зарплату, сдаём отчётность для ИП и организаций в Гродно с 2012 года. Вы занимаетесь бизнесом, мы — цифрами.'

/** Цифры первого экрана. Стаж считается от `foundedYear` в company.ts. */
export function heroStats(): { value: string; label: string }[] {
  const years = new Date().getFullYear() - company.foundedYear
  return [
    { value: `${years}+`, label: 'лет на рынке' },
    { value: '200+', label: 'компаний, которым восстановили учёт' },
    { value: 'до 60%', label: 'экономии по сравнению со штатным бухгалтером' },
  ]
}

/** Финальный блок с призывом оставить заявку. */
export const ctaTitle = 'Не знаете, какой тариф подходит?'
export const ctaText =
  'Оставьте заявку на бесплатный расчёт стоимости: бухгалтер перезвонит в течение рабочего дня и подберёт формат под ваш бизнес.'
