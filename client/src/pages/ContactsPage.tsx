import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Container } from '../components/Container'
import { SectionHeading } from '../components/SectionHeading'
import { company } from '../content/company'
import { allOrderItems } from '../content/orderItems'
import { OrderForm } from '../features/order/OrderForm'

// Виджет Яндекс Карт без ключа: метка на офисе, ленивая загрузка. Ссылка ниже открывает маршрут.
const point = `${company.mapLon},${company.mapLat}`
const mapEmbedSrc = `https://yandex.by/map-widget/v1/?ll=${point}&z=16&pt=${point},pm2dbm&lang=ru_BY`
const routeHref = `https://yandex.by/maps/?rtext=~${company.mapLat},${company.mapLon}&rtt=auto`

export default function ContactsPage() {
  const rows = [
    {
      icon: Phone,
      label: 'Телефон',
      value: (
        <>
          <a href={company.phoneHref} className="transition-colors duration-200 hover:text-gold-700">{company.phone}</a>
          <br />
          <a href={company.phone2Href} className="transition-colors duration-200 hover:text-gold-700">{company.phone2}</a>
        </>
      ),
    },
    { icon: Mail, label: 'Почта', value: <a href={`mailto:${company.email}`} className="transition-colors duration-200 hover:text-gold-700">{company.email}</a> },
    {
      icon: MapPin,
      label: 'Адрес',
      value: (
        <>
          {company.address}
          <span className="mt-1 block text-sm font-normal text-stone-600">{company.directions}</span>
        </>
      ),
    },
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
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-800">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</p>
                  <p className="mt-0.5 font-medium text-brand-900">{value}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-stone-200/80">
            <iframe
              title="Карта: офис на карте"
              src={mapEmbedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-80 w-full border-0"
            />
            <a
              href={routeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 border-t border-stone-200 px-5 py-3 text-sm font-semibold text-brand-700 transition-colors duration-200 hover:bg-gold-50 hover:text-brand-900"
            >
              <MapPin size={16} aria-hidden="true" /> Построить маршрут
            </a>
          </div>
          <p className="text-xs text-stone-500">{company.legal}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200/80 sm:p-8">
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
