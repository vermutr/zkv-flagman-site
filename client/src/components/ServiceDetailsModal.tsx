import { Check } from 'lucide-react'
import type { OrderItem, Service } from '../content/types'
import { formatPrice } from '../lib/format'
import { Button } from './Button'
import { Modal } from './Modal'

type Props = {
  service: Service | null
  onClose: () => void
  onOrder: (item: OrderItem) => void
}

/** Окно «Подробнее»: полное описание услуги и переход к форме заказа. */
export function ServiceDetailsModal({ service, onClose, onOrder }: Props) {
  return (
    <Modal
      open={service !== null}
      onClose={onClose}
      title={service?.name ?? ''}
      footer={
        service && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-lg font-extrabold tabular-nums text-brand-900">
              от {formatPrice(service.priceFrom)}
              {service.unit && <span className="text-sm font-medium text-stone-500"> {service.unit}</span>}
            </p>
            <Button
              size="lg"
              onClick={() => {
                onClose()
                onOrder({ kind: 'service', slug: service.slug, name: service.name })
              }}
            >
              Заказать услугу
            </Button>
          </div>
        )
      }
    >
      {service && (
        <div className="space-y-6">
          <div className="space-y-4 leading-relaxed text-stone-700">
            {service.details.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {service.includes && (
            <section>
              <h3 className="font-bold text-brand-900">Что входит</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                {service.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 shrink-0 text-accent-700" size={16} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {service.benefits && (
            <section>
              <h3 className="font-bold text-brand-900">Почему мы</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-stone-700">
                {service.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Modal>
  )
}
