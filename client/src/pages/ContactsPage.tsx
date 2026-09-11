import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Container } from '../components/Container'
import { SectionHeading } from '../components/SectionHeading'
import { company } from '../content/company'
import { allOrderItems } from '../content/orderItems'
import { OrderForm } from '../features/order/OrderForm'

export default function ContactsPage() {
  const rows = [
    { icon: Phone, label: 'Телефон', value: <a href={company.phoneHref} className="hover:text-brand-600">{company.phone}</a> },
    { icon: Mail, label: 'Почта', value: <a href={`mailto:${company.email}`} className="hover:text-brand-600">{company.email}</a> },
    { icon: MapPin, label: 'Адрес', value: company.address },
    { icon: Clock, label: 'Часы работы', value: company.hours },
  ]

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading eyebrow="Контакты" title="Свяжитесь с нами" subtitle="Позвоните, напишите или оставьте заявку — ответим в течение рабочего дня." />
      <div className="mt-12 grid gap-10 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-6">
          <ul className="space-y-5">
            {rows.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
                  <p className="mt-0.5 font-medium text-brand-900">{value}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="grid h-56 place-items-center rounded-3xl bg-brand-50 text-sm text-brand-600 ring-1 ring-brand-100">
            Здесь будет карта проезда
          </div>
          <p className="text-xs text-stone-500">{company.legal}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200 sm:p-8">
          <h2 className="text-2xl font-bold text-brand-900">Напишите нам</h2>
          <p className="mt-2 text-sm text-stone-600">Опишите задачу, и мы предложим подходящий формат обслуживания.</p>
          <div className="mt-6">
            <OrderForm items={allOrderItems()} />
          </div>
        </div>
      </div>
    </Container>
  )
}
