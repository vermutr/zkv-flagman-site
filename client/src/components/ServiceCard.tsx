import type { OrderItem, Service } from '../content/types'
import { formatPrice } from '../lib/format'
import { Button } from './Button'

type Props = { service: Service; onOrder: (item: OrderItem) => void; onDetails: (service: Service) => void }

export function ServiceCard({ service, onOrder, onDetails }: Props) {
  return (
    <article className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-stone-200">
      <h3 id={`service-${service.slug}-name`} className="font-bold text-brand-900">{service.name}</h3>
      <p className="mt-2 flex-1 text-sm text-stone-600">{service.description}</p>
      <p className="mt-4 text-lg font-extrabold tabular-nums text-brand-900">
        от {formatPrice(service.priceFrom)}
        {service.unit && <span className="text-sm font-medium text-stone-500"> {service.unit}</span>}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" aria-describedby={`service-${service.slug}-name`} onClick={() => onDetails(service)}>
          Подробнее
        </Button>
        <Button
          aria-describedby={`service-${service.slug}-name`}
          onClick={() => onOrder({ kind: 'service', slug: service.slug, name: service.name })}
        >
          Заказать
        </Button>
      </div>
    </article>
  )
}
