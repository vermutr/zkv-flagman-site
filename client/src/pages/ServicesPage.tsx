import { useSearchParams } from 'react-router'
import { Container } from '../components/Container'
import { SectionHeading } from '../components/SectionHeading'
import { PackageCard } from '../components/PackageCard'
import { ServiceCard } from '../components/ServiceCard'
import { packages } from '../content/packages'
import { services, serviceCategories } from '../content/services'
import { useOrder } from '../features/order/OrderContext'

type Tab = 'packages' | 'services'

const tabs: { id: Tab; label: string }[] = [
  { id: 'packages', label: 'Пакеты' },
  { id: 'services', label: 'Отдельные услуги' },
]

export default function ServicesPage() {
  const { open } = useOrder()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'services' ? 'services' : 'packages'

  const select = (next: Tab) => {
    setParams(next === 'packages' ? {} : { tab: next }, { replace: true })
  }

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Услуги и цены"
        title="Пакеты обслуживания и отдельные услуги"
        subtitle="Пакет закрывает регулярные задачи по фиксированной цене. Отдельные услуги подойдут для разовых задач или как дополнение к пакету."
      />

      <div role="tablist" aria-label="Тип услуг" className="mt-10 inline-flex rounded-full bg-stone-200/70 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => select(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-white text-brand-900 shadow-sm' : 'text-stone-600 hover:text-brand-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'packages' ? (
        <div role="tabpanel" className="mt-10 grid gap-6 lg:grid-cols-3">
          {packages.map((p) => (
            <PackageCard key={p.slug} pkg={p} onOrder={open} />
          ))}
        </div>
      ) : (
        <div role="tabpanel" className="mt-10 space-y-14">
          {serviceCategories.map((category) => (
            <section key={category}>
              <h2 className="text-2xl font-bold text-brand-900">{category}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services
                  .filter((s) => s.category === category)
                  .map((s) => (
                    <ServiceCard key={s.slug} service={s} onOrder={open} />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Container>
  )
}
