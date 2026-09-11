import { Check } from 'lucide-react'
import type { OrderItem, Package } from '../content/types'
import { formatPrice } from '../lib/format'
import { Button } from './Button'

export function PackageCard({ pkg, onOrder }: { pkg: Package; onOrder: (item: OrderItem) => void }) {
  const popular = Boolean(pkg.popular)
  return (
    <article
      className={`group relative flex h-full flex-col rounded-3xl bg-white p-7 transition-[box-shadow,--tw-ring-color] duration-300 hover:shadow-card-hover ${
        popular ? 'shadow-card-hover ring-2 ring-gold-500' : 'shadow-card ring-1 ring-stone-200/80 hover:ring-gold-500'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-gold-700 px-3 py-1 text-xs font-semibold text-white">
          Популярный
        </span>
      )}
      <h3 id={`package-${pkg.slug}-name`} className="text-xl font-bold text-brand-900">{pkg.name}</h3>
      <p className="mt-1 text-sm text-stone-600">{pkg.audience}</p>
      <p className="mt-5 text-3xl font-extrabold tabular-nums text-brand-900">
        от {formatPrice(pkg.pricePerMonth)}
        <span className="text-base font-medium text-stone-500"> / месяц</span>
      </p>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm text-stone-700">
        {pkg.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 shrink-0 text-gold-700" size={16} aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        className="mt-7 w-full"
        variant={popular ? 'primary' : 'secondary'}
        aria-describedby={`package-${pkg.slug}-name`}
        onClick={() => onOrder({ kind: 'package', slug: pkg.slug, name: pkg.name })}
      >
        Заказать
      </Button>
    </article>
  )
}
