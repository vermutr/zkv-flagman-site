import type { Service } from './types'

export const serviceCategories: readonly string[] = ['Учёт', 'Отчётность', 'Кадры', 'Консультации']

export const services: Service[] = [
  {
    slug: 'primary-docs',
    name: 'Обработка первичных документов',
    description: 'Проверка, ввод и хранение накладных, актов и счетов.',
    priceFrom: 3,
    unit: 'за документ',
    category: 'Учёт',
  },
  {
    slug: 'restore-accounting',
    name: 'Восстановление учёта',
    description: 'Приводим в порядок запущенный учёт за любой период.',
    priceFrom: 600,
    unit: 'за период',
    category: 'Учёт',
  },
  {
    slug: 'bank-reconciliation',
    name: 'Сверка с банком и контрагентами',
    description: 'Акты сверки, контроль дебиторки и кредиторки.',
    priceFrom: 80,
    unit: 'в месяц',
    category: 'Учёт',
  },
  {
    slug: 'tax-declaration',
    name: 'Налоговая декларация',
    description: 'Подготовка и сдача декларации по УСН, НДС, налогу на прибыль.',
    priceFrom: 90,
    unit: 'за декларацию',
    category: 'Отчётность',
  },
  {
    slug: 'annual-report',
    name: 'Годовая отчётность',
    description: 'Баланс, отчёт о прибылях и убытках, пояснительная записка.',
    priceFrom: 350,
    category: 'Отчётность',
  },
  {
    slug: 'fszn-report',
    name: 'Отчётность в ФСЗН и Белгосстрах',
    description: 'ПУ-3, 4-фонд и отчёты по страховым взносам.',
    priceFrom: 60,
    unit: 'за отчёт',
    category: 'Отчётность',
  },
  {
    slug: 'payroll',
    name: 'Расчёт заработной платы',
    description: 'Начисления, удержания, больничные, отпускные, расчётные листки.',
    priceFrom: 15,
    unit: 'за сотрудника в месяц',
    category: 'Кадры',
  },
  {
    slug: 'hr-docs',
    name: 'Кадровое делопроизводство',
    description: 'Приём, увольнение, приказы, трудовые договоры, график отпусков.',
    priceFrom: 120,
    unit: 'в месяц',
    category: 'Кадры',
  },
  {
    slug: 'consultation',
    name: 'Консультация бухгалтера',
    description: 'Ответы на вопросы по налогам, учёту и выбору системы налогообложения.',
    priceFrom: 70,
    unit: 'за час',
    category: 'Консультации',
  },
  {
    slug: 'business-registration',
    name: 'Регистрация ИП или ООО',
    description: 'Подготовка документов, выбор налогового режима, постановка на учёт.',
    priceFrom: 250,
    category: 'Консультации',
  },
]
